import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useState, useContext} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle, FiMessageSquare, FiPhone} from "react-icons/fi";

import vrboLogoSolidSquare from "../img/vrbo-logo-solid-square.svg";
import {UserContext} from "../providers/UserProvider";

function AddHomeAwayAccount(props) {
    function setInitialState() {
        setCredentials({
            airbnbUsername: "",
            airbnbPassword: "",
            recaptchaToken: ""
        });
        setAccountVerificationData({});
        setErrors({});
        setShowSpinner(false);
    }

    const {updateUser} = useContext(UserContext);

    const {hideCloseButtons, onHide} = props;
    const [accountVerificationData, setAccountVerificationData] = useState(false);
    const {
        verificationMethods,
        verificationCodeSent,
        verificationIndex,
        verificationCode,
        verificationType,
        verificationID
    } = accountVerificationData;

    let airbnbUsername = "";
    if (props.credentials && props.credentials.airbnbUsername) {
        airbnbUsername = props.credentials.airbnbUsername;
    }

    const [credentials, setCredentials] = useState({
        airbnbUsername,
        airbnbPassword: "",
        recaptchaToken: ""
    });
    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState(false);

    async function hideAddAccount(isSuccess) {
        try {
            // Needs to be === true because sometimes isSuccess can be an event object which we don't want
            if (isSuccess === true) {
                const tagManagerArgs = {
                    dataLayer: {
                        event: "HomeAway Added Event",
                        category: "homeaway",
                        action: "account",
                        label: "added",
                        value: 0
                    }
                };
                TagManager.dataLayer(tagManagerArgs);

                ReactPixel.fbq("track", "HomeAwayAccountAdded", {
                    currency: "USD",
                    value: "0.00"
                });

                // eslint-disable-next-line no-undef
                __insp.push(["tagSession", "HomeAway Added Event"]);
                await updateUser(20);
            }
            onHide(isSuccess);
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
        // There was an issue signing into HomeAway
        // 420 account verification
        // 421 the supplied verification code was incorrect
        // 400 bad credentials or general error
        if (statusCode === 420) {
            const {phones, verificationID} = data.error;
            await setAccountVerificationData({
                ...accountVerificationData,
                ...{
                    verificationID,
                    verificationMethods: phones
                }
            });
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
            errors.airbnbUsername = "Please enter your VRBO username.";
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
            errors.airbnbPassword = "Please enter your VRBO password.";
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
                const verificationID = "";
                const verificationMethods = false;
                const verificationCodeSent = false;
                const verificationCode = "";
                setAccountVerificationData({
                    verificationID,
                    verificationMethods,
                    verificationCodeSent,
                    verificationCode
                });
                await setErrors({});
                const url = "/addHomeAwayAccount";
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

    function handleChangeVerificationIndex(verificationIndex, verificationType) {
        setAccountVerificationData({
            ...accountVerificationData,
            ...{
                verificationIndex,
                verificationType
            }
        });
    }

    function validateVerificationIndex() {
        const errors = {};
        let formIsValid = true;
        if (!verificationIndex && verificationIndex !== 0) {
            formIsValid = false;
            errors.error = "Please select a verification phone number";
        }
        setErrors(errors);
        return formIsValid;
    }

    async function submitAccountVerification() {
        try {
            if (showSpinner) {
                return;
            }
            if (validateVerificationIndex()) {
                setErrors({});
                setShowSpinner(true);
                const url = "/verifyHomeAwayAccount";
                const fields = {
                    verificationIndex,
                    verificationType,
                    verificationCode,
                    verificationID
                };
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                return response;
            }
            return;
        } catch (error) {
            console.error("error", error);
        }
    }

    async function submitPhoneVerification() {
        try {
            const response = await submitAccountVerification();
            if (response) {
                setShowSpinner(false);
                if (response.ok) {
                    const data = await response.json();
                    if (data === "Verification code sent") {
                        const verificationCodeSent = true;
                        setAccountVerificationData({
                            ...accountVerificationData,
                            ...{verificationCodeSent}
                        });
                    }
                } else {
                    await handleResponse(response);
                }
            }
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
                    const verificationCode = "";
                    setAccountVerificationData({
                        ...accountVerificationData,
                        ...{verificationCode}
                    });
                    if (response.ok) {
                        hideAddAccount(true);
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
        <Tooltip>Enter the email address you use to login to your VRBO Account.</Tooltip>
    );
    const passwordOverlay = <Tooltip>Enter your VRBO password.</Tooltip>;
    const verificationCodeOverlay = (
        <Tooltip>Enter the verification code that was sent to you by VRBO</Tooltip>
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
    const showUsernamePassword = !verificationMethods;
    const showPhones = !verificationCodeSent;
    if (showUsernamePassword) {
        return (
            <form>
                <Modal.Header closeButton={!hideCloseButtons}>
                    <Modal.Title>Link VRBO Account</Modal.Title>
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
                                src={vrboLogoSolidSquare}
                                alt="VRBO"
                                className="rounded-circle mg-r-20"
                                height="65"
                            />
                            <div>
                                <h2 className="mg-b-0">VRBO Account</h2>
                                <span className="text-muted text-uppercase tx-11">
                                    Link your account with VRBO credentials
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label
                                htmlFor="username"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                VRBO Email
                                <OverlayTrigger placement="top" overlay={usernameOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="username"
                                className={usernameClasses}
                                placeholder="VRBO Email..."
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
                                VRBO Password
                                <OverlayTrigger placement="top" overlay={passwordOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="password"
                                className={passwordClasses}
                                placeholder="VRBO Password..."
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
                            onClick={() => {
                                hideAddAccount(true);
                            }}
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
    if (showPhones) {
        return (
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>Verify VRBO Account</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pd-20 pd-sm-40">
                    <p>
                        VRBO wants to verify your account. Please choose from one of the options
                        below.
                    </p>
                    <div className="pd-md-20">
                        <div className="form-group">
                            {verificationMethods.map((verificationMethod, index) => {
                                return ["SMS", "CALL"].map((type, index) => {
                                    return (
                                        <label
                                            key={type + verificationMethod.phone}
                                            className="rdiobox"
                                        >
                                            <input
                                                id={verificationMethod.phone}
                                                type="radio"
                                                name="radio"
                                                value={index}
                                                checked={verificationIndex === index}
                                                onChange={() => {
                                                    handleChangeVerificationIndex(index, type);
                                                }}
                                            />
                                            {type === "SMS" && (
                                                <span>
                                                    <FiMessageSquare className="mr-1" />
                                                    {`Confirm via an SMS message set to ${verificationMethod.phone}`}
                                                </span>
                                            )}
                                            {type === "CALL" && (
                                                <span>
                                                    <FiPhone className="mr-1" />
                                                    {`Confirm via a phone call to ${verificationMethod.phone}`}
                                                </span>
                                            )}
                                        </label>
                                    );
                                });
                            })}
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
                        onClick={submitPhoneVerification}
                    >
                        {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                        Next
                    </button>
                </Modal.Footer>
            </form>
        );
    }
    return (
        <form>
            <Modal.Header closeButton>
                <Modal.Title>Verify VRBO Account</Modal.Title>
            </Modal.Header>

            <Modal.Body className="pd-20 pd-sm-40">
                <p>VRBO has sent you a code using the method you chose, please enter it below.</p>
                <div className="pd-md-20">
                    <div className="form-group">
                        <label
                            htmlFor="verificationCode"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            VRBO Verification Code
                            <OverlayTrigger placement="top" overlay={verificationCodeOverlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        </label>
                        <input
                            id="verificationCode"
                            className={verificationCodeClasses}
                            placeholder="VRBO Verification Code..."
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

AddHomeAwayAccount.propTypes = {
    onHide: PropTypes.func.isRequired,
    hideCloseButtons: PropTypes.bool,
    credentials: PropTypes.shape({
        airbnbUsername: PropTypes.string,
        airbnbPassword: PropTypes.string
    })
};

AddHomeAwayAccount.defaultProps = {
    credentials: {
        airbnbUsername: "",
        airbnbPassword: ""
    },
    hideCloseButtons: false
};

export default AddHomeAwayAccount;
