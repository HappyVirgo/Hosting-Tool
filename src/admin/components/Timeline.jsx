import classNames from "classnames";
import {
    addDays,
    format,
    isSameDay,
    isToday,
    isTomorrow,
    isWithinInterval,
    isYesterday,
    subDays,
    formatDistanceToNow,
    parseISO
} from "date-fns";
import PropTypes from "prop-types";
import React from "react";
import {Dropdown, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiCheck, FiChevronDown, FiEdit2, FiExternalLink, FiSend, FiSlash} from "react-icons/fi";

import defaultAvatar from "../img/default-avatar.png";
import {messageType} from "../types";

function Timeline(props) {
    const {
        showSpinner,
        isPast,
        messages,
        showConfirmSendMessageNow,
        disableMessage,
        handleShowCustomizeMessage,
        handleShowCustomizeReview
    } = props;
    let isEven;
    const messagesCopy = [...messages];
    if (!isPast) {
        messagesCopy.reverse();
    }
    const timeline = messagesCopy.reduce((result, message, index, messagesCopy) => {
        let messageDate = new Date(message.sentDate);
        if (!message.sentDate) {
            messageDate = new Date(message.sendDate);
        }
        let isSame = false;
        if (index !== 0) {
            let lastMessageDate = messagesCopy[index - 1].sentDate;
            if (!lastMessageDate) {
                lastMessageDate = messagesCopy[index - 1].sendDate;
            }
            isSame = isSameDay(messageDate, new Date(lastMessageDate));
            const isSameReservation =
                messagesCopy[index - 1].airbnbConfirmationCode === message.airbnbConfirmationCode;
            if (!isSameReservation || !isSame) {
                isEven = !isEven;
            }
        }
        if (!isSame) {
            let dateString = format(messageDate, "eee, MMMM do yyyy");
            if (isToday(messageDate)) {
                dateString = "Today";
            } else if (isTomorrow(messageDate)) {
                dateString = "Tomorrow";
            } else if (
                isWithinInterval(messageDate, {
                    start: new Date(),
                    end: addDays(new Date(), 7)
                })
            ) {
                dateString = format(messageDate, "eeee");
            } else if (isYesterday(messageDate)) {
                dateString = "Yesterday";
            } else if (
                isWithinInterval(messageDate, {
                    start: subDays(new Date(), 7),
                    end: new Date()
                })
            ) {
                dateString = `Last ${format(messageDate, "eeee")}`;
            }
            result.push(
                <div className="az-chat-time" key={dateString}>
                    <span>{dateString}</span>
                </div>
            );
        }
        // } else {
        //     isEven = isPast;
        // }
        const timelineRowClasses = classNames("media flex-row-reverse future");
        const mediaBodyClasses = classNames("media-body", {
            sent: message.status === "sent" || message.status === "disabled"
        });

        let limitDaysFormatted;
        let limitEventFormatted;
        if (message.isLimited) {
            limitDaysFormatted = Object.keys(message.limitDays).reduce((result, day) => {
                if (message.limitDays[day]) {
                    result.push(day.charAt(0).toUpperCase() + day.substring(1, 2));
                }
                return result;
            }, []);
            limitDaysFormatted = limitDaysFormatted.join(", ");
            limitEventFormatted = `${message.limitEvent} on`;
        }

        const reviewClasses = classNames({
            "pt-3": message.sendMessageAfterLeavingReview
        });

        const statusClasses = classNames("alert y-2-0 y-2-10", {
            "alert-danger": message.statusType === "danger",
            "alert-warning": message.statusType === "warning",
            "alert-success": message.statusType === "success",
            "alert-info": !message.statusType
        });
        let thumbnail = message.airbnbThumbnailUrl;
        if (!thumbnail) {
            thumbnail = defaultAvatar;
        }
        result.push(
            <div className={timelineRowClasses} key={message._id}>
                <div className="az-img-user online">
                    <img src={thumbnail} alt="" />
                </div>
                <div className={mediaBodyClasses}>
                    <div className="az-msg-wrapper w-100">
                        {(!message.reviewEnabled || message.sendMessageAfterLeavingReview) && (
                            <pre>{message.sendMessage ? message.sendMessage : message.message}</pre>
                        )}
                        {message.reviewEnabled && (
                            <div className={reviewClasses}>
                                <h6>5 STAR REVIEW:</h6>
                                <pre>
                                    {message.sendReview ? message.sendReview : message.review}
                                </pre>
                            </div>
                        )}
                        {!!message.status &&
                            message.status !== "disabled" &&
                            message.status !== "enabled" &&
                            message.status !== "sent" && (
                                <div className={statusClasses} role="alert">
                                    {message.statusMessage}
                                </div>
                            )}
                    </div>
                    <div className="message-footer card-footer d-flex justify-content-between">
                        {message.status === "sent" && (
                            <div className="media">
                                <div className="media-body">
                                    <h5>Status</h5>
                                    <h6>Sent</h6>
                                </div>
                            </div>
                        )}
                        {message.status === "disabled" && (
                            <div className="media">
                                <div className="media-body">
                                    <h5>Status</h5>
                                    <h6>Disabled</h6>
                                </div>
                            </div>
                        )}
                        {message.emailEnabled && (
                            <div className="media">
                                <div className="media-body">
                                    <h5>Delivery</h5>
                                    <h6>Email</h6>
                                </div>
                            </div>
                        )}
                        {message.smsEnabled && (
                            <div className="media">
                                <div className="media-body">
                                    <h5>Delivery</h5>
                                    <h6>SMS</h6>
                                </div>
                            </div>
                        )}
                        {message.isLimited && (
                            <div className="media text-truncate">
                                <div className="media-body text-truncate">
                                    <h5>{limitEventFormatted}</h5>
                                    <h6>{limitDaysFormatted}</h6>
                                </div>
                            </div>
                        )}
                        <div className="media text-truncate">
                            <div className="media-body text-truncate y-2-10">
                                <h5>Listing</h5>
                                <h6 className="text-truncate" alt={message.listingName}>
                                    {message.listingName}
                                </h6>
                            </div>
                        </div>
                        <Dropdown alignRight>
                            <Dropdown.Toggle
                                variant="none"
                                className="btn btn-xs btn-outline-primary"
                                disabled={message.isFiller}
                            >
                                {showSpinner[message._id] === true && (
                                    <FaCircleNotch className="fa-spin mr-1" />
                                )}
                                Actions
                                <FiChevronDown className="ml-1" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {!message.sendDateHasPassed &&
                                    message.status !== "sent" &&
                                    message.status !== "disabled" &&
                                    (!message.reviewEnabled ||
                                        message.sendMessageAfterLeavingReview) && (
                                        <Dropdown.Item
                                            onClick={() => handleShowCustomizeMessage(message)}
                                        >
                                            <FiEdit2 className="mr-1" />
                                            Edit Message
                                        </Dropdown.Item>
                                    )}
                                {!message.sendDateHasPassed &&
                                    message.status !== "sent" &&
                                    message.status !== "disabled" &&
                                    message.reviewEnabled && (
                                        <Dropdown.Item
                                            onClick={() => handleShowCustomizeReview(message)}
                                        >
                                            <FiEdit2 className="mr-1" />
                                            Edit Review
                                        </Dropdown.Item>
                                    )}
                                {!message.sendDateHasPassed &&
                                    message.status !== "sent" &&
                                    message.status !== "disabled" && (
                                        <Dropdown.Item
                                            onClick={() => {
                                                disableMessage(message);
                                            }}
                                        >
                                            <FiSlash className="mr-1" />
                                            Disable
                                        </Dropdown.Item>
                                    )}
                                {message.status === "disabled" && !message.sendDateHasPassed && (
                                    <Dropdown.Item
                                        onClick={() => {
                                            disableMessage(message);
                                        }}
                                    >
                                        <FiCheck className="mr-1" />
                                        Enable
                                    </Dropdown.Item>
                                )}
                                {!message.sendDateHasPassed &&
                                    message.status !== "sent" &&
                                    message.status !== "disabled" && (
                                        <Dropdown.Item
                                            onClick={() => {
                                                showConfirmSendMessageNow(message);
                                            }}
                                        >
                                            <FiSend className="mr-1" />
                                            Send Now
                                        </Dropdown.Item>
                                    )}
                                {!message.sendDateHasPassed &&
                                    message.status !== "sent" &&
                                    message.status !== "disabled" && <Dropdown.Divider />}
                                {message.hasMatchingMessageRule && !message.isGlobalMessageRule && (
                                    <Dropdown.Item
                                        href={`/messaging/${message.airbnbUserID}/${message.airbnbListingID}`}
                                    >
                                        <FiEdit2 className="mr-1" />
                                        Edit Rule
                                    </Dropdown.Item>
                                )}
                                {message.hasMatchingMessageRule && message.isGlobalMessageRule && (
                                    <Dropdown.Item href="/messaging/all">
                                        <FiEdit2 className="mr-1" />
                                        Edit Rule
                                    </Dropdown.Item>
                                )}
                                {!message.hasMatchingMessageRule && (
                                    <OverlayTrigger
                                        placement="left"
                                        overlay={<Tooltip>Rule no longer exists.</Tooltip>}
                                    >
                                        <Dropdown.Item disabled>
                                            <FiEdit2 className="mr-1" />
                                            Edit Rule
                                        </Dropdown.Item>
                                    </OverlayTrigger>
                                )}
                                {/* <Dropdown.Divider />
                                <Dropdown.Item
                                    target="_blank"
                                    href={`https://www.airbnb.com/messaging/qt_for_reservation/${message.airbnbConfirmationCode}`}
                                >
                                    <FiExternalLink className="mr-1" />
                                    Airbnb
                                </Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div>
                        <span>{`sends in ${formatDistanceToNow(parseISO(message.sendDate))}`}</span>
                    </div>
                </div>
            </div>
        );
        return result;
    }, []);

    if (isPast) {
        timeline.reverse();
    }
    return timeline;
}

Timeline.propTypes = {
    messages: PropTypes.arrayOf(messageType).isRequired,
    showSpinner: PropTypes.shape({}).isRequired,
    isPast: PropTypes.bool,
    showConfirmSendMessageNow: PropTypes.func.isRequired,
    disableMessage: PropTypes.func.isRequired,
    handleShowCustomizeMessage: PropTypes.func.isRequired,
    handleShowCustomizeReview: PropTypes.func.isRequired
};

Timeline.defaultProps = {
    isPast: false
};

export default Timeline;
