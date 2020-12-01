import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useState, useEffect, useContext} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {FiExternalLink, FiHelpCircle, FiMail, FiMessageSquare, FiPhone} from "react-icons/fi";
import {load} from "recaptcha-v3";

import airbnbLogoSolidSquare from "../img/airbnb-logo-solid-square.svg";
import {UserContext} from "../providers/UserProvider";

function AddAirbnbAccount(props) {
    function setInitialState() {
        setCredentials({
            airbnbUsername: "",
            airbnbPassword: "",
            recaptchaToken: ""
        });
        setAccountVerificationData({});
        setErrors({});
        setShowSpinner(false);
        setIsCaptchaClicked(false);
    }

    const {updateUser} = useContext(UserContext);

    const {hideCloseButtons, onHide} = props;
    const [addAccountErrorStatusCode, setAddAccountErrorStatusCode] = useState(false);
    const [addAccountLoginType, setAddAccountLoginType] = useState(false);
    const [addAccountVerificationMethods, setAddAccountVerificationMethods] = useState(false);
    const [addAccountVerificationCodeSent, setAddAccountVerificationCodeSent] = useState(false);
    const [accountVerificationData, setAccountVerificationData] = useState(false);
    const [addAccountVerificationID, setAddAccountVerificationID] = useState(false);

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
    const [isCaptchaClicked, setIsCaptchaClicked] = useState(false);

    useEffect(() => {
        loadRecaptcha();
    }, []);

    async function loadRecaptcha() {
        const recaptcha = await load("6LflNKsUAAAAAJZAn48kK7mF-KMioLD3aLZm0thD", {
            autoHideBadge: true
        });
        const token = await recaptcha.execute("validate_captcha");
        setCredentials(credentials => {
            return {...credentials, ...{recaptchaToken: token}};
        });
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

    function handleChangeVerificationCode(field, value) {
        const newAccountVerificationData = {};
        newAccountVerificationData[field] = value;
        setAccountVerificationData(accountVerificationData => {
            return {...accountVerificationData, ...newAccountVerificationData};
        });
    }

    async function hideAddAccount(isSuccess) {
        try {
            // Needs to be === true because sometimes isSuccess can be an event object which we don't want
            if (isSuccess === true) {
                const tagManagerArgs = {
                    dataLayer: {
                        event: "Airbnb Added Event",
                        category: "airbnb",
                        action: "account",
                        label: "added",
                        value: 0
                    }
                };
                TagManager.dataLayer(tagManagerArgs);

                ReactPixel.fbq("track", "AirbnbAccountAdded", {
                    currency: "USD",
                    value: "0.00"
                });

                // eslint-disable-next-line no-undef
                __insp.push(["tagSession", "Airbnb Added Event"]);
                await updateUser(20);
            }
            onHide(isSuccess);
            setInitialState();
        } catch (error) {
            console.error("error", error);
        }
    }

    async function submitAddAccount() {
        try {
            if (showSpinner) {
                return;
            }
            const addAccountErrorStatusCode = 200;
            const addAccountLoginType = false;
            const addAccountVerificationMethods = false;
            const addAccountVerificationCodeSent = false;
            await setShowSpinner(true);
            await setIsCaptchaClicked(false);
            if (validateAddAccount()) {
                await setErrors({});
                await setAddAccountErrorStatusCode(addAccountErrorStatusCode);
                await setAddAccountLoginType(addAccountLoginType);
                await setAddAccountVerificationMethods(addAccountVerificationMethods);
                await setAddAccountVerificationCodeSent(addAccountVerificationCodeSent);

                const url = "/addAirbnbAccount";
                const fields = credentials;
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                if (response.ok) {
                    hideAddAccount(true);
                } else {
                    const data = await response.json();
                    await setAddAccountErrorStatusCode(response.status);
                    await setShowSpinner(false);
                    // There was an issue signing into Airbnb
                    // 420 account verification
                    // 403 might login using something other than email/password
                    // 400 bad credentials
                    if (data && data.error && data.error.id) {
                        const addAccountVerificationID = data.error.id;
                        const addAccountVerificationMethods = data.error.verificationMethods;
                        await setAddAccountVerificationMethods(addAccountVerificationMethods);
                        await setAddAccountVerificationID(addAccountVerificationID);
                    } else {
                        let addAccountLoginType = false;
                        // It's not an verification response
                        const errors = {};
                        if (data && data.error) {
                            if (data.error.error_message) {
                                errors.error = data.error.error_message;
                            } else if (typeof data.error === "string") {
                                errors.error = data.error;
                            } else if (data.error.account_type) {
                                addAccountLoginType = data.error.account_type;
                            } else {
                                errors.error =
                                    "Please 'Confirm Your Account' again.  Sometimes Airbnb requires that you confirm your account a few times.";
                            }
                        }
                        await setErrors(errors);
                        await setAddAccountLoginType(addAccountLoginType);
                    }
                }
            } else {
                await setShowSpinner(false);
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    function validateAddAccount() {
        const errors = {};
        let formIsValid = true;
        if (!credentials.airbnbUsername) {
            formIsValid = false;
            errors.airbnbUsername = "Please enter your Airbnb username.";
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
            errors.airbnbPassword = "Please enter your Airbnb password.";
        }
        setErrors(errors);
        return formIsValid;
    }

    function handleRadio(index) {
        setAccountVerificationData(accountVerificationData => {
            return {...accountVerificationData, ...{verificationMethod: index}};
        });
    }

    async function submitAccountVerification(addAccountVerificationID) {
        try {
            if (showSpinner) {
                return;
            }
            if (validateAccountVerification()) {
                await setShowSpinner(true);
                await setAddAccountErrorStatusCode(200);
                await setAccountVerificationData({
                    ...accountVerificationData,
                    ...{id: addAccountVerificationID}
                });
                await setAddAccountVerificationCodeSent(false);
                const url = "/verifyAirbnbAccount";
                const fields = {...accountVerificationData, ...{id: addAccountVerificationID}};
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                await setShowSpinner(false);
                if (response.ok) {
                    const data = await response.json();
                    if (data === "Verification code sent") {
                        await setAddAccountVerificationCodeSent(true);
                    }
                } else {
                    const data = await response.json();
                    await setAddAccountErrorStatusCode(response.status);
                    await setShowSpinner(false);
                    // There was an issue signing into Airbnb
                    // 420 account verification
                    // 403 might login using something other than email/password
                    // 400 bad credentials
                    if (response.status === 420) {
                        const addAccountVerificationID = data.error.id;
                        const addAccountVerificationMethods = data.error.verificationMethods;

                        await setAddAccountVerificationID(addAccountVerificationID);
                        await setAddAccountVerificationMethods(addAccountVerificationMethods);
                    } else {
                        const errors = {};
                        let addAccountLoginType = false;
                        // It's not an verification response
                        if (data && data.error) {
                            if (data.error.error_message) {
                                errors.error = data.error.error_message;
                            } else if (typeof data.error === "string") {
                                errors.error = data.error;
                            } else if (data.error.account_type) {
                                addAccountLoginType = data.error.account_type;
                            } else {
                                errors.error =
                                    "Please 'Confirm Your Account' again.  Sometimes Airbnb requires that you confirm your account a few times.";
                            }
                        }
                        await setErrors(errors);
                        await setAddAccountLoginType(addAccountLoginType);
                    }
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    function validateAccountVerification() {
        const errors = {};
        let formIsValid = true;
        if (
            (accountVerificationData.verificationMethod === "" ||
                !accountVerificationData.verificationMethod) &&
            accountVerificationData.verificationMethod !== 0
        ) {
            formIsValid = false;
            errors.error = "Please select a verification method";
        }
        setErrors(errors);
        return formIsValid;
    }

    // It's not clear to me why I need to pass addAccountVerificationID to submitCaptcha but if I don't it's undefined.
    async function submitCaptcha(addAccountVerificationID) {
        try {
            if (showSpinner) {
                return;
            }
            await setAddAccountErrorStatusCode(200);
            await setShowSpinner(true);
            await setAddAccountVerificationCodeSent(false);
            await setErrors({});
            const url = "/verifyAirbnbAccount";
            const fields = {id: addAccountVerificationID, captchaComplete: true};
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            await setShowSpinner(false);
            if (response.ok) {
                const data = await response.json();
                if (data === "success") {
                    hideAddAccount(true);
                    // } else if (data.data === "Captcha Complete") {
                    //     $scope.addAccountVerificationMethods = false;
                }
            } else {
                const data = await response.json();
                const addAccountErrorStatusCode = response.status;
                await setAddAccountErrorStatusCode(addAccountErrorStatusCode);
                await setShowSpinner(false);
                await setIsCaptchaClicked(false);
                // There was an issue signing into Airbnb
                // 420 account verification
                // 403 might login using something other than email/password
                // 400 bad credentials
                if (data && data.error && data.error.id) {
                    const addAccountVerificationID = data.error.id;
                    const addAccountVerificationMethods = data.error.verificationMethods;
                    await setAddAccountVerificationID(addAccountVerificationID);
                    await setAddAccountVerificationMethods(addAccountVerificationMethods);
                } else {
                    const errors = {};
                    let addAccountLoginType = false;
                    // It's not an verification response
                    if (data && data.error) {
                        if (data.error.error_message) {
                            errors.error = data.error.error_message;
                        } else if (typeof data.error === "string") {
                            errors.error = data.error;
                        } else if (data.error.account_type) {
                            addAccountLoginType = data.error.account_type;
                        } else {
                            errors.error =
                                "Please 'Confirm Your Account' again.  Sometimes Airbnb requires that you confirm your account a few times.";
                        }
                    }
                    await setAddAccountVerificationMethods(false);
                    await setAddAccountLoginType(addAccountLoginType);
                    await setErrors(errors);
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    async function submitAccountVerificationCode() {
        try {
            if (showSpinner) {
                return;
            }
            if (validateAccountVerificationCodeVerification()) {
                await setAddAccountErrorStatusCode(200);
                await setShowSpinner(true);

                await setAccountVerificationData({
                    ...accountVerificationData,
                    ...{id: addAccountVerificationID}
                });

                const url = "/verifyAirbnbAccount";
                const fields = accountVerificationData;
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                await setShowSpinner(false);
                await setAccountVerificationData({
                    ...accountVerificationData,
                    ...{verificationCode: ""}
                });
                await setAddAccountVerificationCodeSent(false);
                if (response.ok) {
                    const data = await response.json();
                    if (data === "success") {
                        hideAddAccount(true);
                    } else {
                        submitAddAccount(true);
                        await setErrors({error: data});
                    }
                } else {
                    const data = await response.json();
                    await setAddAccountErrorStatusCode(response.status);
                    await setShowSpinner(false);
                    // form.$setPristine();
                    // form.$setUntouched();
                    await setAddAccountVerificationCodeSent(false);
                    // There was an issue signing into Airbnb
                    // 420 account verification
                    // 403 might login using something other than email/password
                    // 400 bad credentials
                    if (data && data.error && data.error.id) {
                        const addAccountVerificationID = data.error.id;
                        const addAccountVerificationMethods = data.error.verificationMethods;

                        await setAddAccountVerificationMethods(addAccountVerificationMethods);
                        await setAddAccountVerificationID(addAccountVerificationID);
                    } else {
                        let addAccountLoginType = false;
                        const errors = {};
                        // It's not an verification response
                        if (data && data.error) {
                            if (data.error.error_message) {
                                errors.error = data.error.error_message;
                            } else if (typeof data.error === "string") {
                                errors.error = data.error;
                            } else if (data.error.account_type) {
                                addAccountLoginType = data.error.account_type;
                            } else {
                                errors.error =
                                    "Please 'Confirm Your Account' again.  Sometimes Airbnb requires that you confirm your account a few times.";
                            }
                        }
                        await setAddAccountLoginType(addAccountLoginType);
                        await setErrors(errors);
                    }
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    function validateAccountVerificationCodeVerification() {
        const errors = {};
        let formIsValid = true;
        if (
            !accountVerificationData.verificationCode ||
            accountVerificationData.verificationCode === ""
        ) {
            formIsValid = false;
            errors.verificationCode = "Please enter the verification code that was sent to you.";
        }
        setErrors(errors);
        return formIsValid;
    }

    const airbnbUsernameOverlay = (
        <Tooltip>Enter the email address you use to login to your Airbnb Account.</Tooltip>
    );
    const airbnbPasswordOverlay = <Tooltip>Enter your Airbnb password.</Tooltip>;
    const verificationCodeOverlay = (
        <Tooltip>Enter the verification code that was sent to you by Airbnb</Tooltip>
    );
    const airbnbUsernameClasses = classNames("form-control", {
        "is-invalid": errors.airbnbUsername
    });
    const airbnbPasswordClasses = classNames("form-control", {
        "is-invalid": errors.airbnbPassword
    });
    const verificationCodeClasses = classNames("form-control", {
        "is-invalid": errors.verificationCode
    });
    if (!addAccountVerificationMethods) {
        return (
            <form>
                <Modal.Header closeButton={!hideCloseButtons}>
                    <Modal.Title>Link Airbnb Account</Modal.Title>
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
                    {!showSpinner &&
                        addAccountErrorStatusCode === 403 &&
                        addAccountLoginType === "email" && (
                            <div className="alert alert-danger help-block">
                                <p>Oops. Looks like something went wrong, please try again.</p>
                            </div>
                        )}
                    <div className="pd-md-20">
                        <div className="mg-b-20 d-flex justify-content-start align-items-center">
                            <img
                                src={airbnbLogoSolidSquare}
                                alt="Airbnb"
                                className="rounded-circle mg-r-20"
                                height="65"
                            />
                            <div>
                                <h2 className="mg-b-0">Airbnb Account</h2>
                                <span className="text-muted text-uppercase tx-11">
                                    Link your account with Airbnb credentials
                                </span>
                            </div>
                        </div>

                        {/* <div className="alert alert-danger help-block">
                            Airbnb&apos;s servers are currently experiencing issues and Host Tools
                            is currently experiencing issues authenticating with Airbnb. I am
                            actively monitoring the situation. Sorry for the inconvenience.
                        </div> */}
                        <div className="form-group">
                            <label
                                htmlFor="airbnbUsername"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Airbnb Email
                                <OverlayTrigger placement="top" overlay={airbnbUsernameOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="airbnbUsername"
                                className={airbnbUsernameClasses}
                                placeholder="Airbnb Email..."
                                name="airbnbUsername"
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
                                htmlFor="airbnbPassword"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Airbnb Password
                                <OverlayTrigger placement="top" overlay={airbnbPasswordOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="airbnbPassword"
                                className={airbnbPasswordClasses}
                                placeholder="Airbnb Password..."
                                name="airbnbPassword"
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
                    {!showSpinner &&
                        addAccountErrorStatusCode === 403 &&
                        addAccountLoginType &&
                        addAccountLoginType !== "email" && (
                            <div className="alert alert-danger help-block">
                                <p>
                                    {
                                        "Airbnb is reporting that you use Facebook or Google to sign in to your Airbnb account.  \
                                        To link your Airbnb account with Host Tools you need to reset your Airbnb password.  \
                                        Please reset your password on Airbnb and return here to link your Airbnb account using your new password.  \
                                        You can reset your Airbnb password here "
                                    }
                                    <a
                                        href="https://www.airbnb.com/help/article/76/how-do-i-reset-my-password"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        create a password
                                    </a>
                                    . If you continue to have this issue, please contact Tom at
                                    t@hosttools.com
                                </p>
                            </div>
                        )}
                    {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                    <div className="alert alert-info">
                        {
                            "Do you use Google or Facebook to log into your Airbnb account? To connect an Airbnb property with Host Tools, you'll need to first "
                        }
                        <a
                            href="https://www.airbnb.com/help/article/76/how-do-i-reset-my-password"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            create a password
                        </a>
                        {" for your Airbnb account."}
                    </div>
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
    if (addAccountVerificationMethods && !addAccountVerificationCodeSent) {
        return (
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>Verify Airbnb Account</Modal.Title>
                </Modal.Header>
                {addAccountVerificationMethods[0].type === "captcha" && (
                    <Modal.Body className="pd-20 pd-sm-40">
                        <p>
                            Airbnb wants to confirm that you are a real person and not a robot. Use
                            the button below to confirm it&apos;s you then come back here and click
                            the &apos;Next&apos; button.
                        </p>
                        <p>
                            <strong>
                                Step 1. Click the &apos;Confirm Your Account&apos; button and
                                complete the confirmation on Airbnb.com.
                            </strong>
                        </p>
                        <p>
                            <strong>
                                Step 2. Return to this page and click the &apos;Next&apos; button.
                            </strong>
                        </p>
                        <div className="row">
                            {addAccountVerificationMethods.map((verificationMethod, index) => {
                                return (
                                    <div
                                        className="col-12 text-center"
                                        key={verificationMethod.type}
                                    >
                                        <a
                                            href={`/verifyAirbnbCaptcha/${addAccountVerificationID}`}
                                            onClick={() => {
                                                setIsCaptchaClicked(true);
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                            >
                                                <FiExternalLink className="mr-1" />
                                                Confirm Your Account
                                            </button>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                    </Modal.Body>
                )}
                {addAccountVerificationMethods[0].type === "contact_airbnb" && (
                    <Modal.Body className="pd-20 pd-sm-40">
                        <p>
                            Airbnb is temporarily not allowing third party tools to authenticate
                            with your account. This is typically solved by giving Airbnb a few hours
                            to resolve the issue and then trying again.
                        </p>
                        {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                    </Modal.Body>
                )}
                {addAccountVerificationMethods[0].type === "hard_block_message" && (
                    <Modal.Body className="pd-20 pd-sm-40">
                        <p>
                            Host Tools lost connection with Airbnb&apos;s servers. Please try again.
                            If this issue persists, it&apos;s likely that Airbnb&apos;s servers are
                            experiencing issues or under going maintenance and you should try again
                            in a little while.
                        </p>
                        {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                    </Modal.Body>
                )}
                {addAccountVerificationMethods[0].type !== "captcha" &&
                    addAccountVerificationMethods[0].type !== "contact_airbnb" &&
                    addAccountVerificationMethods[0].type !== "hard_block_message" && (
                        <Modal.Body className="pd-20 pd-sm-40">
                            <p>
                                Airbnb wants to verify your account. Please choose from one of the
                                options below.
                            </p>
                            <div className="row">
                                {addAccountVerificationMethods.map((verificationMethod, index) => {
                                    if (
                                        verificationMethod.type !== "phone_verification_via_text" &&
                                        verificationMethod.type !== "phone_verification_via_call" &&
                                        verificationMethod.type !== "email_code_verification" &&
                                        verificationMethod.type !== "contact_airbnb"
                                    ) {
                                        return false;
                                    }
                                    return (
                                        <div
                                            className="col-12"
                                            key={
                                                verificationMethod.type +
                                                verificationMethod.obfuscated
                                            }
                                        >
                                            {verificationMethod.type !== "contact_airbnb" && (
                                                <label className="rdiobox">
                                                    <input
                                                        id={verificationMethod.type}
                                                        type="radio"
                                                        name="radio"
                                                        value={index}
                                                        checked={
                                                            accountVerificationData.verificationMethod ===
                                                            index
                                                        }
                                                        onChange={() => {
                                                            handleRadio(index);
                                                        }}
                                                    />
                                                    {verificationMethod.type ===
                                                        "phone_verification_via_text" && (
                                                        <span>
                                                            <FiMessageSquare className="mr-1" />
                                                            {`Confirm your phone number ${verificationMethod.obfuscated} via text message`}
                                                        </span>
                                                    )}
                                                    {verificationMethod.type ===
                                                        "phone_verification_via_call" && (
                                                        <span>
                                                            <FiPhone className="mr-1" />
                                                            {`Confirm your phone number ${verificationMethod.obfuscated} via a phone call`}
                                                        </span>
                                                    )}
                                                    {verificationMethod.type ===
                                                        "email_code_verification" && (
                                                        <span>
                                                            <FiMail className="mr-1" />
                                                            {`Confirm your email ${verificationMethod.obfuscated}`}
                                                        </span>
                                                    )}
                                                </label>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.error && (
                                <div className="alert alert-danger">{errors.error}</div>
                            )}
                        </Modal.Body>
                    )}
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
                    {addAccountVerificationMethods[0].type !== "contact_airbnb" &&
                        addAccountVerificationMethods[0].type !== "hard_block_message" &&
                        (addAccountVerificationMethods[0].type !== "captcha" ||
                            isCaptchaClicked) && (
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    if (addAccountVerificationMethods[0].type === "captcha") {
                                        submitCaptcha(addAccountVerificationID);
                                    } else {
                                        submitAccountVerification(addAccountVerificationID);
                                    }
                                }}
                            >
                                {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                                Next
                            </button>
                        )}
                </Modal.Footer>
            </form>
        );
    }
    return (
        <form>
            <Modal.Header closeButton>
                <Modal.Title>Verify Airbnb Account</Modal.Title>
            </Modal.Header>

            <Modal.Body className="pd-20 pd-sm-40">
                <p>Airbnb has sent you a code using the method you chose, please enter it below.</p>
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                            <label
                                htmlFor="verificationCode"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Airbnb Verification Code
                                <OverlayTrigger placement="top" overlay={verificationCodeOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="verificationCode"
                                className={verificationCodeClasses}
                                placeholder="Airbnb Verification Code..."
                                name="verificationCode"
                                type="text"
                                autoComplete="off"
                                value={accountVerificationData.verificationCode}
                                onChange={event => {
                                    handleChangeVerificationCode(
                                        "verificationCode",
                                        event.target.value
                                    );
                                }}
                            />
                            {errors.verificationCode && (
                                <div className="alert alert-danger">{errors.verificationCode}</div>
                            )}
                        </div>
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
                    onClick={submitAccountVerificationCode}
                >
                    {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                    Next
                </button>
            </Modal.Footer>
        </form>
    );
}

AddAirbnbAccount.propTypes = {
    onHide: PropTypes.func.isRequired,
    hideCloseButtons: PropTypes.bool,
    credentials: PropTypes.shape({
        airbnbUsername: PropTypes.string,
        airbnbPassword: PropTypes.string,
        recaptchaToken: PropTypes.string
    })
    // updateUser: PropTypes.func.isRequired,
    // user: PropTypes.shape({
    //     username: PropTypes.string,
    //     firstName: PropTypes.string,
    //     lastName: PropTypes.string
    // }).isRequired
};

AddAirbnbAccount.defaultProps = {
    credentials: {
        airbnbUsername: "",
        airbnbPassword: "",
        recaptchaToken: ""
    },
    hideCloseButtons: false
};

export default AddAirbnbAccount;
