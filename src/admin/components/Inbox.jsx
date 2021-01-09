import classNames from "classnames";
import React, {useState, useEffect, useContext} from "react";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {
    formatDistanceToNow,
    parseISO,
    format,
    subDays,
    isYesterday,
    addDays,
    isTomorrow,
    isWithinInterval,
    isToday,
    isSameDay
} from "date-fns";
import TextareaAutosize from "react-textarea-autosize";
import {FiSend, FiChevronLeft, FiX, FiSearch, FiRefreshCw, FiExternalLink} from "react-icons/fi";
import {useLocation, useParams, useHistory} from "react-router-dom";
import Fuse from "fuse.js";

import logoSquare from "../img/logo-icon-square.svg";
import airbnbIcon from "../img/airbnb-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";
import {UserContext} from "../providers/UserProvider";
import defaultAvatar from "../img/default-avatar.png";

import Errors from "./Errors";
import ModalConfirm from "./ModalConfirm";
import ModalCustomizeMessage from "./ModalCustomizeMessage";
import ModalCustomizeReview from "./ModalCustomizeReview";
import Timeline from "./Timeline";

function Inbox() {
    const {
        user: {listings},
        updateUser,
        errors
    } = useContext(UserContext);

    const history = useHistory();
    const location = useLocation();
    const params = useParams();
    const {search} = location;

    const [confirmModal, setConfirmModal] = useState({});
    const [threadErrors, setThreadErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState({});
    const [reservations, setReservations] = useState([]);
    const [posts, setPosts] = useState([]);
    const [timelines, setTimelines] = useState([]);
    const [reservation, setReservation] = useState({
        isFiller: true,
        airbnbFirstName: "-",
        airbnbLastName: "",
        source: "-",
        airbnbThumbnailUrl: defaultAvatar,
        listing: {nickname: " "}
    });
    const [message, setMessage] = useState("");
    const [showTimeline, setShowTimeline] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCustomizeMessageModal, setShowCustomizeMessageModal] = useState(false);
    const [showCustomizeReviewModal, setShowCustomizeReviewModal] = useState(false);
    const [modalMessage, setModalMessage] = useState({});
    const [sort, setSort] = useState("recent");
    const [showChat, setShowChat] = useState(false);
    const [query, setQuery] = useState(new URLSearchParams(search).get("q"));

    useEffect(() => {
        const tagManagerArgs = {
            dataLayer: {
                page: "Inbox"
            }
        };
        TagManager.dataLayer(tagManagerArgs);
    }, []);

    useEffect(() => {
        let query = new URLSearchParams(search).get("q");
        if (!query) {
            query = "";
        }
        setQuery(query);
        // Build list of all reservations
        const allReservations = listings.reduce((result, listing) => {
            const {nickname, airbnbName} = listing;
            const reservations = listing.reservations.map(reservation => {
                reservation.listing = {nickname, airbnbName};
                return reservation;
            });
            result = [...result, ...reservations];
            return result;
        }, []);
        let newReservations = allReservations;
        if (query) {
            setSort("search");
            const options = {
                // isCaseSensitive: false,
                // includeScore: false,
                // shouldSort: true,
                // includeMatches: false,
                // findAllMatches: false,
                // minMatchCharLength: 1,
                // location: 0,
                // threshold: 0.6,
                // distance: 100,
                // useExtendedSearch: false,
                keys: [
                    "airbnbFirstName",
                    "airbnbLastName",
                    "airbnbConfirmationCode",
                    "listing.nickname",
                    "listing.airbnbName"
                ]
            };
            const fuse = new Fuse(newReservations, options);
            const results = fuse.search(query);
            newReservations = results.map(result => result.item);
        }
        if (sort === "scheduled") {
            newReservations.sort((a, b) => {
                if (!b.nextScheduledMessageAt) {
                    return -1;
                }
                return new Date(a.nextScheduledMessageAt) - new Date(b.nextScheduledMessageAt);
            });
        } else if (!query) {
            newReservations.sort((a, b) => {
                if (!b.airbnbLastMessageAt) {
                    return -1;
                }
                return new Date(b.airbnbLastMessageAt) - new Date(a.airbnbLastMessageAt);
            });
        }
        // Filter out duplicate threadIDs
        newReservations = newReservations.filter((newReservation, index, self) => {
            const newIndex = self.findIndex(r => {
                return r.airbnbThreadID === newReservation.airbnbThreadID;
            });
            const isDuplicate = index !== newIndex;
            return !isDuplicate; // && foundQuery;
        });
        setReservations(newReservations);
        if (reservation.isFiller && newReservations.length) {
            let newReservation = newReservations[0];
            if (params.reservationID) {
                newReservation = allReservations.find(reservation => {
                    return reservation._id === params.reservationID;
                });
            }
            getThread(true, newReservation);
        }
    }, [listings, sort, search]);

    useEffect(() => {
        const {_id, isFiller} = reservation;
        if (!isFiller) {
            history.replace(`/inbox/${_id}${search}`);
        }
    }, [reservation]);

    async function onRefresh() {
        try {
            await updateUser();
        } catch (error) {
            console.error("error", error);
            throw error;
        }
    }

    async function getThread(update = false, res = false) {
        try {
            if (!res) {
                // if no reservation supplied, use the reservation state
                res = reservation;
            } else {
                // if a reservation was supplied, save it to the reservation state
                await setReservation(res);
            }
            const {_id} = res;
            const newErrors = {};
            newErrors[_id] = false;
            setThreadErrors(threadErrors => {
                return {...threadErrors, ...newErrors};
            });
            const newShowSpinner = {};
            newShowSpinner[_id] = true;
            setShowSpinner(showSpinner => {
                return {...showSpinner, ...newShowSpinner};
            });
            let url = `/getThread/${_id}`;
            if (update) {
                url = `/getThread/${_id}/${update}`;
            }
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            if (response.ok && response.status === 403) {
                const result = await response.json();
                const newErrors = {};
                newErrors[_id] = result.error;
                setThreadErrors(threadErrors => {
                    return {...threadErrors, ...newErrors};
                });
                // history.push("/");
            } else if (response.ok) {
                const newShowSpinner = {};
                newShowSpinner[_id] = false;
                setShowSpinner(showSpinner => {
                    return {...showSpinner, ...newShowSpinner};
                });
                const result = await response.json();
                await setPosts(result.posts);

                await setTimelines(result.timelines);
                const newErrors = {};
                newErrors[_id] = result.error;
                setThreadErrors(threadErrors => {
                    return {...threadErrors, ...newErrors};
                });
            } else {
                const newShowSpinner = {};
                newShowSpinner[_id] = false;
                setShowSpinner(showSpinner => {
                    return {...showSpinner, ...newShowSpinner};
                });
                const result = await response.json();
                const newErrors = {};
                newErrors[_id] = result.error;
                setThreadErrors(threadErrors => {
                    return {...threadErrors, ...newErrors};
                });
                // history.push("/");
            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    function loadReservation(reservation) {
        setPosts([]);
        setTimelines([]);
        getThread(true, reservation);
        setShowChat(true);
    }

    async function sendMessage() {
        try {
            setShowSpinner(showSpinner => {
                return {...showSpinner, sending: true};
            });
            const url = "/sendMessage";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({message, reservationID: reservation._id})
            });
            if (response.ok) {
                setMessage("");
                // Get a post by the host to get their thumbnail
                const hostPost = posts.find(post => {
                    const {thumbnailUrl, isGuest} = post;
                    return thumbnailUrl && isGuest === false;
                });
                let thumbnailUrl;
                if (hostPost) {
                    thumbnailUrl = hostPost.thumbnailUrl;
                }
                setPosts([
                    {
                        message,
                        sentTimestamp: new Date(),
                        isGuest: false,
                        thumbnailUrl
                    },
                    ...posts
                ]);
                // setTimeout(async () => {
                //     await getThread(true);
                // }, 5000);
            } else {
                console.log("response", response);
                // history.push("/");
            }
            await setShowSpinner(showSpinner => {
                return {...showSpinner, sending: false};
            });
        } catch (error) {
            console.log("error", error);
            showSpinner.sending = false;
            await setShowSpinner(showSpinner => {
                return {...showSpinner, sending: false};
            });
        }
    }

    function handleShowCustomizeMessage(message) {
        setShowCustomizeMessageModal(true);
        setModalMessage(message);
    }

    function handleShowCustomizeReview(message) {
        setShowCustomizeReviewModal(true);
        setModalMessage(message);
    }

    async function handleCloseModal(update) {
        try {
            if (update) {
                // await this.setState(this.constructor.getInitialMessagesState());
                await getThread(true);
            }
            setShowCustomizeMessageModal(false);
            setShowCustomizeReviewModal(false);
            setShowConfirmModal(false);
        } catch (error) {
            console.log("error: ", error);
        }
    }

    async function handleCloseSendMessageNowConfirmModal(isConfirmed) {
        try {
            if (isConfirmed) {
                const {
                    airbnbUserID,
                    airbnbListingID,
                    airbnbConfirmationCode,
                    messageRuleID
                } = confirmModal.data;
                const url = "/sendMessageNow";
                const fields = {
                    airbnbUserID,
                    airbnbListingID,
                    airbnbConfirmationCode,
                    messageRuleID
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
                    setTimeout(() => {
                        handleCloseModal(true);
                    }, 2000);
                } else {
                    console.log("response", response);
                    // history.push("/");
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    function showConfirmSendMessageNow(message) {
        setShowConfirmModal(true);
        setConfirmModal({
            title: "Send Message Now?",
            message: "Are you sure you would like to send this message right now?",
            buttonText: "Send",
            data: message
        });
    }

    async function disableMessage(message) {
        try {
            const newShowSpinner = {};
            newShowSpinner[message._id] = true;
            setShowSpinner(showSpinner => {
                return {...showSpinner, ...newShowSpinner};
            });

            const {
                messageRuleID,
                airbnbUserID,
                airbnbListingID,
                airbnbConfirmationCode,
                status
            } = message;
            const url = "/disableMessage";
            const fields = {
                status,
                messageRuleID,
                airbnbUserID,
                airbnbListingID,
                airbnbConfirmationCode
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
                // await this.setState(this.constructor.getInitialMessagesState());
                await getThread(false);
                const newShowSpinner = {};
                newShowSpinner[message._id] = false;
                setShowSpinner(showSpinner => {
                    return {...showSpinner, ...newShowSpinner};
                });
            } else {
                console.log("response", response);
                // history.push("/");
            }
        } catch (error) {
            const newShowSpinner = {};
            newShowSpinner[message._id] = false;
            setShowSpinner(showSpinner => {
                return {...showSpinner, ...newShowSpinner};
            });
            console.log("error", error);
        }
    }

    async function handleChange(event) {
        const query = event.target.value;
        await setQuery(query);
    }

    async function handleSearch(event) {
        event.preventDefault();
        history.push(`/inbox?q=${encodeURIComponent(query)}`);
    }

    async function handleClearQuery() {
        history.push(location.pathname);
        await setQuery("");
    }

    let icon = airbnbIcon;
    let externalReservationURL = `https://www.airbnb.com/messaging/qt_for_reservation/${reservation.airbnbConfirmationCode}`;
    if (reservation.source === "HomeAway") {
        icon = homeawayIcon;
        externalReservationURL = `https://www.homeaway.com/rm/${reservation.airbnbListingID}/conversation/${reservation.airbnbThreadID}`;
    }

    const sortRecentClassnames = classNames("nav-link btn btn-link btn-xs", {
        active: sort === "recent"
    });
    const sortScheduledClassnames = classNames("nav-link btn btn-link btn-xs", {
        active: sort === "scheduled"
    });
    const sortSearchClassnames = classNames("nav-link btn btn-link btn-xs", {
        active: sort === "search"
    });
    let reservationDateRange = "";
    if (reservation.startDate && reservation.endDate) {
        const startDate = parseISO(reservation.startDate);
        const endDate = parseISO(reservation.endDate);
        if (format(startDate, "MMM") === format(endDate, "MMM")) {
            reservationDateRange = `${format(startDate, "MMM d")} - ${format(endDate, "d, y")}`;
        } else {
            reservationDateRange = `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, y")}`;
        }
    }
    let reservationStatus = "";
    if (reservation.status === "accepted") {
        reservationStatus = " (Accepted)";
    } else if (reservation.status === "inquiry") {
        reservationStatus = " (Inquiry)";
    } else if (reservation.status === "preapproved") {
        reservationStatus = " (Pre-Approved)";
    } else if (reservation.status === "timedout") {
        reservationStatus = " (Expired Pre-Approval)";
    } else if (reservation.status === "denied") {
        reservationStatus = " (Denied)";
    } else if (reservation.status === "pending") {
        reservationStatus = " (Booking Request)";
    } else if (reservation.status === "cancelled") {
        reservationStatus = " (Cancelled)";
    }
    const listingName = reservation.listing.nickname
        ? reservation.listing.nickname
        : reservation.listing.airbnbName;

    const leftSideBarClassnames = classNames(
        "az-content-left az-content-left-chat bd-r bd-gray-300",
        {
            "d-none d-lg-flex": showChat
        }
    );
    const chatBodyClassnames = classNames("az-content-body az-content-body-chat", {
        "d-none d-lg-flex": !showChat
    });
    return (
        <div className="az-content noPadding az-content-app">
            <Errors errors={errors} onRefresh={onRefresh} />
            {!errors.hasErrors && showChat && (
                <div className="d-md-none pl-2 pr-2 pb-2 d-flex">
                    <button
                        className="az-header-arrow btn bg-white pd-l-10 pd-0"
                        type="button"
                        onClick={() => {
                            setShowChat(false);
                        }}
                    >
                        <FiChevronLeft />
                    </button>
                </div>
            )}
            {!errors.hasErrors && (
                <div className="container flex-row">
                    <div className={leftSideBarClassnames}>
                        <div id="azChatList" className="az-chat-list">
                            <nav className="nav az-nav-line az-nav-line-chat">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClearQuery();
                                        setSort("recent");
                                    }}
                                    className={sortRecentClassnames}
                                >
                                    Recent
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClearQuery();
                                        setSort("scheduled");
                                    }}
                                    className={sortScheduledClassnames}
                                >
                                    Scheduled
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSort("search");
                                    }}
                                    className={sortSearchClassnames}
                                >
                                    Search
                                </button>
                            </nav>
                            {sort === "search" && (
                                <div className="media">
                                    <form
                                        className="search"
                                        onSubmit={event => handleSearch(event)}
                                    >
                                        <input
                                            type="search"
                                            className="form-control"
                                            placeholder="Search..."
                                            value={query}
                                            onChange={handleChange}
                                        />
                                        {!query && (
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={handleSearch}
                                            >
                                                <FiSearch />
                                            </button>
                                        )}
                                        {!!query && (
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={handleClearQuery}
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </form>
                                </div>
                            )}
                            {reservations.map(res => {
                                const {
                                    airbnbFirstName,
                                    airbnbLastName,
                                    airbnbThumbnailUrl,
                                    source,
                                    airbnbLastMessageAt,
                                    listing,
                                    _id
                                } = res;
                                if (source !== "Airbnb" && source !== "HomeAway") {
                                    return;
                                }
                                let timeFromNow = "";
                                if (airbnbLastMessageAt) {
                                    timeFromNow = formatDistanceToNow(
                                        parseISO(airbnbLastMessageAt)
                                    );
                                }

                                let reservationDateRange = "";
                                if (res.startDate && res.endDate) {
                                    const startDate = parseISO(res.startDate);
                                    const endDate = parseISO(res.endDate);
                                    if (format(startDate, "MMM") === format(endDate, "MMM")) {
                                        reservationDateRange = `${format(
                                            startDate,
                                            "MMM d"
                                        )} - ${format(endDate, "d, y")}`;
                                    } else {
                                        reservationDateRange = `${format(
                                            startDate,
                                            "MMM d"
                                        )} - ${format(endDate, "MMM d, y")}`;
                                    }
                                }
                                const mediaClassNames = classNames("media", {
                                    selected: _id === reservation._id
                                });
                                let thumbnail = airbnbThumbnailUrl;
                                if (!thumbnail || thumbnail.includes("default-profile-pic.png")) {
                                    thumbnail = defaultAvatar;
                                }
                                const listingName = listing.nickname
                                    ? listing.nickname
                                    : listing.airbnbName;
                                return (
                                    <div
                                        key={_id}
                                        className={mediaClassNames}
                                        onClick={() => {
                                            loadReservation(res);
                                        }}
                                        onKeyPress={() => {
                                            loadReservation(res);
                                        }}
                                        role="presentation"
                                    >
                                        <div className="az-img-user">
                                            <img src={thumbnail} alt="" />
                                        </div>
                                        <div className="media-body text-truncate">
                                            <div className="media-contact-name">
                                                <span className="text-truncate d-flex align-items-center">
                                                    {airbnbFirstName}
                                                    &nbsp;
                                                    {airbnbLastName}
                                                </span>
                                                <span className="text-right mg-l-5">
                                                    {timeFromNow}
                                                </span>
                                            </div>
                                            <div className="media-contact-name">
                                                <div className="text-truncate d-flex align-items-center text-muted tx-11">
                                                    {listingName}
                                                </div>
                                                <span className="text-right mg-l-5">
                                                    {reservationDateRange}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={chatBodyClassnames}>
                        <div className="az-chat-header">
                            <div className="az-img-user">
                                <img
                                    src={reservation.airbnbThumbnailUrl}
                                    alt={`${reservation.airbnbFirstName} ${reservation.airbnbLastName}`}
                                />
                            </div>
                            {!reservation.isFiller && (
                                <div className="az-chat-msg-name text-truncate">
                                    <h6>
                                        {reservation.airbnbFirstName}
                                        &nbsp;
                                        {reservation.airbnbLastName}
                                    </h6>
                                    <div className="text-muted tx-11 text-truncate">{`${reservationDateRange}${reservationStatus} - ${listingName}`}</div>
                                </div>
                            )}
                            <nav className="nav">
                                {!reservation.isFiller && (
                                    <img
                                        alt={reservation.source}
                                        src={icon}
                                        className="icon buttonHeight mg-r-10 d-none d-sm-block"
                                    />
                                )}
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark"
                                        onClick={() => {
                                            getThread(true);
                                        }}
                                    >
                                        {showSpinner[reservation._id] && (
                                            <FiRefreshCw className="fa-spin" />
                                        )}
                                        {!showSpinner[reservation._id] && <FiRefreshCw />}
                                    </button>
                                    <a
                                        href={externalReservationURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-dark"
                                    >
                                        <FiExternalLink />
                                    </a>
                                    {/* <a href="" className="nav-link" data-toggle="tooltip" title="View Info">
                                <FiInfo />
                            </a> */}
                                </div>
                            </nav>
                        </div>

                        <div className="az-chat-body">
                            <div className="content-inner">
                                {showSpinner[reservation._id] && (
                                    <label htmlFor="loader" className="az-chat-time">
                                        <span>
                                            <FaCircleNotch className="fa-spin mr-1" />
                                            &nbsp;Loading...
                                        </span>
                                    </label>
                                )}
                                {posts &&
                                    posts.reduceRight((result, post, index, postsCopy) => {
                                        const isTimeline = !!post.sentDate;
                                        let {message, sentTimestamp, isGuest, thumbnailUrl} = post;
                                        let thumbnail;
                                        let type;
                                        if (isTimeline) {
                                            const {emailEnabled, sms, email} = post;
                                            message = post.sendMessage || post.message;
                                            sentTimestamp = post.sentDate;
                                            isGuest = false;
                                            thumbnailUrl = logoSquare;
                                            thumbnail = (
                                                <img
                                                    src={logoSquare}
                                                    className="rounded-0"
                                                    alt=""
                                                />
                                            );
                                            if (emailEnabled) {
                                                type = `${email} - `;
                                            } else {
                                                type = `${sms} - `;
                                            }
                                        } else if (thumbnailUrl) {
                                            thumbnail = <img src={thumbnailUrl} alt="" />;
                                        } else {
                                            thumbnail = <img src={defaultAvatar} alt="" />;
                                        }

                                        if (!message) {
                                            return result;
                                        }
                                        const timestamp = new Date(sentTimestamp);
                                        let isSame = true;
                                        if (index < posts.length - 1) {
                                            let lastSentTimeStamp =
                                                postsCopy[index + 1].sentTimestamp;
                                            if (!lastSentTimeStamp) {
                                                lastSentTimeStamp = postsCopy[index + 1].sentDate;
                                            }
                                            const lastTimestamp = new Date(lastSentTimeStamp);
                                            isSame = isSameDay(timestamp, lastTimestamp);
                                        }
                                        if (!isSame || index === posts.length - 1) {
                                            let dateString = format(timestamp, "eee, MMMM do yyyy");
                                            if (isToday(timestamp)) {
                                                dateString = "Today";
                                            } else if (isTomorrow(timestamp)) {
                                                dateString = "Tomorrow";
                                            } else if (
                                                isWithinInterval(timestamp, {
                                                    start: new Date(),
                                                    end: addDays(new Date(), 7)
                                                })
                                            ) {
                                                dateString = format(timestamp, "eeee");
                                            } else if (isYesterday(timestamp)) {
                                                dateString = "Yesterday";
                                            } else if (
                                                isWithinInterval(timestamp, {
                                                    start: subDays(new Date(), 7),
                                                    end: new Date()
                                                })
                                            ) {
                                                dateString = `Last ${format(timestamp, "eeee")}`;
                                            }
                                            result.push(
                                                <div className="az-chat-time" key={`D${timestamp}`}>
                                                    <span>{dateString}</span>
                                                </div>
                                            );
                                        }

                                        const messageClassnames = classNames("media", {
                                            "flex-row-reverse": !isGuest
                                        });
                                        result.push(
                                            <div
                                                key={`M${index}${sentTimestamp}`}
                                                className={messageClassnames}
                                            >
                                                <div className="az-img-user online">
                                                    {thumbnail}
                                                </div>
                                                <div className="media-body">
                                                    <pre className="az-msg-wrapper">{message}</pre>
                                                    <div>
                                                        <span>
                                                            {type}
                                                            {formatDistanceToNow(timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        return result;
                                    }, [])}

                                {threadErrors[reservation._id] && (
                                    <div className="alert alert-danger help-block text-danger text-center">
                                        <span>{threadErrors[reservation._id]}</span>
                                    </div>
                                )}

                                {timelines && timelines.length !== 0 && (
                                    <label className="az-chat-time">
                                        <button
                                            type="button"
                                            className="btn btn-link btn-xs"
                                            onClick={() => {
                                                setShowTimeline(!showTimeline);
                                            }}
                                        >
                                            {!showTimeline ? "Show" : "Hide"}
                                            &nbsp;Scheduled Messages
                                        </button>
                                    </label>
                                )}
                                {showTimeline && (
                                    <Timeline
                                        messages={timelines}
                                        showSpinner={showSpinner}
                                        showConfirmSendMessageNow={showConfirmSendMessageNow}
                                        disableMessage={disableMessage}
                                        handleShowCustomizeMessage={handleShowCustomizeMessage}
                                        handleShowCustomizeReview={handleShowCustomizeReview}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="az-chat-footer">
                            {/* <nav className="nav">
                            <a
                                href=""
                                className="nav-link"
                                data-toggle="tooltip"
                                title="Attach a File"
                            >
                                <FiPaperclip />
                            </a>
                        </nav> */}
                            <TextareaAutosize
                                className="form-control"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={event => {
                                    setMessage(event.target.value);
                                }}
                            />
                            <button
                                type="button"
                                className="btn btn-link az-msg-send"
                                onClick={sendMessage}
                            >
                                {showSpinner.sending && <FaCircleNotch className="fa-spin" />}
                                {!showSpinner.sending && <FiSend />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ModalConfirm
                show={showConfirmModal}
                onHide={handleCloseSendMessageNowConfirmModal}
                {...confirmModal}
            />
            <ModalCustomizeMessage
                show={showCustomizeMessageModal}
                onHide={handleCloseModal}
                {...modalMessage}
            />
            <ModalCustomizeReview
                show={showCustomizeReviewModal}
                onHide={handleCloseModal}
                {...modalMessage}
            />
        </div>
    );
}

export default Inbox;
