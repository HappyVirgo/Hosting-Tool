import classNames from "classnames";
import Phone from "phone";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle} from "react-icons/fi";
import {withRouter} from "react-router-dom";

import Languages from "../config/languages";
import {UserConsumer} from "../providers/UserProvider";
import {listingType, userType} from "../types";

import SelectDayOfTheWeek from "./SelectDayOfTheWeek";
import SelectDays from "./SelectDays";
import SelectDelay from "./SelectDelay";
import SelectEvent from "./SelectEvent";
import SelectLanguages from "./SelectLanguages";
import SelectLimitDays from "./SelectLimitDays";
import SelectLimitEvent from "./SelectLimitEvent";
import SelectMessageTemplates from "./SelectMessageTemplates";
import SelectReservationLength from "./SelectReservationLength";
import SelectTime from "./SelectTime";
import TextareaWithTags from "./TextareaWithTags";

const defaultMessageRule = {
    title: "",
    time: 17,
    days: -2,
    event: "checkout",
    reservationLength: 1,
    messages: {default: ""},
    lastMinuteMessageEnabled: false,
    lastMinuteMessageIsTheSame: false,
    lastMinuteMessages: {default: ""},
    reviewEnabled: false,
    reviewMessages: {default: ""},
    sendMessageAfterLeavingReview: false,
    disableMessageAfterReview: false,
    emailEnabled: false,
    email: "",
    smsEnabled: false,
    sms: "",
    delay: 0,
    preapprove: false,
    limitDays: {},
    limitEvent: "checkout",
    languagesEnabled: false
};

const validateText = (type, typeName, messageRule, errors, formIsValid) => {
    errors = Object.keys(messageRule[type]).reduce((result, language) => {
        const text = messageRule[type][language];
        let languageName = "";
        if (messageRule.languagesEnabled) {
            languageName = ` ${
                Languages.find(option => {
                    return option.value === language;
                }).label
            }`;
        }
        if (!text) {
            formIsValid = false;
            errors[type] = `You forgot to add text to the${languageName} ${typeName}!`;
        } else {
            if (messageRule.event !== "checkinChanged") {
                if (text.search("{{Previous Check-In Date}}") !== -1) {
                    formIsValid = false;
                    errors[
                        type
                    ] = `The {{Previous Check-In Date}} tag will not populate unless you use the 'Check-In Changed' event.  Please remove it from the${languageName} ${typeName} or change the event.`;
                }
                if (
                    messageRule.event !== "checkoutChanged" &&
                    text.search("{{Previous Number of Nights}}") !== -1
                ) {
                    formIsValid = false;
                    errors[
                        type
                    ] = `The {{Previous Number of Nights}} tag will not populate unless you use the 'Check-In Changed' or 'Check-Out Changed' events.  Please remove it from the${languageName} ${typeName} or change the event.`;
                }
            }
            if (messageRule.event !== "checkoutChanged") {
                if (text.search("{{Previous Check-Out Date}}") !== -1) {
                    formIsValid = false;
                    errors[
                        type
                    ] = `The {{Previous Check-Out Date}} tag will not populate unless you use the 'Check-Out Changed' event.  Please remove it from the${languageName} ${typeName} or change the event.`;
                }
                if (
                    messageRule.event !== "checkinChanged" &&
                    text.search("{{Previous Number of Nights}}") !== -1
                ) {
                    formIsValid = false;
                    errors[
                        type
                    ] = `The {{Previous Number of Nights}} tag will not populate unless you use the 'Check-In Changed' or 'Check-Out Changed' events.  Please remove it from the${languageName} ${typeName} or change the event.`;
                }
            }
            if (
                messageRule.event !== "numberOfGuestsChanged" &&
                text.search("{{Previous Number of Guests}}") !== -1
            ) {
                formIsValid = false;
                errors[
                    type
                ] = `The {{Previous Number of Guests}} tag will not populate unless you use the 'Number of Guests Changed' event.  Please remove it from the${languageName} ${typeName} or change the event.`;
            }
        }
        return errors;
    }, errors);
    return {errors, formIsValid};
};
const cleanUpText = (type, messageRule) => {
    if (!messageRule[type]) {
        return {default: ""};
    }
    const messages = Object.keys(messageRule[type]).reduce((result, language) => {
        const text = messageRule[type][language];
        result[language] = text?.trim();
        return result;
    }, {});
    return messages;
};

function ModalEditMessageRule(props) {
    const {show, onHide, listing, user, airbnbListingID, airbnbUserID} = props;

    const [isNewRule, setIsNewRule] = useState(true);
    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState(false);
    const [messageRules, setMessageRules] = useState([]);
    const [messageRule, setMessageRule] = useState(defaultMessageRule);
    const [template, setTemplate] = useState("custom");
    const [isInstantEvent, setIsInstantEvent] = useState(false);
    const [isChangeEvent, setIsChangeEvent] = useState(false);

    useEffect(() => {
        async function loadMessageRule() {
            getMessageRules();
            let isNewRule = true;
            const newMessageRule = props.messageRule;
            if (newMessageRule._id) {
                isNewRule = false;
                await handleEventChange(newMessageRule.event);
                try {
                    await cleanUpMessageRule({...newMessageRule});
                } catch (error) {
                    console.error("error", error);
                }
            } else {
                await handleEventChange(defaultMessageRule.event);
                await cleanUpMessageRule({...defaultMessageRule});
            }
            await setIsNewRule(isNewRule);
            await setShowSpinner(false);
            await setErrors({});
        }
        if (show) {
            loadMessageRule();
        }
    }, [show]);

    async function getMessageRules() {
        try {
            const url = "/getMessageRules";
            const response = await fetch(url);
            if (response.ok) {
                const messageRules = await response.json();
                await setMessageRules(messageRules);
            } else {
                console.error("response", response);
                window.location = "/";
            }
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    function handleChange(field, value, language) {
        const newMessageRule = {};
        if (field === "messages" || field === "lastMinuteMessages" || field === "reviewMessages") {
            newMessageRule[field] = messageRule[field];
            newMessageRule[field][language] = value;
            setMessageRule(messageRule => {
                return {...messageRule, ...newMessageRule};
            });
        } else {
            newMessageRule[field] = value;
            setMessageRule(messageRule => {
                return {...messageRule, ...newMessageRule};
            });
        }
    }

    async function handleSubmit() {
        try {
            await cleanUpMessageRule(messageRule);
            if (validateForm()) {
                await setShowSpinner(true);
                const url = "/addMessageRule";
                messageRule.airbnbUserID = airbnbUserID;
                if (airbnbListingID) {
                    messageRule.airbnbListingID = airbnbListingID;
                }
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(messageRule)
                });
                if (response.ok) {
                    onHide(true);
                } else if (response.status === 400) {
                    const data = await response.json();
                    await setErrors(data);
                    await setShowSpinner(false);
                } else {
                    console.error("response", response);
                    // window.location = "/";
                }
            }
        } catch (error) {
            setShowSpinner(false);
            console.error("error", error);
        }
    }

    function validateForm() {
        let errors = {};
        let formIsValid = true;
        // title
        if (!messageRule.title) {
            formIsValid = false;
            errors.title = "Missing message rule title.";
        }
        // email
        if (messageRule.emailEnabled) {
            if (!messageRule.email) {
                formIsValid = false;
                errors.email = "Missing an email address.";
            } else {
                const emails = messageRule.email.split(/[\s;,]+/);
                // define single email validator here
                const re = new RegExp(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
                );
                const validityArr = emails.map(str => {
                    return re.test(str.trim());
                });
                let atLeastOneInvalid = false;
                validityArr.forEach(value => {
                    if (value === false) atLeastOneInvalid = true;
                });
                if (atLeastOneInvalid) {
                    formIsValid = false;
                    errors.email =
                        "Please enter a valid email address.  Multiple emails can be added if separated by commas.  For example: email@email.com, email@email.com";
                }
            }
        }
        // sms
        if (messageRule.smsEnabled) {
            if (!messageRule.sms) {
                formIsValid = false;
                errors.sms = "Please enter a phone number.";
            } else {
                const numberCheck = Phone(messageRule.sms, "", true);
                if (!numberCheck || (numberCheck[1] !== "USA" && numberCheck[1] !== "CAN")) {
                    formIsValid = false;
                    errors.sms = "Please enter a valid United States or Canadian phone number.";
                } else {
                    messageRule.sms = numberCheck[0].substr(2);
                }
            }
        }
        // reviewMessages
        if (messageRule.reviewEnabled) {
            const result = validateText(
                "reviewMessages",
                "review",
                messageRule,
                errors,
                formIsValid
            );
            errors = result.errors;
            formIsValid = result.formIsValid;
        }
        // messages
        // messages is required if the review is disabled or they are not sending a message after the review
        if (!messageRule.reviewEnabled || messageRule.sendMessageAfterLeavingReview) {
            const result = validateText("messages", "message", messageRule, errors, formIsValid);
            errors = result.errors;
            formIsValid = result.formIsValid;
        }

        // lastMinuteMessages
        if (!messageRule.lastMinuteMessageIsTheSame && messageRule.lastMinuteMessageEnabled) {
            const result = validateText(
                "lastMinuteMessages",
                "last-minute message",
                messageRule,
                errors,
                formIsValid
            );
            errors = result.errors;
            formIsValid = result.formIsValid;
        }
        // isLimited
        if (messageRule.isLimited) {
            if (Object.keys(messageRule.limitDays).length === 0) {
                formIsValid = false;
                errors.limitDays =
                    "Please select at least one day of the week that the check-in or check-out should fall on to send the message.";
            }
        }
        setErrors(errors);
        return formIsValid;
    }

    async function cleanUpMessageRule(messageRule) {
        try {
            // Remove values that are set when saving the rule
            delete messageRule.airbnbListingID;
            delete messageRule.accountID;
            delete messageRule.listingID;
            delete messageRule.listingGroupID;
            delete messageRule.isGlobal;
            delete messageRule.createdAt;
            delete messageRule.updatedAt;
            delete messageRule.__v;
            // event
            if (
                messageRule.event === "checkin" ||
                messageRule.event === "checkout" ||
                messageRule.event === "occupied"
            ) {
                delete messageRule.delay;
            } else {
                delete messageRule.days;
                delete messageRule.time;
                delete messageRule.reservationLength;
            }
            // email
            if (messageRule.emailEnabled) {
                messageRule.sms = "";
            } else {
                messageRule.email = "";
            }
            // sms
            if (messageRule.smsEnabled) {
                messageRule.email = "";
            } else {
                messageRule.sms = "";
            }
            // limited
            if (!messageRule.isLimited) {
                delete messageRule.limitEvent;
                delete messageRule.limitDays;
            }
            // legacy, convert message, lastMinuteMessage, reviewMessage to object
            if (messageRule.message) {
                messageRule.messages = {default: messageRule.message};
                delete messageRule.message;
            }
            if (messageRule.lastMinuteMessage) {
                messageRule.lastMinuteMessages = {default: messageRule.lastMinuteMessage};
                delete messageRule.lastMinuteMessage;
            }
            if (messageRule.reviewMessage) {
                messageRule.reviewMessages = {default: messageRule.reviewMessage};
                delete messageRule.reviewMessage;
            }
            // languagesEnabled
            // Make sure it's not "undefined"
            if (!messageRule.languagesEnabled) {
                messageRule.languagesEnabled = false;
            }
            // messages
            messageRule.messages = cleanUpText("messages", messageRule);
            // reviewMessages
            if (!messageRule.reviewEnabled) {
                delete messageRule.reviewMessages;
            } else {
                messageRule.reviewMessages = cleanUpText("reviewMessages", messageRule);
            }
            // lastMinuteMessages
            if (messageRule.lastMinuteMessageEnabled) {
                if (messageRule.lastMinuteMessageIsTheSame) {
                    messageRule.lastMinuteMessages = messageRule.messages;
                }
                // If this is an existing messageRule, check if the lastMinuteMessages and messages are the same
                // if so, check the lastMinuteMessageIsTheSame box
                if (
                    JSON.stringify(messageRule.lastMinuteMessages) ===
                    JSON.stringify(messageRule.messages)
                ) {
                    messageRule.lastMinuteMessageIsTheSame = true;
                } else {
                    messageRule.lastMinuteMessages = cleanUpText("lastMinuteMessages", messageRule);
                }
            } else {
                delete messageRule.lastMinuteMessages;
                messageRule.lastMinuteMessageIsTheSame = false;
                messageRule.reviewEnabled = messageRule.reviewEnabled === true; // Without this, unchecked will return undefined
                messageRule.sendMessageAfterLeavingReview =
                    messageRule.sendMessageAfterLeavingReview === true; // Without this, unchecked will return undefined
                messageRule.disableMessageAfterReview =
                    messageRule.disableMessageAfterReview === true; // Without this, unchecked will return undefined
            }
            await setMessageRule(messageRule);
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    async function handleTemplateChange(template) {
        await handleEventChange(template.event);
        await cleanUpMessageRule({...messageRule, ...template});
    }

    function handleToggle(field) {
        const newMessageRule = {};
        newMessageRule[field] = !messageRule[field];
        if (field === "emailEnabled") {
            newMessageRule.smsEnabled = false;
            newMessageRule.languagesEnabled = false;
        } else if (field === "smsEnabled") {
            newMessageRule.emailEnabled = false;
            newMessageRule.languagesEnabled = false;
            // } else if (field === "languagesEnabled") {
            //     if(messageRule[field]) {
            //         if(typeof messageRule.message === "string") {
            //             messageRule.message = [{default: messageRule.message}];
            //         }
            //     }
        }
        cleanUpMessageRule({...messageRule, ...newMessageRule});
    }

    async function handleSelectedOption(field, option) {
        try {
            const newMessageRule = {};
            if (field === "limitDays") {
                newMessageRule[field] = option.reduce((result, opt) => {
                    result[opt.value] = true;
                    return result;
                }, {});
            } else if (field === "languages") {
                if (messageRule.messages) {
                    newMessageRule.messages = option.reduce((result, language) => {
                        if (typeof messageRule.messages[language.value] !== "string") {
                            result[language.value] = "";
                        } else {
                            result[language.value] = messageRule.messages[language.value];
                        }
                        return result;
                    }, {});
                }
                if (messageRule.lastMinuteMessages) {
                    newMessageRule.lastMinuteMessages = option.reduce((result, language) => {
                        if (typeof messageRule.lastMinuteMessages[language.value] !== "string") {
                            result[language.value] = "";
                        } else {
                            result[language.value] = messageRule.lastMinuteMessages[language.value];
                        }
                        return result;
                    }, {});
                }
                if (messageRule.reviewMessages) {
                    newMessageRule.reviewMessages = option.reduce((result, language) => {
                        if (typeof messageRule.reviewMessages[language.value] !== "string") {
                            result[language.value] = "";
                        } else {
                            result[language.value] = messageRule.reviewMessages[language.value];
                        }
                        return result;
                    }, {});
                }
            } else {
                newMessageRule[`${field}Formatted`] = option.label.toLowerCase();
                newMessageRule[field] = option.value;
            }
            if (field === "event") {
                await handleEventChange(option.value);
            }
            await setMessageRule(messageRule => {
                return {...messageRule, ...newMessageRule};
            });
            await setTemplate("custom");
        } catch (error) {
            console.error("error: ", error);
        }
    }

    async function handleEventChange(event) {
        try {
            let newIsInstantEvent = isInstantEvent;
            let newIsChangeEvent = isChangeEvent;
            const newMessageRule = {};

            if (
                event === "booking" ||
                event === "inquiry" ||
                event === "pending" ||
                event === "timedout" ||
                event === "doorUnlocked" ||
                event === "checkinChanged" ||
                event === "checkoutChanged" ||
                event === "numberOfGuestsChanged" ||
                event === "cancelled"
            ) {
                newIsInstantEvent = true;
                if (
                    event === "checkinChanged" ||
                    event === "checkoutChanged" ||
                    event === "numberOfGuestsChanged"
                ) {
                    newIsChangeEvent = true;
                }
                newMessageRule.time = -1;
                newMessageRule.days = 0;
                newMessageRule.reservationLength = 1;
            } else {
                if (!newMessageRule.time && newMessageRule.time !== 0) {
                    newMessageRule.time = 17;
                }
                newIsInstantEvent = false;
                newIsChangeEvent = false;
                newMessageRule.preapprove = false;
                newMessageRule.delay = 0;
            }
            await setIsInstantEvent(newIsInstantEvent);
            await setIsChangeEvent(newIsChangeEvent);
            await setMessageRule(messageRule => {
                return {...messageRule, ...newMessageRule};
            });
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    const isReviewPossible =
        messageRule.event === "checkout" &&
        messageRule.days >= 0 &&
        !messageRule.emailEnabled &&
        !messageRule.smsEnabled;
    const isLastMinutePossible =
        messageRule.event === "checkin" &&
        messageRule.days <= 0 &&
        !messageRule.emailEnabled &&
        !messageRule.smsEnabled;
    const isLastMinuteMessagePossible =
        isLastMinutePossible &&
        !messageRule.lastMinuteMessageIsTheSame &&
        messageRule.lastMinuteMessageEnabled &&
        !messageRule.emailEnabled &&
        !messageRule.smsEnabled;
    const isMessagePossible =
        messageRule.event !== "checkout" ||
        !messageRule.reviewEnabled ||
        messageRule.sendMessageAfterLeavingReview ||
        messageRule.emailEnabled ||
        messageRule.smsEnabled;
    const isOccupiedEvent = messageRule.event === "occupied";

    let title = "Edit Message Rule";
    if (isNewRule) {
        title = "Add New Message Rule";
    }
    const templatesOverlay = (
        <Tooltip>
            Use one of the message templates or select from one of your existing message rules to
            copy the details.
        </Tooltip>
    );
    const ruleNameOverlay = (
        <Tooltip>
            The &apos;Rule Name&apos; is for your reference only, guests will not see it. It is used
            as the subject of the email if emailing is enabled on this rule.
        </Tooltip>
    );
    const emailEnabledOverlay = (
        <Tooltip>
            The message can be sent to an email address. If emailing is enabled, this message will
            not be sent to the guest and only to the email provided. This is useful for notifying
            your cleaners of new or upcoming cleanings. Note: The &apos;Rule Name&apos; of the rule
            will be the subject of the email.
        </Tooltip>
    );
    const smsEnabledOverlay = (
        <Tooltip>
            The message can be sent as a text message to a phone number. If SMS is enabled, this
            message will not be sent to the guest and only to the phone number provided. This is
            useful for notifying your cleaners of new or upcoming cleanings.
        </Tooltip>
    );
    const emailOverlay = (
        <Tooltip>
            Enter the email address you would like to send the message to. Multiple emails can be
            added if separated by commas. For example: jack@email.com, jill@email.com
        </Tooltip>
    );
    const delayOverlay = (
        <Tooltip>
            Minimum number of minutes to wait before sending the message. Note: messages may be sent
            a few minutes after the minimum delay set.
        </Tooltip>
    );
    const timeOverlay = <Tooltip>Time is in the timezone of the listing.</Tooltip>;
    const dayOfTheWeekOverlay = (
        <Tooltip>Select a day of the week you want the message to be sent on.</Tooltip>
    );
    const reservationLengthOverlay = (
        <Tooltip>
            Only send this message if the stay is longer than the specified number of nights.
        </Tooltip>
    );
    const languagesEnabledOverlay = (
        <Tooltip>
            The guest&apos;s preferred language is automatically downloaded from the channel if
            available and if you have created a message in that language it will send it, otherwise
            it will send the default message.
        </Tooltip>
    );
    const isLimitedOverlay = (
        <Tooltip>
            This is useful if you have different cleaners for different days of the week.
        </Tooltip>
    );
    const limitDaysOverlay = <Tooltip>Select the days you want the event to fall on.</Tooltip>;
    const disableMessageAfterReviewOverlay = (
        <Tooltip>
            The message will not be sent to the guest if the guest has already left you a review.
            This is useful when reminding guests to leave a review.
        </Tooltip>
    );
    const disableIfLastMinuteOverlay = (
        <Tooltip>
            Sometimes you don&amp;t want to send a booking confirmation message if it is a
            last-minute booking and the guest is already going to receive a last-minute message
            right away.
        </Tooltip>
    );
    let lastMinuteMessageTooltip =
        "The 'Last Minute Message' will only be sent if a guest makes a booking after the time that message would have been sent, in this case if a booking occurs after ";
    lastMinuteMessageTooltip += `${messageRule.timeFormatted} ${messageRule.daysFormatted} ${messageRule.eventFormatted}.`;
    const reviewTooltip = "This is the public message left with the 5 star review of the guest.";

    const eventClasses = classNames("pr-sm-2", {
        "col-sm-3": !isInstantEvent,
        "col-sm-4": isInstantEvent
    });
    const reservationLengthClasses = classNames("pl-sm-2", {
        "col-sm-3": !isInstantEvent,
        "col-sm-4": isInstantEvent
    });
    const titleClasses = classNames("form-control", {
        "is-invalid": errors.title
    });
    const smsClasses = classNames("form-control", {
        "is-invalid": errors.sms
    });
    const emailClasses = classNames("form-control", {
        "is-invalid": errors.email
    });
    return (
        <Modal
            show={show}
            onHide={() => {
                onHide();
            }}
            size="lg"
        >
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="pd-20 pd-sm-40">
                    <div className="form-group">
                        <label
                            htmlFor="templates"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Message Templates
                            <OverlayTrigger placement="top" overlay={templatesOverlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        </label>
                        <SelectMessageTemplates
                            id="templates"
                            selectedValue={template}
                            messageRules={messageRules}
                            isDisabled={!isNewRule}
                            onSelectedTemplate={handleTemplateChange}
                        />
                    </div>
                    <div className="form-group">
                        <label
                            htmlFor="title"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Rule Name
                            <OverlayTrigger placement="top" overlay={ruleNameOverlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        </label>
                        <input
                            id="title"
                            className={titleClasses}
                            placeholder="Rule name..."
                            name="title"
                            type="text"
                            value={messageRule.title}
                            onChange={event => {
                                handleChange("title", event.target.value);
                            }}
                            required
                        />
                        {errors.title && <div className="alert alert-danger">{errors.title}</div>}
                    </div>
                    <div className="form-group">
                        <label className="ckbox">
                            <input
                                id="emailEnabled"
                                type="checkbox"
                                checked={messageRule.emailEnabled}
                                onChange={() => {
                                    handleToggle("emailEnabled");
                                }}
                            />
                            <span>
                                <label
                                    htmlFor="emailEnabled"
                                    className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                >
                                    Send as an email and not to the guest
                                    <OverlayTrigger placement="right" overlay={emailEnabledOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                </label>
                            </span>
                        </label>
                        <label className="ckbox">
                            <input
                                id="smsEnabled"
                                type="checkbox"
                                checked={messageRule.smsEnabled}
                                onChange={() => {
                                    handleToggle("smsEnabled");
                                }}
                            />
                            <span>
                                <label
                                    htmlFor="smsEnabled"
                                    className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                >
                                    Send as an SMS and not to the guest
                                    <OverlayTrigger placement="right" overlay={smsEnabledOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                </label>
                            </span>
                        </label>
                    </div>
                    {messageRule.emailEnabled && (
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label
                                        htmlFor="email"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Email Address
                                        <OverlayTrigger placement="right" overlay={emailOverlay}>
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                    <input
                                        id="email"
                                        className={emailClasses}
                                        placeholder="Email address..."
                                        name="email"
                                        type="text"
                                        value={messageRule.email}
                                        onChange={event => {
                                            handleChange("email", event.target.value);
                                        }}
                                    />
                                    {errors.email && (
                                        <div className="alert alert-danger">{errors.email}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {messageRule.smsEnabled && (
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <div className="alert alert-warning help-block">
                                        <strong>Warning: </strong>
                                        The SMS feature currently only supports United States and
                                        Canada phone numbers.
                                    </div>
                                    <label
                                        htmlFor="number"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        id="sms"
                                        className={smsClasses}
                                        placeholder="Phone number..."
                                        name="sms"
                                        type="text"
                                        value={messageRule.sms}
                                        onChange={event => {
                                            handleChange("sms", event.target.value);
                                        }}
                                        ng-required="messageRule.smsEnabled"
                                    />

                                    {errors.sms && (
                                        <div className="alert alert-danger">{errors.sms}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="row">
                        {!isInstantEvent && !isOccupiedEvent && (
                            <div className="col-sm-3 pr-sm-2">
                                <div className="form-group">
                                    <label
                                        htmlFor="days"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Days
                                    </label>
                                    <SelectDays
                                        id="days"
                                        selectedValue={messageRule.days}
                                        onSelectedOption={option => {
                                            handleSelectedOption("days", option);
                                        }}
                                        isDisabled={isInstantEvent}
                                    />
                                </div>
                            </div>
                        )}
                        {isInstantEvent && (
                            <div className="col-sm-4 pr-sm-2">
                                <div className="form-group">
                                    <label
                                        htmlFor="delay"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Delay
                                        <OverlayTrigger placement="right" overlay={delayOverlay}>
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                    <SelectDelay
                                        id="delay"
                                        selectedValue={messageRule.delay}
                                        onSelectedOption={option => {
                                            handleSelectedOption("delay", option);
                                        }}
                                        isDisabled={isChangeEvent}
                                    />
                                </div>
                            </div>
                        )}
                        {isOccupiedEvent && (
                            <div className="col-sm-3 pr-sm-2">
                                <div className="form-group">
                                    <label
                                        htmlFor="dayOfTheWeek"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Day of the week
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={dayOfTheWeekOverlay}
                                        >
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                    <SelectDayOfTheWeek
                                        id="dayOfTheWeek"
                                        selectedValue={messageRule.dayOfTheWeek}
                                        onSelectedOption={option => {
                                            handleSelectedOption("dayOfTheWeek", option);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className={eventClasses}>
                            <div className="form-group">
                                <label
                                    htmlFor="event"
                                    className="az-content-label tx-11 tx-medium tx-gray-600"
                                >
                                    Event
                                </label>
                                <SelectEvent
                                    id="event"
                                    selectedValue={messageRule.event}
                                    isDisabled={!isNewRule}
                                    onSelectedOption={option => {
                                        handleSelectedOption("event", option);
                                    }}
                                />
                            </div>
                        </div>
                        {!isInstantEvent && (
                            <div className="col-sm-3 pl-sm-2 pr-sm-2">
                                <div className="form-group">
                                    <label
                                        htmlFor="time"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Time
                                        <OverlayTrigger placement="top" overlay={timeOverlay}>
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                    <SelectTime
                                        id="time"
                                        selectedValue={messageRule.time}
                                        onSelectedOption={option => {
                                            handleSelectedOption("time", option);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className={reservationLengthClasses}>
                            <div className="form-group">
                                <label
                                    htmlFor="reservationLength"
                                    className="az-content-label tx-11 tx-medium tx-gray-600"
                                >
                                    Reservation Length
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={reservationLengthOverlay}
                                    >
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                </label>
                                <SelectReservationLength
                                    id="reservationLength"
                                    selectedValue={messageRule.reservationLength}
                                    isDisabled={isInstantEvent}
                                    onSelectedOption={option => {
                                        handleSelectedOption("reservationLength", option);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {isReviewPossible && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="reviewEnabled"
                                    type="checkbox"
                                    checked={messageRule.reviewEnabled}
                                    onChange={() => {
                                        handleToggle("reviewEnabled");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="reviewEnabled"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Leave guest a 5 star review
                                    </label>
                                </span>
                            </label>
                            <label className="ckbox">
                                <input
                                    id="sendMessageAfterLeavingReview"
                                    type="checkbox"
                                    checked={messageRule.sendMessageAfterLeavingReview}
                                    onChange={() => {
                                        handleToggle("sendMessageAfterLeavingReview");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="sendMessageAfterLeavingReview"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Send the guest a message after leaving a review
                                    </label>
                                </span>
                            </label>
                            <label className="ckbox">
                                <input
                                    id="disableMessageAfterReview"
                                    type="checkbox"
                                    checked={
                                        messageRule.disableMessageAfterReview ||
                                        messageRule.reviewEnabled
                                    }
                                    onChange={() => {
                                        handleToggle("disableMessageAfterReview");
                                    }}
                                    disabled={messageRule.reviewEnabled}
                                />
                                <span>
                                    <label
                                        htmlFor="disableMessageAfterReview"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Don&apos;t send this message if guest has left a review.
                                        <OverlayTrigger
                                            placement="right"
                                            overlay={disableMessageAfterReviewOverlay}
                                        >
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {messageRule.reviewEnabled && messageRule.days <= 0 && (
                        <div className="form-group">
                            <div className="alert alert-warning help-block">
                                <strong>Warning: </strong>
                                It is not recommended to attempt to leave a review until at least a
                                day after the guest checks out because sometimes it can take a day
                                before you are allowed to review a guest.
                            </div>
                        </div>
                    )}
                    {messageRule.reviewEnabled && listing.isCoHost && (
                        <div className="form-group">
                            <div className="alert alert-warning help-block">
                                <strong>Warning: </strong>
                                You are a co-host on this listing and co-hosts are not permit to
                                leave reviews for guests.
                            </div>
                        </div>
                    )}

                    {!messageRule.emailEnabled && !messageRule.smsEnabled && (
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label className="ckbox">
                                        <input
                                            id="languagesEnabled"
                                            type="checkbox"
                                            checked={messageRule.languagesEnabled}
                                            onChange={() => {
                                                handleToggle("languagesEnabled");
                                            }}
                                        />
                                        <span>
                                            <label
                                                htmlFor="languagesEnabled"
                                                className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                            >
                                                Send a different message depending on the
                                                guest&apos;s preferred language
                                                <OverlayTrigger
                                                    placement="right"
                                                    overlay={languagesEnabledOverlay}
                                                >
                                                    <FiHelpCircle className="text-muted ml-1" />
                                                </OverlayTrigger>
                                            </label>
                                        </span>
                                    </label>
                                </div>
                                {messageRule.languagesEnabled && (
                                    <div className="form-group">
                                        <label
                                            htmlFor="languages"
                                            className="az-content-label tx-11 tx-medium tx-gray-600"
                                        >
                                            Languages
                                        </label>
                                        <SelectLanguages
                                            id="languages"
                                            selectedValues={messageRule.messages}
                                            onSelectedOption={options => {
                                                handleSelectedOption("languages", options);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {messageRule.reviewEnabled && (
                        <TextareaWithTags
                            languagesEnabled={messageRule.languagesEnabled}
                            messages={messageRule.reviewMessages}
                            onChange={(value, language) => {
                                handleChange("reviewMessages", value, language);
                            }}
                            event={messageRule.event}
                            label="Review"
                            tooltip={reviewTooltip}
                            error={errors.reviewMessages}
                            user={user}
                        />
                    )}
                    {messageRule.event === "inquiry" && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="preapprove"
                                    type="checkbox"
                                    checked={messageRule.preapprove}
                                    onChange={() => {
                                        handleToggle("preapprove");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="preapprove"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Automatically pre-approve the guest
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {messageRule.event === "pending" && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="accept"
                                    type="checkbox"
                                    checked={!!messageRule.accept}
                                    onChange={() => {
                                        handleToggle("accept");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="accept"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Automatically accept booking requests
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {messageRule.event === "booking" && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="disableIfLastMinute"
                                    type="checkbox"
                                    checked={!!messageRule.disableIfLastMinute}
                                    onChange={() => {
                                        handleToggle("disableIfLastMinute");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="disableIfLastMinute"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Don&apos;t send this message if a last-minute message is
                                        sent
                                        <OverlayTrigger
                                            placement="right"
                                            overlay={disableIfLastMinuteOverlay}
                                        >
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {isLastMinutePossible && (
                        <div className="form-group">
                            {!messageRule.lastMinuteMessageEnabled && (
                                <div className="alert alert-warning help-block">
                                    <strong>Warning: </strong>
                                    {`If a booking is made after ${messageRule.timeFormatted}
                                        ${messageRule.daysFormatted} ${messageRule.eventFormatted} the guest will not receive this message. Check the
                                        box below to enable the last-minute booking
                                        ${messageRule.eventFormatted} message last-minute
                                        booking is made.`}
                                </div>
                            )}
                            <label className="ckbox">
                                <input
                                    id="lastMinuteMessageEnabled"
                                    type="checkbox"
                                    checked={messageRule.lastMinuteMessageEnabled}
                                    onChange={() => {
                                        handleToggle("lastMinuteMessageEnabled");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="lastMinuteMessageEnabled"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        {`Enable last-minute booking ${messageRule.eventFormatted} message.`}
                                    </label>
                                </span>
                            </label>
                            {isLastMinutePossible && messageRule.lastMinuteMessageEnabled && (
                                <label className="ckbox">
                                    <input
                                        id="lastMinuteMessageIsTheSame"
                                        type="checkbox"
                                        checked={messageRule.lastMinuteMessageIsTheSame}
                                        onChange={() => {
                                            handleToggle("lastMinuteMessageIsTheSame");
                                        }}
                                    />
                                    <span>
                                        <label
                                            htmlFor="lastMinuteMessageIsTheSame"
                                            className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                        >
                                            Send the same message to last-minute bookings
                                        </label>
                                    </span>
                                </label>
                            )}
                        </div>
                    )}

                    {isMessagePossible && (
                        <TextareaWithTags
                            languagesEnabled={messageRule.languagesEnabled}
                            messages={messageRule.messages}
                            onChange={(value, language) => {
                                handleChange("messages", value, language);
                            }}
                            event={messageRule.event}
                            label="Message"
                            error={errors.messages}
                            user={user}
                        />
                    )}
                    {isLastMinuteMessagePossible && (
                        <TextareaWithTags
                            languagesEnabled={messageRule.languagesEnabled}
                            messages={messageRule.lastMinuteMessages}
                            onChange={(value, language) => {
                                handleChange("lastMinuteMessages", value, language);
                            }}
                            event={messageRule.event}
                            label="Last Minute Message"
                            tooltip={lastMinuteMessageTooltip}
                            error={errors.lastMinuteMessages}
                            user={user}
                        />
                    )}
                    <div className="form-group">
                        <label className="ckbox">
                            <input
                                id="isLimited"
                                type="checkbox"
                                checked={!!messageRule.isLimited}
                                onChange={() => {
                                    handleToggle("isLimited");
                                }}
                                disabled={!isNewRule}
                            />
                            <span>
                                <label
                                    htmlFor="isLimited"
                                    className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                >
                                    Only send if check-in or check-out fall on selected days of the
                                    week
                                    <OverlayTrigger placement="right" overlay={isLimitedOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                </label>
                            </span>
                        </label>
                    </div>

                    {messageRule.isLimited && (
                        <div className="row">
                            <div className="col-sm-3 pr-sm-2">
                                <div className="form-group">
                                    <label
                                        htmlFor="limitEvent"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Send if
                                    </label>
                                    <SelectLimitEvent
                                        id="limitEvent"
                                        selectedValue={messageRule.limitEvent}
                                        onSelectedOption={option => {
                                            handleSelectedOption("limitEvent", option);
                                        }}
                                        isDisabled={!isNewRule}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-9 pl-sm-2">
                                <div className="form-group">
                                    <label
                                        htmlFor="limitDays"
                                        className="az-content-label tx-11 tx-medium tx-gray-600"
                                    >
                                        Days of the week
                                        <OverlayTrigger placement="top" overlay={limitDaysOverlay}>
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                    <SelectLimitDays
                                        id="limitDays"
                                        selectedValues={messageRule.limitDays}
                                        onSelectedOption={option => {
                                            handleSelectedOption("limitDays", option);
                                        }}
                                        error={errors.limitDays}
                                        isDisabled={!isNewRule}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                </Modal.Body>

                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={() => {
                            onHide();
                        }}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleSubmit}
                    >
                        {showSpinner && (
                            <FaCircleNotch data-testid="spinner" className="fa-spin mr-1" />
                        )}
                        Save
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

ModalEditMessageRule.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    airbnbUserID: PropTypes.string.isRequired,
    airbnbListingID: PropTypes.string,
    messageRule: PropTypes.shape({
        _id: PropTypes.string,
        event: PropTypes.string
    }).isRequired,
    listing: listingType.isRequired,
    user: userType.isRequired
};

ModalEditMessageRule.defaultProps = {
    airbnbListingID: undefined
};

const ConnectedModalEditMessageRule = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <ModalEditMessageRule {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default withRouter(ConnectedModalEditMessageRule);
