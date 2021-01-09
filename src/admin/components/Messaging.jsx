import "../css/timeline.css";

import classNames from "classnames";
import PropTypes from "prop-types";
import React, {Component} from "react";
import TagManager from "react-gtm-module";
import {
    FiCheck,
    FiChevronRight,
    FiEdit2,
    FiExternalLink,
    FiPlus,
    FiSettings,
    FiTrash2,
    FiPlay,
    FiPause,
    FiChevronDown,
    FiX
} from "react-icons/fi";
import {Link, withRouter} from "react-router-dom";
import ReactRouterPropTypes from "react-router-prop-types";
import {Dropdown, Button} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";

import {UserConsumer} from "../providers/UserProvider";

import Errors from "./Errors";
import ModalConfirm from "./ModalConfirm";
import ModalEditMessageRule from "./ModalEditMessageRule";
import ModalListingSettings from "./ModalListingSettings";

const fillerMessageRules = [
    {
        isFiller: true,
        _id: "1",
        event: "    ",
        day: 1,
        time: 1,
        title: " ",
        message: "\n\n\n\n\n\n\n\n\n"
    },
    {
        isFiller: true,
        _id: "2",
        event: "    ",
        day: 2,
        time: 1,
        title: " ",
        message: "\n\n\n\n\n\n\n\n"
    },
    {
        isFiller: true,
        _id: "3",
        event: "    ",
        day: 3,
        time: 1,
        title: " ",
        message: "\n\n\n\n\n"
    },
    {
        isFiller: true,
        _id: "4",
        event: "    ",
        day: 1,
        time: 1,
        title: " ",
        message: "\n\n\n\n\n\n"
    }
];

class Messaging extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showEditMessageRuleModal: false,
            showConfirmModal: false,
            showListingSettingsModal: false,
            confirmModal: {},
            messageRule: {},
            showSpinner: {},
            listing: {},
            listingGroup: {},
            fillerMessageRules,
            messageRules: fillerMessageRules,
            errors: {}
        };

        this.getMessageRules = this.getMessageRules.bind(this);
        this.getListing = this.getListing.bind(this);
        this.getListingGroup = this.getListingGroup.bind(this);
        this.deleteMessageRule = this.deleteMessageRule.bind(this);
        this.handleShowConfirmModal = this.handleShowConfirmModal.bind(this);
        this.handleShowEditMessageRule = this.handleShowEditMessageRule.bind(this);
        this.handleCloseConfirmModal = this.handleCloseConfirmModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleShowListingSettingModal = this.handleShowListingSettingModal.bind(this);
        this.showConfirmDeleteMessageNow = this.showConfirmDeleteMessageNow.bind(this);
        this.handleToggleMessageRule = this.handleToggleMessageRule.bind(this);
    }

    async componentDidMount() {
        try {
            const {
                match: {
                    params: {airbnbUserID, airbnbListingID}
                }
            } = this.props;
            if (!airbnbUserID && airbnbListingID !== "all") {
                window.location = "/";
            }
            this.getMessageRules();

            const isListingGroupPage = airbnbUserID !== "all" && !airbnbListingID;
            if (isListingGroupPage) {
                this.getListingGroup();
            } else {
                this.getListing();
            }
            const tagManagerArgs = {
                dataLayer: {
                    page: "Messaging"
                }
            };
            TagManager.dataLayer(tagManagerArgs);
        } catch (error) {
            console.log("error", error);
        }
    }

    async UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            match: {
                params: {airbnbUserID, airbnbListingID}
            }
        } = this.props;
        const nextMatch = nextProps.match;
        const nextAirbnbUserID = nextMatch.params.airbnbUserID;
        const nextAirbnbListingID = nextMatch.params.airbnbListingID;
        if (airbnbUserID !== nextAirbnbUserID || airbnbListingID !== nextAirbnbListingID) {
            const {fillerMessageRules} = this.state;
            try {
                this.setState({messageRules: fillerMessageRules});
            } catch (error) {
                console.log("error", error);
            }
            this.getMessageRules(nextProps);
            const isListingGroupPage = nextAirbnbUserID !== "all" && !nextAirbnbListingID;
            if (isListingGroupPage) {
                this.getListingGroup(nextProps);
            } else {
                this.getListing(nextProps);
            }
        }
    }

    async getMessageRules(props = this.props) {
        try {
            const {
                match: {
                    params: {airbnbUserID, airbnbListingID}
                }
            } = props;
            let url = "/getMessageRules/";
            if (airbnbListingID) {
                url += `${airbnbUserID}/${airbnbListingID}`;
            } else {
                url += airbnbUserID;
            }
            const response = await fetch(url);
            if (response.ok) {
                const messageRules = await response.json();
                const errors = {};
                if (messageRules.length === 0) {
                    errors.no_listing_message_rules = true;
                }
                this.setState({messageRules, errors});
            } else {
                console.log("response", response);
                window.location = "/";
            }
        } catch (error) {
            console.log("error: ", error);
            throw error;
        }
    }

    async getListing(props = this.props) {
        try {
            const {
                match: {
                    params: {airbnbUserID, airbnbListingID}
                }
            } = props;
            let url = "/getListing/";
            if (airbnbListingID) {
                url += `${airbnbUserID}/${airbnbListingID}`;
                const response = await fetch(url);
                if (response.ok) {
                    const listing = await response.json();
                    this.setState({listing});
                } else {
                    console.log("response", response);
                    // window.location = "/";
                }
            }
        } catch (error) {
            console.log("error: ", error);
            throw error;
        }
    }

    async getListingGroup(props = this.props) {
        try {
            const {
                match: {
                    params: {airbnbUserID}
                }
            } = props;
            const url = `/getListingGroup/${airbnbUserID}`;
            const response = await fetch(url);
            if (response.ok) {
                const listingGroup = await response.json();
                this.setState({listingGroup});
            } else {
                console.log("response", response);
                // window.location = "/";
            }
        } catch (error) {
            console.log("error: ", error);
            throw error;
        }
    }

    handleShowConfirmModal(confirmModal) {
        this.setState({showConfirmModal: true, confirmModal});
    }

    handleShowEditMessageRule(messageRule = {}) {
        this.setState({showEditMessageRuleModal: true, messageRule});
    }

    handleShowListingSettingModal(listing) {
        this.setState({listing, showListingSettingsModal: true});
    }

    async handleCloseModal(isChange) {
        try {
            // Needs to be === true because sometimes isChange can be an event object which we don't want
            if (isChange === true) {
                await this.getMessageRules();
                const {updateUser} = this.props;
                updateUser();
                await this.getListing();
            }
            this.setState({showEditMessageRuleModal: false, showListingSettingsModal: false});
        } catch (error) {
            console.log("error: ", error);
        }
    }

    async handleCloseConfirmModal(isConfirmed) {
        try {
            if (isConfirmed) {
                await this.deleteMessageRule();
            } else {
                this.setState({showConfirmModal: false});
            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    async deleteMessageRule() {
        try {
            const {confirmModal} = this.state;
            const messageRule = confirmModal.data;
            const {_id} = messageRule;
            const url = "/deleteMessageRule";
            const fields = {
                _id
            };
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                await this.getMessageRules();
                this.setState({showConfirmModal: false});
                const {updateUser} = this.props;
                updateUser();
            } else {
                console.log("response", response);
                // window.location = "/";
            }
        } catch (error) {
            console.log("error", error);
            throw error;
        }
    }

    showConfirmDeleteMessageNow(messageRule) {
        this.handleShowConfirmModal({
            title: "Delete Message Rule?",
            message: "Are you sure you would like to delete this message rule?",
            buttonText: "Delete",
            data: messageRule,
            type: "danger"
        });
    }

    async handleToggleMessageRule(messageRule) {
        console.log("handleToggleMessageRule", messageRule);
        try {
            const {_id, paused} = messageRule;
            const {showSpinner} = this.state;
            showSpinner[_id] = true;
            this.setState({showSpinner});
            const url = "/pauseMessageRule";
            const fields = {
                _id,
                paused: !paused
            };
            console.log("fields", fields);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            console.log("response", response);
            if (response.ok) {
                await this.getMessageRules();
            } else {
                console.log("response", response);
                // window.location = "/";
            }
            showSpinner[_id] = false;
            this.setState({showSpinner});
        } catch (error) {
            console.log("error", error);
        }
    }

    render() {
        const {
            messageRules,
            listing,
            listingGroup,
            showEditMessageRuleModal,
            showConfirmModal,
            showListingSettingsModal,
            confirmModal,
            messageRule,
            showSpinner,
            errors
        } = this.state;
        const {
            match: {
                params: {airbnbUserID, airbnbListingID}
            },
            user: {listings}
        } = this.props;
        const isAllListingsPage = airbnbUserID === "all";
        const isListingGroupPage = airbnbUserID !== "all" && !airbnbListingID;
        const isListingPage = !isAllListingsPage && !isListingGroupPage;
        let isEven;
        const timeline = messageRules.reduce((result, rule, index, messageRules) => {
            let formattedEvent = rule.event;
            if (rule.event === "timedout") {
                formattedEvent = "Expired Pre-Approval";
            } else if (rule.event === "pending") {
                formattedEvent = "Booking Request";
            } else if (rule.event === "booking") {
                formattedEvent = "Confirmed Booking";
            } else if (rule.event === "checkin") {
                formattedEvent = "Check-In";
            } else if (rule.event === "occupied") {
                formattedEvent = "During the Reservation";
            } else if (rule.event === "checkout") {
                formattedEvent = "Check-Out";
            } else if (rule.event === "doorUnlocked") {
                formattedEvent = "Door Was Unlocked";
            } else if (rule.event === "checkinChanged") {
                formattedEvent = "Check-In Date Changed";
            } else if (rule.event === "checkoutChanged") {
                formattedEvent = "Check-Out Date Changed";
            } else if (rule.event === "numberOfGuestsChanged") {
                formattedEvent = "Number of Guests Changed";
            } else if (rule.event === "cancelled") {
                formattedEvent = "Canceled Booking";
            } else {
                formattedEvent =
                    formattedEvent[0].toUpperCase() + formattedEvent.slice(1).toLowerCase();
            }
            let isSameEvent = false;
            if (index !== 0) {
                const lastEvent = messageRules[index - 1].event;
                isSameEvent = lastEvent === rule.event;
                const lastDays = messageRules[index - 1].days;
                const lastTime = messageRules[index - 1].time;
                const isSameDayTime = rule.days === lastDays && rule.time === lastTime;
                if (!isSameEvent || !isSameDayTime) {
                    isEven = !isEven;
                }
            } else {
                isEven = index % 2 === 0;
            }
            if (!isSameEvent) {
                result.push(
                    <div className="timeline-date text-muted" key={rule.event}>
                        {formattedEvent}
                    </div>
                );
            }
            const timelineRowClasses = classNames("timeline-row", {
                "post-even": isEven
            });
            let messageRuleDateFormatted = "";
            if (
                rule.event === "checkin" ||
                rule.event === "checkout" ||
                rule.event === "occupied"
            ) {
                let {time} = rule;
                let amPM = "am";
                if (time >= 12) {
                    amPM = "pm";
                    if (time !== 12) {
                        time -= 12;
                    }
                }
                messageRuleDateFormatted += `@${time}${amPM},`;
                if (rule.event === "occupied") {
                    const dayOfTheWeekFormatted =
                        rule.dayOfTheWeek[0].toUpperCase() +
                        rule.dayOfTheWeek.slice(1).toLowerCase();
                    messageRuleDateFormatted += ` on the first ${dayOfTheWeekFormatted}`;
                } else if (rule.days === 0) {
                    messageRuleDateFormatted += ` on the day of ${rule.event}`;
                } else if (rule.days === 1) {
                    messageRuleDateFormatted += ` a day after ${rule.event}`;
                } else if (rule.days > 1) {
                    messageRuleDateFormatted += ` ${Math.abs(rule.days)} days after ${rule.event}`;
                } else if (rule.days === -1) {
                    messageRuleDateFormatted += ` a day before ${rule.event}`;
                } else if (rule.days < 1) {
                    messageRuleDateFormatted += ` ${Math.abs(rule.days)} days before ${rule.event}`;
                }
            } else {
                if (rule.delay) {
                    messageRuleDateFormatted += `${rule.delay} minutes after `;
                } else {
                    messageRuleDateFormatted += "Shortly after ";
                }
                if (rule.event === "booking") {
                    messageRuleDateFormatted += `a ${rule.event}`;
                } else if (rule.event === "inquiry") {
                    messageRuleDateFormatted += `an ${rule.event}`;
                } else if (rule.event === "timedout") {
                    messageRuleDateFormatted += "an inquiry expires";
                } else if (rule.event === "pending") {
                    messageRuleDateFormatted += "a booking request";
                } else if (rule.event === "doorUnlocked") {
                    messageRuleDateFormatted += "the door was unlocked";
                } else if (rule.event === "checkinChanged") {
                    messageRuleDateFormatted += "the check-in date is changed";
                } else if (rule.event === "checkoutChanged") {
                    messageRuleDateFormatted += "the check-out date is changed";
                } else if (rule.event === "numberOfGuestsChanged") {
                    messageRuleDateFormatted += "the number of guests changed";
                } else if (rule.event === "cancelled") {
                    messageRuleDateFormatted += "a booking is canceled";
                }
            }
            const cardBodyClasses = classNames("card-body", {
                global:
                    (rule.isGlobal && !isAllListingsPage) ||
                    (rule.listingGroupID && !isListingGroupPage),
                "bg-light": rule.paused
            });
            const actionButtonClasses = classNames("btn btn-xs", {
                "btn-outline-danger": rule.paused,
                "btn-outline-primary": !rule.paused
            });
            let limitDaysFormatted;
            let limitEventFormatted;
            if (rule.isLimited) {
                limitDaysFormatted = Object.keys(rule.limitDays).reduce((result, day) => {
                    if (rule.limitDays[day]) {
                        result.push(day.charAt(0).toUpperCase() + day.substring(1, 2));
                    }
                    return result;
                }, []);
                limitDaysFormatted = limitDaysFormatted.join(", ");
                limitEventFormatted = `${rule.limitEvent} on`;
            }
            let languages = "";
            if (rule.languagesEnabled) {
                if (rule.reviewEnabled) {
                    languages = Object.keys(rule.reviewMessage);
                } else if (rule.messages) {
                    languages = Object.keys(rule.messages);
                } else {
                    languages = [];
                }
                languages = languages.filter(language => {
                    return language !== "default";
                });
                languages = languages.join(",").toLocaleUpperCase();
            }
            const isReviewPossible =
                rule.event === "checkout" &&
                rule.days >= 0 &&
                !rule.emailEnabled &&
                !rule.smsEnabled;
            const isLastMinutePossible =
                rule.event === "checkin" &&
                rule.days <= 0 &&
                !rule.emailEnabled &&
                !rule.smsEnabled;
            result.push(
                <div className={timelineRowClasses} key={rule._id}>
                    {!rule.paused && (
                        <div className="timeline-icon d-flex justify-content-center align-items-center bg-success text-white">
                            <FiCheck />
                        </div>
                    )}
                    {rule.paused && (
                        <div className="timeline-icon d-flex justify-content-center align-items-center bg-danger text-white">
                            <FiX />
                        </div>
                    )}
                    {!rule.isFiller && (
                        <div className="timeline-time text-truncate">
                            <b>{rule.title}</b>
                            &nbsp;-&nbsp;
                            {formattedEvent}
                            <span className="text-muted">{messageRuleDateFormatted}</span>
                        </div>
                    )}
                    <div className="card timeline-content">
                        <div className={cardBodyClasses}>
                            {(!rule.reviewEnabled || rule.sendMessageAfterLeavingReview) && (
                                <pre className="card-text mt-0">
                                    {typeof rule.messages === "object" && rule.messages.default}
                                    {typeof rule.messages !== "object" && rule.message}
                                </pre>
                            )}
                            {isLastMinutePossible && rule.lastMinuteMessageEnabled && (
                                <div className="pt-3">
                                    <h6>LAST MINUTE MESSAGE:</h6>
                                    <pre className="card-text mt-0">
                                        {rule.lastMinuteMessage === "" &&
                                            rule.lastMinuteMessages &&
                                            rule.lastMinuteMessages.default}
                                        {rule.lastMinuteMessage !== "" && rule.lastMinuteMessage}
                                    </pre>
                                </div>
                            )}
                            {isReviewPossible && rule.reviewEnabled && (
                                <div className="pt-3">
                                    <h6>5 STAR REVIEW:</h6>
                                    <pre className="card-text mt-0">
                                        {rule.reviewMessage === "" && rule.reviewMessages.default}
                                        {rule.reviewMessage !== "" && rule.reviewMessage}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="message-footer card-footer d-flex justify-content-between">
                            {rule.preapproval && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>Preapproval</h5>
                                        <h6>Enabled</h6>
                                    </div>
                                </div>
                            )}
                            {rule.delay !== 0 && rule.delay && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>Delay</h5>
                                        <h6>{`${rule.delay} min`}</h6>
                                    </div>
                                </div>
                            )}
                            {rule.emailEnabled && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>Delivery</h5>
                                        <h6>Email</h6>
                                    </div>
                                </div>
                            )}
                            {rule.smsEnabled && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>Delivery</h5>
                                        <h6>SMS</h6>
                                    </div>
                                </div>
                            )}
                            {rule.disableMessageAfterReview && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>After Review</h5>
                                        <h6>Don&apos;t Send</h6>
                                    </div>
                                </div>
                            )}
                            {rule.languagesEnabled && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>Languages</h5>
                                        <h6>{languages}</h6>
                                    </div>
                                </div>
                            )}
                            {rule.isLimited && (
                                <div className="media text-truncate">
                                    <div className="media-body text-truncate">
                                        <h5>{limitEventFormatted}</h5>
                                        <h6>{limitDaysFormatted}</h6>
                                    </div>
                                </div>
                            )}
                            <div className="this_is_here_to_fix_right_left_spacing_when_there_is_only_1_item" />
                            {((isListingPage && !rule.isGlobal && !rule.listingGroupID) ||
                                (isListingGroupPage && !rule.isGlobal) ||
                                isAllListingsPage) && (
                                <Dropdown alignRight>
                                    <Dropdown.Toggle
                                        variant="none"
                                        className={actionButtonClasses}
                                        disabled={rule.isFiller}
                                    >
                                        {showSpinner[rule._id] && (
                                            <FaCircleNotch className="fa-spin mr-1" />
                                        )}
                                        {rule.paused && "Paused"}
                                        {!rule.paused && "Actions"}
                                        <FiChevronDown className="ml-1" />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {!rule.paused && (
                                            <Dropdown.Item
                                                as={Button}
                                                onClick={() => this.handleToggleMessageRule(rule)}
                                            >
                                                <FiPause className="mr-1" />
                                                Pause
                                            </Dropdown.Item>
                                        )}
                                        {rule.paused && (
                                            <Dropdown.Item
                                                as={Button}
                                                onClick={() => this.handleToggleMessageRule(rule)}
                                            >
                                                <FiPlay className="mr-1" />
                                                Enable
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Item
                                            as={Button}
                                            onClick={() => {
                                                this.handleShowEditMessageRule(rule);
                                            }}
                                        >
                                            <FiEdit2 className="mr-1" />
                                            Edit
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item
                                            as={Button}
                                            onClick={() => this.showConfirmDeleteMessageNow(rule)}
                                            className="text-danger"
                                        >
                                            <FiTrash2 className="mr-1" />
                                            Delete
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                            {isListingPage && rule.listingGroupID && (
                                <Link
                                    to={`/messaging/${rule.listingGroupID}`}
                                    roll="button"
                                    className="btn btn-xs btn-outline-primary"
                                >
                                    <FiExternalLink className="mr-1" />
                                    <span className="d-none d-sm-inline">
                                        View in Listing Group
                                    </span>
                                </Link>
                            )}
                            {((isListingPage && rule.isGlobal) ||
                                (isListingGroupPage && rule.isGlobal)) && (
                                <Link
                                    to="/messaging/all"
                                    roll="button"
                                    className="btn btn-xs btn-outline-primary"
                                >
                                    <FiExternalLink className="mr-1" />
                                    <span className="d-none d-sm-inline">View in All Listings</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            );
            return result;
        }, []);
        let listingName = "";
        if (isAllListingsPage) {
            listingName = "All Listings";
        } else if (isListingGroupPage) {
            listingName = listingGroup.name;
        } else if (isListingPage) {
            listingName = listing.nickname;
            if (!listingName) {
                listingName = listing.airbnbName;
            }
        }

        const isLoading = messageRules.length && messageRules[0].isFiller;

        return (
            <div className="az-content">
                <div className="container">
                    <div className="az-content-body">
                        <div className="d-flex justify-content-between mb-3 flex-column flex-md-row">
                            <div className="mb-3 mb-md-0">
                                <div className="az-content-breadcrumb">
                                    <span>Home</span>
                                    <FiChevronRight />
                                    <span>Messaging</span>
                                </div>
                                <h2 className="az-content-title mb-0">{listingName}</h2>
                            </div>
                            <div className="d-flex align-items-center justify-content-end">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() => {
                                            this.handleShowEditMessageRule();
                                        }}
                                        disabled={isLoading}
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Rule
                                    </button>
                                    {isListingPage && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark"
                                            onClick={() =>
                                                this.handleShowListingSettingModal(listing)
                                            }
                                        >
                                            <FiSettings />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {messageRules.length !== 0 && (
                            <div className="timeline timeline-center mt-3">
                                <div className="timeline-container">{timeline}</div>
                            </div>
                        )}
                        <Errors
                            errors={errors}
                            showAddMessageRule={() => {
                                this.handleShowEditMessageRule();
                            }}
                        />
                    </div>
                </div>
                <ModalEditMessageRule
                    show={showEditMessageRuleModal}
                    onHide={this.handleCloseModal}
                    messageRule={messageRule}
                    listing={listing}
                    airbnbUserID={airbnbUserID}
                    airbnbListingID={airbnbListingID}
                />
                <ModalConfirm
                    show={showConfirmModal}
                    onHide={this.handleCloseConfirmModal}
                    {...confirmModal}
                />
                <ModalListingSettings
                    show={showListingSettingsModal}
                    onHide={this.handleCloseModal}
                    listing={listing}
                    listings={listings}
                />
            </div>
        );
    }
}

Messaging.propTypes = {
    match: ReactRouterPropTypes.match.isRequired,
    updateUser: PropTypes.func.isRequired,
    user: PropTypes.shape({
        isFiller: PropTypes.bool,
        isBeta: PropTypes.bool,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        username: PropTypes.string,
        subscriptionStatus: PropTypes.string,
        _id: PropTypes.string,
        accounts: PropTypes.arrayOf(PropTypes.shape({})),
        listings: PropTypes.arrayOf(
            PropTypes.shape({
                globalMessageRulesCount: PropTypes.number,
                uniqueMessageRulesCount: PropTypes.number,
                pricingRulesCount: PropTypes.number,
                airbnbListingID: PropTypes.string,
                airbnbUserID: PropTypes.string,
                nickname: PropTypes.string,
                airbnbName: PropTypes.string
            })
        ),
        listingGroups: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string,
                name: PropTypes.string,
                uniqueMessageRulesCount: PropTypes.number
            })
        ),
        globalMessageRulesCount: PropTypes.number
    }).isRequired
};

const ConnectedMessaging = props => (
    <UserConsumer>
        {({user, updateUser}) => <Messaging {...props} user={user} updateUser={updateUser} />}
    </UserConsumer>
);
export default withRouter(ConnectedMessaging);
