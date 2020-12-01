import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useState, useContext} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle} from "react-icons/fi";

import augustLogoSolidSquare from "../img/august-logo-solid-square.svg";
import {UserContext} from "../providers/UserProvider";

function AddAugustAccount(props) {
    function setInitialState() {
        setCredentials({
            airbnbUsername: "",
            airbnbPassword: ""
        });
        setAccountVerificationData({
            verificationCodeSent: false,
            verificationCode: ""
        });
        setErrors({});
        setShowSpinner(false);
    }

    const {updateUser} = useContext(UserContext);

    const {hideCloseButtons, onHide} = props;
    const [accountVerificationData, setAccountVerificationData] = useState({
        verificationCodeSent: false,
        verificationCode: ""
    });
    const {verificationCodeSent, verificationCode} = accountVerificationData;

    let airbnbUsername = "";
    if (props.credentials && props.credentials.airbnbUsername) {
        airbnbUsername = props.credentials.airbnbUsername;
    }

    const [credentials, setCredentials] = useState({
        airbnbUsername,
        airbnbPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState(false);

    async function hideAddAccount(isSuccess) {
        try {
            // Needs to be === true because sometimes isSuccess can be an event object which we don't want
            if (isSuccess === true) {
                const tagManagerArgs = {
                    dataLayer: {
                        event: "August Added Event",
                        category: "august",
                        action: "account",
                        label: "added",
                        value: 0
                    }
                };
                TagManager.dataLayer(tagManagerArgs);

                ReactPixel.fbq("track", "AugustAccountAdded", {
                    currency: "USD",
                    value: "0.00"
                });

                // eslint-disable-next-line no-undef
                __insp.push(["tagSession", "August Added Event"]);
                await updateUser(20);
            }
            await onHide(isSuccess);
            setInitialState();
        } catch (error) {
            console.error("error", error);
        }
    }

    async function handleResponse(response) {
        const data = await response.json();
        const statusCode = response.status;
        // const verificationCode = "";
        // const verificationCodeSent = false;
        // There was an issue signing into August
        if (statusCode === 420) {
            await setAccountVerificationData({verificationCode: "", verificationCodeSent: true});
        } else if (statusCode === 409) {
            const errors = {};
            errors.error = data.error;
            await setErrors(errors);
        } else if (statusCode === 401) {
            await setAccountVerificationData({verificationCode: "", verificationCodeSent: false});
            const errors = {};
            errors.error = data.error;
            await setErrors(errors);
        } else {
            const errors = {};
            // It's not an verification response
            if (data && data.error) {
                if (data.error.error_message) {
                    errors.error = data.error.error_message;
                } else if (typeof data.error === "string") {
                    errors.error = data.error;
                }
            }
            await setErrors(errors);
        }
        setShowSpinner(false);
    }

    function handleChangeCredentials(field, value) {
        const newCredentials = {};
        if (field === "airbnbUsername") {
            newCredentials[field] = value.trim();
        } else {
            newCredentials[field] = value;
        }
        setCredentials(credentials => {
            return {...credentials, ...newCredentials};
        });
    }

    function validateCredentials() {
        const errors = {};
        let formIsValid = true;
        if (!credentials.airbnbUsername) {
            formIsValid = false;
            errors.airbnbUsername = "Please enter your August username.";
        } else {
            const re = /\S+@\S+\.\S+/;
            const validEmail = re.test(credentials.airbnbUsername);
            if (!validEmail) {
                formIsValid = false;
                errors.airbnbUsername = "Please enter a valid email address.";
            }
        }
        if (!credentials.airbnbPassword || credentials.airbnbPassword.length === 0) {
            formIsValid = false;
            errors.airbnbPassword = "Please enter your August password.";
        }
        setErrors(errors);
        return formIsValid;
    }

    async function submitAddAccount() {
        try {
            if (showSpinner) {
                return;
            }
            await setShowSpinner(true);
            if (validateCredentials()) {
                // const statusCode = 200;
                const verificationCodeSent = false;
                const verificationCode = "";
                setAccountVerificationData({
                    verificationCodeSent,
                    verificationCode
                });
                await setErrors({});
                const url = "/addAugustAccount";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(credentials)
                });
                if (response.ok) {
                    hideAddAccount(true);
                } else {
                    await handleResponse(response);
                }
            } else {
                setShowSpinner(false);
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    async function submitAccountVerification() {
        try {
            if (showSpinner) {
                return;
            }
            setErrors({});
            setShowSpinner(true);
            const url = "/verifyAugustAccount";
            const fields = {...credentials, ...{verificationCode}};
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                return response;
            }
            await handleResponse(response);
        } catch (error) {
            console.error("error", error);
        }
    }

    function handleChangeVerificationCode(verificationCode) {
        setAccountVerificationData({
            ...accountVerificationData,
            ...{verificationCode}
        });
    }

    function validateVerificationCode() {
        const errors = {};
        let formIsValid = true;
        if (!verificationCode) {
            formIsValid = false;
            errors.verificationCode = "Please enter the verification code that was sent to you.";
        }
        setErrors(errors);
        return formIsValid;
    }

    async function submitVerificationCode() {
        if (validateVerificationCode()) {
            try {
                const response = await submitAccountVerification();
                if (response) {
                    if (response.ok) {
                        await hideAddAccount(true);
                    } else {
                        await handleResponse(response);
                    }
                }
            } catch (error) {
                console.error("error", error);
            }
        }
    }

    const usernameOverlay = (
        <Tooltip>Enter the email address you use to login to your August Account.</Tooltip>
    );
    const passwordOverlay = <Tooltip>Enter your August password.</Tooltip>;
    const verificationCodeOverlay = (
        <Tooltip>Enter the verification code that was sent to you by August</Tooltip>
    );
    const usernameClasses = classNames("form-control", {
        "is-invalid": errors.airbnbUsername
    });
    const passwordClasses = classNames("form-control", {
        "is-invalid": errors.airbnbPassword
    });
    const verificationCodeClasses = classNames("form-control", {
        "is-invalid": errors.verificationCode
    });
    const showUsernamePassword = !verificationCodeSent;
    if (showUsernamePassword) {
        return (
            <form>
                <Modal.Header closeButton={!hideCloseButtons}>
                    <Modal.Title>Link August Account</Modal.Title>
                </Modal.Header>

                <Modal.Body className="pd-20 pd-sm-40">
                    <p>
                        Host Tools will request an authentication token that will be used to
                        automatically send messages to your guests or set your listing&apos;s prices
                        on your behalf. It will only send messages you tell it to send and will
                        never make any changes to your account without your permission.
                    </p>
                    <p>
                        All network traffic is encrypted on Host Tools and all data is stored using
                        the latest compliance standards.
                    </p>
                    <div className="pd-md-20">
                        <div className="mg-b-20 d-flex justify-content-start align-items-center">
                            <img
                                src={augustLogoSolidSquare}
                                alt="August Smart Locks"
                                className="rounded-circle mg-r-20"
                                height="65"
                            />
                            <div>
                                <h2 className="mg-b-0">August Account</h2>
                                <span className="text-muted text-uppercase tx-11">
                                    Link your account with August credentials
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label
                                htmlFor="username"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                August Email
                                <OverlayTrigger placement="top" overlay={usernameOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="username"
                                className={usernameClasses}
                                placeholder="August Email..."
                                name="username"
                                type="text"
                                autoComplete="off"
                                value={credentials.airbnbUsername}
                                onChange={event => {
                                    handleChangeCredentials("airbnbUsername", event.target.value);
                                }}
                                required
                                disabled={props.credentials && props.credentials.airbnbUsername}
                            />
                            {errors.airbnbUsername && (
                                <div className="alert alert-danger">{errors.airbnbUsername}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label
                                htmlFor="password"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                August Password
                                <OverlayTrigger placement="top" overlay={passwordOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="password"
                                className={passwordClasses}
                                placeholder="August Password..."
                                name="password"
                                type="password"
                                autoComplete="off"
                                value={credentials.airbnbPassword}
                                onChange={event => {
                                    handleChangeCredentials("airbnbPassword", event.target.value);
                                }}
                                required
                            />
                            {errors.airbnbPassword && (
                                <div className="alert alert-danger">{errors.airbnbPassword}</div>
                            )}
                        </div>
                    </div>
                    {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                </Modal.Body>

                <Modal.Footer>
                    {!hideCloseButtons && (
                        <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={hideAddAccount}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={submitAddAccount}
                    >
                        {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                        Add Account
                    </button>
                </Modal.Footer>
            </form>
        );
    }
    return (
        <form>
            <Modal.Header closeButton>
                <Modal.Title>Verify August Account</Modal.Title>
            </Modal.Header>

            <Modal.Body className="pd-20 pd-sm-40">
                <p>August has sent you a code using the method you chose, please enter it below.</p>
                <div className="pd-md-20">
                    <div className="form-group">
                        <label
                            htmlFor="verificationCode"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            August Verification Code
                            <OverlayTrigger placement="top" overlay={verificationCodeOverlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        </label>
                        <input
                            id="verificationCode"
                            className={verificationCodeClasses}
                            placeholder="August Verification Code..."
                            name="verificationCode"
                            type="text"
                            autoComplete="off"
                            value={verificationCode}
                            onChange={event => {
                                handleChangeVerificationCode(event.target.value);
                            }}
                        />
                        {errors.verificationCode && (
                            <div className="alert alert-danger">{errors.verificationCode}</div>
                        )}
                    </div>
                </div>
                {errors.error && <div className="alert alert-danger">{errors.error}</div>}
            </Modal.Body>
            <Modal.Footer>
                {!hideCloseButtons && (
                    <button type="button" className="btn btn-outline-dark" onClick={hideAddAccount}>
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={submitVerificationCode}
                >
                    {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                    Next
                </button>
            </Modal.Footer>
        </form>
    );
}

AddAugustAccount.propTypes = {
    onHide: PropTypes.func.isRequired,
    hideCloseButtons: PropTypes.bool,
    credentials: PropTypes.shape({
        airbnbUsername: PropTypes.string,
        airbnbPassword: PropTypes.string
    })
};

AddAugustAccount.defaultProps = {
    credentials: {
        airbnbUsername: "",
        airbnbPassword: ""
    },
    hideCloseButtons: false
};

export default AddAugustAccount;
