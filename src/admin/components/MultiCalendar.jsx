import classNames from "classnames";
import {isBefore, addDays, subDays, addYears} from "date-fns";
import {format, utcToZonedTime} from "date-fns-tz";
import React, {useState, useContext, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {FiSettings} from "react-icons/fi";

import {UserContext} from "../providers/UserProvider";
import airbnbIcon from "../img/airbnb-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";

import Errors from "./Errors";
// import ModalConfirm from "./ModalConfirm";
import ModalListingSettings from "./ModalListingSettings";
import MultiCalendarListing from "./MultiCalendarListing";
import ModalReservationDetails from "./ModalReservationDetails";
import {getAllPrices} from "./CalendarUtils";

//
//
//
// Dates are stored in DB as start of day in listing timezone but then converted into UTC
//
// Calendar dates are shown in the viewer's browser timezone
//
//
//

function MultiCalendar() {
    const {
        user: {listings},
        errors
    } = useContext(UserContext);
    const history = useHistory();

    const [showListingSettingsModal, setShowListingSettingsModal] = useState(false);
    const [listing, setListing] = useState({pricingEnabled: false, isFiller: true});
    const [selectedDates, setSelectedDates] = useState({});
    const [showReservationSettings, setShowReservationSettings] = useState(false);
    const [reservation, setReservation] = useState({});
    const [rawPrices, setRawPrices] = useState({});
    const [prices, setPrices] = useState({});

    useEffect(() => {
        loadPrices();
    }, []);

    const visibleListings = listings.filter(listing => {
        if (listing.linkedListingID || !listing.listingEnabled) {
            return false;
        }
        return true;
    });

    useEffect(() => {
        if (listings.length) {
            const startDayNumber = parseInt(format(subDays(new Date(), 2), "dd"), 10);
            const parsedPrices = Object.keys(rawPrices).reduce((result, listingID) => {
                let listingPrices = [];
                const listing = visibleListings.find(listing => listing._id === listingID);
                let timeZone = listing && listing.airbnbTimeZone;
                // if there isn't a listing found, fall back to current timezone
                if (!timeZone) {
                    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                }
                listingPrices = rawPrices[listingID].reduce((result, price, index) => {
                    // Convert date string into date object
                    if (typeof price.date === "string") {
                        price.date = new Date(price.date);
                        price.localDate = utcToZonedTime(price.date, timeZone);
                    }
                    // Only include 2 days before users browser date
                    // There should only be one or two dates to ignore at most so it is safe
                    // to check if index is < 2
                    if (index < 2 && startDayNumber > parseInt(format(price.localDate, "dd"), 10)) {
                        // ignore this date, it's more than 2 days past
                        return result;
                    }
                    result.push(price);
                    return result;
                }, []);
                result[listingID] = listingPrices;
                return result;
            }, {});
            setPrices(parsedPrices);
        }
    }, [listings, rawPrices]);

    async function loadPrices() {
        const prices = await getAllPrices();
        // Don't set prices if it's null or undefined
        if (prices) {
            setRawPrices(prices);
        }
    }

    async function handleShowListingSettingModal(listing) {
        await setListing(listing);
        setShowListingSettingsModal(true);
    }

    async function handleCloseModal(isChange) {
        try {
            // Needs to be === true because sometimes isChange can be an event object which we don't want
            if (isChange === true) {
                // await handleRefresh();
            }
            setShowListingSettingsModal(false);
        } catch (error) {
            console.error("error: ", error);
        }
    }

    async function handleRefresh() {
        // try {
        // } catch (error) {
        //     console.error("error", error);
        //     throw error;
        // }
    }

    function handleSelectedDates(selectedDates) {
        setSelectedDates(selectedDates);
        closeReservation();
    }

    function showSelectedReservation(reservation) {
        if (reservation.source === "Airbnb" || reservation.source === "HomeAway") {
            history.push(`/inbox/${reservation._id}`);
        } else {
            setShowReservationSettings(true);
            setReservation(reservation);
        }
    }
    function closeReservation(isSuccess) {
        setShowReservationSettings(false);
    }

    const months = [];
    const days = [];
    let monthDayCount = 0;
    const maxDate = addYears(new Date(), 1);
    let tempDate = subDays(new Date(), 2);
    while (isBefore(tempDate, maxDate)) {
        // const hasPast = days.length < 2;
        const isToday = days.length === 2;
        const dayNumber = format(tempDate, "dd");
        const boxClasses = classNames("box day", {
            lastDay: format(addDays(tempDate, 1), "dd") === "01",
            // "bg-light": hasPast,
            "tx-bold": isToday
        });
        days.push(
            <div key={format(tempDate, "yyyy-MM-dd")} className={boxClasses}>
                <div className="inner">
                    <div>{format(tempDate, "EEEEEE")}</div>
                    <div>{dayNumber}</div>
                </div>
            </div>
        );
        monthDayCount += 1;
        tempDate = addDays(tempDate, 1);
        if (format(tempDate, "dd") === "01" || !isBefore(tempDate, maxDate)) {
            months.push(
                <div
                    key={format(subDays(tempDate, 1), "yyyy-MM")}
                    className="month"
                    style={{width: `${monthDayCount * 80}px`}}
                >
                    <h5 className="mg-t-10 mg-l-20 text-truncate">
                        {format(subDays(tempDate, 1), "MMMM yyyy")}
                    </h5>
                </div>
            );
            monthDayCount = 0;
        }
    }

    return (
        <div className="az-content">
            <div className="container-fluid">
                <div className="az-content-body">
                    <Errors errors={errors} onRefresh={handleRefresh} />
                    {!errors.hasErrors && (
                        <div className="row no-gutters">
                            <div className="col-6 col-md-3 col-xl-2">
                                <div className="text-truncate multiCalendarHeader">
                                    {visibleListings.length !== 0 && (
                                        <h5 className="mg-t-10 mg-l-20 text-truncate">{`${visibleListings.length} Listing`}</h5>
                                    )}
                                </div>
                                <div className="multiCalendarHeader">
                                    <div className="inner">
                                        <div>&nbsp;</div>
                                        <div>&nbsp;</div>
                                    </div>
                                </div>
                                {visibleListings.map(listing => {
                                    const listingID = listing._id;
                                    let icon = airbnbIcon;
                                    if (listing.source === "HomeAway") {
                                        icon = homeawayIcon;
                                    }
                                    const icons = listings.reduce(
                                        (result, listing) => {
                                            if (listing.linkedListingID === listingID) {
                                                let icon = airbnbIcon;
                                                if (listing.source === "HomeAway") {
                                                    icon = homeawayIcon;
                                                }
                                                result.push(
                                                    <img
                                                        key={`icon${listingID}${listing._id}`}
                                                        alt={listing.source}
                                                        src={icon}
                                                        className="icon"
                                                    />
                                                );
                                            }
                                            return result;
                                        },
                                        [
                                            <img
                                                key={`icon${listingID}`}
                                                alt={listing.source}
                                                src={icon}
                                                className="icon"
                                            />
                                        ]
                                    );

                                    return (
                                        <div
                                            key={`MCLT${listing._id}`}
                                            className="multiCalendarTitle text-truncate pd-5 d-flex"
                                            onClick={() => {
                                                handleShowListingSettingModal(listing);
                                            }}
                                            onKeyPress={() => {
                                                handleShowListingSettingModal(listing);
                                            }}
                                            role="presentation"
                                        >
                                            <img
                                                alt=""
                                                src={listing.airbnbThumbnailUrl}
                                                className="rounded d-none d-sm-block"
                                            />
                                            <div className="text-truncate">
                                                <h6 className="mg-0 text-truncate">
                                                    {listing.nickname
                                                        ? listing.nickname
                                                        : listing.airbnbName}
                                                </h6>
                                                {icons}
                                            </div>
                                            <div className="multiCalendarSettings align-self-center ml-auto pd-5">
                                                <FiSettings />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="multiCalendar col-6 col-md-9 col-xl-10">
                                <div className="multiCalendarHeader">{months}</div>
                                <div className="multiCalendarHeader">{days}</div>
                                {visibleListings.map(listing => {
                                    return (
                                        <MultiCalendarListing
                                            key={`MCL${listing._id}`}
                                            listing={listing}
                                            onShowSelectedReservation={showSelectedReservation}
                                            onSelectedDates={handleSelectedDates}
                                            selectedListingID={selectedDates.listingID}
                                            prices={prices[listing._id]}
                                            onRefresh={loadPrices}
                                        />
                                    );
                                })}
                            </div>

                            <ModalReservationDetails
                                show={showReservationSettings}
                                onHide={closeReservation}
                                reservation={reservation}
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* <ModalConfirm
                show={showConfirmModal}
                onHide={handleCloseConfirmModal}
                {...confirmModal}
            /> */}
            <ModalListingSettings
                show={showListingSettingsModal}
                onHide={handleCloseModal}
                listing={listing}
                listings={listings}
            />
        </div>
    );
}

export default MultiCalendar;
