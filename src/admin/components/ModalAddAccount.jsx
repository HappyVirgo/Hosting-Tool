import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {Modal} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";

import airbnbLogo from "../img/airbnb-logo.svg";
import vrboLogo from "../img/vrbo-logo.svg";
import {UserConsumer} from "../providers/UserProvider";

import AddAirbnbAccount from "./AddAirbnbAccount";
import AddHomeAwayAccount from "./AddHomeAwayAccount";
import AddAugustAccount from "./AddAugustAccount";

function ModalAddAccount(props) {
    const {show, onHide, hideCloseButtons, credentials, updateUser, user} = props;
    const [channel, setChannel] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            loadInspectlet();
            loadHotJar();
            // loadSmartLook();
            const {
                credentials: {type}
            } = props;
            let channel = "";
            let selectedChannel = "";
            if (type) {
                channel = type;
                selectedChannel = type;
            }
            setChannel(channel);
            setSelectedChannel(selectedChannel);
        }
    }, [show]);

    function loadInspectlet() {
        // eslint-disable-next-line no-underscore-dangle
        window.__insp = window.__insp || [];
        // eslint-disable-next-line no-undef
        __insp.push(["wid", 1206788301]);
        // eslint-disable-next-line no-undef
        __insp.push(["tagSession", "Airbnb"]);
        // eslint-disable-next-line no-undef
        __insp.push(["identify", user.username]);
        const ldinsp = () => {
            // eslint-disable-next-line no-underscore-dangle
            if (typeof window.__inspld != "undefined") return;
            // eslint-disable-next-line no-underscore-dangle
            window.__inspld = 1;
            const insp = document.createElement("script");
            insp.type = "text/javascript";
            insp.async = true;
            insp.id = "inspsync";
            insp.src = `${
                // eslint-disable-next-line eqeqeq
                document.location.protocol == "https:" ? "https" : "http"
            }://cdn.inspectlet.com/inspectlet.js?wid=1206788301&r=${Math.floor(
                new Date().getTime() / 3600000
            )}`;
            const x = document.getElementsByTagName("script")[0];
            x.parentNode.insertBefore(insp, x);
        };
        setTimeout(ldinsp, 0);
    }

    // eslint-disable-next-line class-methods-use-this
    function loadHotJar() {
        // eslint-disable-next-line func-names
        (function (h, o, t, j, a, r) {
            h.hj =
                h.hj ||
                // eslint-disable-next-line func-names
                function () {
                    // eslint-disable-next-line prefer-rest-params
                    (h.hj.q = h.hj.q || []).push(arguments);
                };
            // eslint-disable-next-line no-underscore-dangle
            h._hjSettings = {hjid: 1683480, hjsv: 6};
            // eslint-disable-next-line prefer-destructuring
            a = o.getElementsByTagName("head")[0];
            r = o.createElement("script");
            r.async = 1;
            // eslint-disable-next-line no-underscore-dangle
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
    }

    //  function loadSmartLook() {
    //     window.smartlook ||
    //         (function(d) {
    //             var o = (smartlook = function() {
    //                 o.api.push(arguments);
    //             });
    //             const h = d.getElementsByTagName("head")[0];
    //             const c = d.createElement("script");
    //             o.api = new Array();
    //             c.async = true;
    //             c.type = "text/javascript";
    //             c.charset = "utf-8";
    //             c.src = "https://rec.smartlook.com/recorder.js";
    //             h.appendChild(c);
    //         })(document);
    //     smartlook("init", "44686d86b7f0014741e8b1ae9932d0af1d5f59e6");
    //     smartlook("identify", user.username, {
    //         name: `${user.firstName} ${user.lastName}`,
    //         email: user.username
    //     });
    // }

    function handleToggle(selectedChannel) {
        setSelectedChannel(selectedChannel);
    }

    function selectChannel() {
        if (selectedChannel === "") {
            const newErrors = {};
            newErrors.error = "Please select a channel.";
            setErrors(errors => {
                return {...errors, ...newErrors};
            });
        } else {
            const newErrors = {};
            newErrors.error = "";
            setErrors(errors => {
                return {...errors, ...newErrors};
            });
            setChannel(selectedChannel);
        }
    }

    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            {channel === "Airbnb" && (
                <AddAirbnbAccount
                    onHide={onHide}
                    hideCloseButtons={hideCloseButtons}
                    credentials={credentials}
                    updateUser={updateUser}
                    user={user}
                />
            )}
            {channel === "HomeAway" && (
                <AddHomeAwayAccount
                    onHide={onHide}
                    hideCloseButtons={hideCloseButtons}
                    credentials={credentials}
                    updateUser={updateUser}
                    user={user}
                />
            )}
            {channel === "August" && (
                <AddAugustAccount
                    onHide={onHide}
                    hideCloseButtons={hideCloseButtons}
                    credentials={credentials}
                    updateUser={updateUser}
                    user={user}
                />
            )}
            {channel === "" && (
                <form>
                    <Modal.Header closeButton={!hideCloseButtons}>
                        <Modal.Title>Link Account</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="pd-20 pd-sm-40">
                        <p>
                            Host Tools links with channels like Airbnb and VRBO to automate the
                            management of your listing.
                        </p>
                        <p>Please select a channel you would like to link with Host Tools.</p>
                        <div className="form-group mg-t-50">
                            <div className="row">
                                <div className="col-4 d-flex justify-content-end align-items-center">
                                    <label className="ckbox">
                                        <input
                                            id="selectedChannelAirbnb"
                                            data-testid="airbnb-checkbox"
                                            type="checkbox"
                                            checked={selectedChannel === "Airbnb"}
                                            onChange={() => {
                                                handleToggle("Airbnb");
                                            }}
                                        />
                                        <span />
                                    </label>
                                </div>
                                <div
                                    data-testid="aribnb-logo-wrapper"
                                    className="col-8 d-flex justify-content-start align-items-center c-pointer"
                                    onClick={() => {
                                        handleToggle("Airbnb");
                                    }}
                                    onKeyPress={() => {
                                        handleToggle("Airbnb");
                                    }}
                                    role="presentation"
                                >
                                    <img src={airbnbLogo} alt="Airbnb" height="35" />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-4 d-flex justify-content-end align-items-center">
                                    <label className="ckbox">
                                        <input
                                            id="selectedChannelHomeAway"
                                            data-testid="homeaway-checkbox"
                                            type="checkbox"
                                            checked={selectedChannel === "HomeAway"}
                                            onChange={() => {
                                                handleToggle("HomeAway");
                                            }}
                                        />
                                        <span />
                                    </label>
                                </div>
                                <div
                                    data-testid="homeaway-logo-wrapper"
                                    className="col-8 d-flex justify-content-start align-items-center c-pointer"
                                    onClick={() => {
                                        handleToggle("HomeAway");
                                    }}
                                    onKeyPress={() => {
                                        handleToggle("HomeAway");
                                    }}
                                    role="presentation"
                                >
                                    <img src={vrboLogo} alt="VRBO" height="35" />
                                </div>
                            </div>
                        </div>
                        {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                    </Modal.Body>

                    <Modal.Footer>
                        {!hideCloseButtons && (
                            <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                                Cancel
                            </button>
                        )}
                        <button
                            data-testid="btn-next"
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={selectChannel}
                        >
                            {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                            Next
                        </button>
                    </Modal.Footer>
                </form>
            )}
        </Modal>
    );
}

ModalAddAccount.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    hideCloseButtons: PropTypes.bool,
    credentials: PropTypes.shape({
        type: PropTypes.string,
        airbnbUsername: PropTypes.string,
        airbnbPassword: PropTypes.string
    }),
    updateUser: PropTypes.func.isRequired,
    user: PropTypes.shape({
        username: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string
    }).isRequired
};

ModalAddAccount.defaultProps = {
    credentials: {
        type: "",
        airbnbUsername: "",
        airbnbPassword: ""
    },
    hideCloseButtons: false
};

const ConnectedModalAddAccount = props => (
    <UserConsumer>
        {({user, updateUser}) => <ModalAddAccount {...props} user={user} updateUser={updateUser} />}
    </UserConsumer>
);
export default ConnectedModalAddAccount;
