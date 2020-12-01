import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {
    isBefore,
    isSameDay,
    isWithinInterval,
    eachDayOfInterval,
    subDays,
    addYears,
    startOfDay
} from "date-fns";
import classNames from "classnames";
import {format, utcToZonedTime} from "date-fns-tz";

import airbnbIcon from "../img/airbnb-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";
import defaultAvatar from "../img/default-avatar.png";
import {listingType} from "../types";

import ModalAvailability from "./ModalAvailability";
import {
    buildCalendarArray,
    differenceInDaysToNearestDay,
    updateSelectedDates
} from "./CalendarUtils";

function MultiCalendarListing(props) {
    const {
        listing,
        onShowSelectedReservation,
        onSelectedDates,
        selectedListingID,
        prices,
        onRefresh
    } = props;

    const [selectedDates, setSelectedDates] = useState({});
    const [calendarArray, setCalendarArray] = useState([]);
    const [hoverDate, setHoverDate] = useState();
    const [showAvailability, setShowAvailability] = useState(false);

    const currentDate = startOfDay(new Date());
    const calendarStartDate = subDays(currentDate, 2);
    useEffect(() => {
        if (prices.length) {
            setCalendarArray(prices);
        } else {
            const newCalendarArray = eachDayOfInterval({
                start: calendarStartDate,
                end: addYears(currentDate, 1)
            }).map(date => {
                return {
                    date,
                    localDate: date,
                    airbnbDate: format(date, "yyyy-MM-dd"),
                    isSelected: false,
                    blocked: false,
                    isFiller: true
                };
            });
            setCalendarArray(newCalendarArray);
        }
    }, [prices]);

    useEffect(() => {
        if (prices.length) {
            const newCalendarArray = buildCalendarArray(selectedDates, prices);
            setCalendarArray(newCalendarArray);
        }
    }, [selectedDates]);

    useEffect(() => {
        if (selectedListingID !== listing._id && selectedDates.startDate) {
            if (selectedDates.endDate) {
                setCalendarArray(prices);
            }
            setSelectedDates({});
        }
    }, [selectedListingID]);

    function handleSelectedDates(day) {
        const newSelectedDates = updateSelectedDates(calendarArray, listing, selectedDates, day);
        setSelectedDates(newSelectedDates);
        setHoverDate();
        onSelectedDates(newSelectedDates);
        const {startDate, endDate} = newSelectedDates;
        if (startDate && endDate) {
            setShowAvailability(true);
        }
    }

    async function closeAvailability(success) {
        if (success === true) {
            await onRefresh();
        }
        handleSelectedDates({});
        setShowAvailability(false);
    }

    function handleHoverDates(day) {
        const {startDate, endDate} = selectedDates;
        if (startDate && !endDate) {
            const {localDate} = day;
            setHoverDate(localDate);
        }
    }

    function handleHoverOutDates(day) {
        const {startDate, endDate} = selectedDates;
        if (startDate && !endDate) {
            const {localDate} = day;
            if (isSameDay(localDate, hoverDate)) {
                setHoverDate();
            }
        }
    }
    const days = calendarArray.reduce((result, day, i) => {
        const {isSelected, blocked, localDate, airbnbDate} = day;
        if (isBefore(localDate, subDays(currentDate, 2))) {
            return result;
        }
        const {startDate} = selectedDates;
        let highlightBefore;
        let highlightAfter;
        if (hoverDate && startDate) {
            if (isBefore(startDate, hoverDate)) {
                highlightBefore = isWithinInterval(localDate, {
                    start: startDate,
                    end: hoverDate
                });
            } else {
                highlightAfter = isWithinInterval(localDate, {
                    start: hoverDate,
                    end: startDate
                });
            }
        }
        const highlight = !isSelected && (highlightBefore || highlightAfter);
        const hasPast = isBefore(localDate, currentDate);
        const isToday = isSameDay(localDate, currentDate);
        const dayClasses = classNames("box", {
            crossed: !isSelected && blocked && !hasPast,
            "bg-light": !isSelected && (blocked || hasPast),
            "bg-selected": highlight,
            "bg-primary": isSelected,
            "bg-today": isToday
        });
        if (hasPast) {
            result.push(
                <div
                    id={listing._id + airbnbDate}
                    key={listing._id + airbnbDate}
                    role="presentation"
                    className={dayClasses}
                >
                    <div className="inner" />
                </div>
            );
            return result;
        }
        result.push(
            <div
                id={listing._id + airbnbDate}
                key={listing._id + airbnbDate}
                onClick={() => handleSelectedDates({localDate, blocked})}
                onKeyPress={() => handleSelectedDates({localDate, blocked})}
                role="presentation"
                className={dayClasses}
                onMouseOver={() => handleHoverDates({localDate})}
                onFocus={() => handleHoverDates({localDate})}
                onMouseLeave={() => handleHoverOutDates({localDate})}
            >
                <div className="inner" />
            </div>
        );
        return result;
    }, []);
    let reservations = listing.reservations.filter(reservation => {
        const endDate = utcToZonedTime(reservation.endDate, listing.airbnbTimeZone);
        return reservation.status === "accepted" && !isBefore(endDate, calendarStartDate);
    });
    reservations = reservations.reduce((result, reservation, index, reservations) => {
        const endDate = utcToZonedTime(reservation.endDate, listing.airbnbTimeZone);
        const startDate = utcToZonedTime(reservation.startDate, listing.airbnbTimeZone);
        let dayCount = reservation.airbnbNights;
        if (!dayCount) {
            dayCount = differenceInDaysToNearestDay(endDate, startDate);
        }
        let isStart = true;
        // First make sure the reservation started after today
        if (isBefore(startDate, calendarStartDate) && !isSameDay(startDate, calendarStartDate)) {
            // If it did, set start=false and set dayCount
            dayCount = differenceInDaysToNearestDay(endDate, calendarStartDate);
            isStart = false;
            // If the reservation ends today, we can ignore it because there are no dates to print
            if (dayCount === 0) {
                return result;
            }
        } else if (result.length === 0) {
            // If it's not a reservation that has already started and result.length === 0
            // then it must be the first reservation to print to screen
            // Calculate the number of days before the reservation and create a buffer.
            const availableDayCount = differenceInDaysToNearestDay(startDate, calendarStartDate);
            if (availableDayCount) {
                const className = classNames(`not-reservation days-${availableDayCount}`);
                const key = `SNR${index}`;
                result.push(<div id={key} key={key} className={className} />);
            }
        }
        if (isNaN(dayCount)) {
            dayCount = differenceInDaysToNearestDay(endDate, calendarStartDate);
        }
        const containerClass = classNames(`reservation days-${dayCount}`);
        let start;
        let full;
        let firstName = reservation.airbnbFirstName;
        let lastName = reservation.airbnbLastName;

        if (reservation.custom && reservation.custom.firstName) {
            firstName = reservation.custom.firstName;
        }
        if (!firstName) {
            firstName = reservation.source;
        }

        if (reservation.custom && reservation.custom.lastName) {
            lastName = reservation.custom.lastName;
        }
        if (!lastName) {
            lastName = "";
        }
        let icon;
        if (reservation.source === "HomeAway") {
            icon = homeawayIcon;
        } else if (reservation.source === "Airbnb") {
            icon = airbnbIcon;
        }
        if (isStart) {
            let thumbnail = reservation.airbnbThumbnailUrl;
            if (!thumbnail) {
                thumbnail = defaultAvatar;
            }
            start = [
                <div key={`RSI${reservation._id}`} className="startRounded bg-primary">
                    <img alt={`${firstName} ${lastName}`} src={thumbnail} />
                </div>
            ];
            start.push(
                <div key={`RS${reservation._id}`} className="start bg-primary pd-l-5 text-truncate">
                    {icon && (
                        <img
                            alt={reservation.source}
                            src={icon}
                            className="icon buttonHeight mg-r-5 svgIconWhite"
                        />
                    )}
                    {`${firstName} ${lastName}`}
                </div>
            );
        } else {
            full = (
                <div className="full bg-primary pd-l-5 text-truncate">
                    {icon && (
                        <img
                            alt={reservation.source}
                            src={icon}
                            className="icon buttonHeight mg-r-5 svgIconWhite"
                        />
                    )}
                    {`${firstName} ${lastName}`}
                </div>
            );
        }
        const end = <div className="endRounded bg-primary" />;
        result.push(
            <div
                key={`R${reservation._id}`}
                className={containerClass}
                onClick={() => onShowSelectedReservation(reservation)}
                onKeyPress={() => onShowSelectedReservation(reservation)}
                role="presentation"
            >
                {start}
                {full}
                {end}
            </div>
        );
        if (index !== reservations.length - 1) {
            const nextStartDate = utcToZonedTime(
                reservations[index + 1].startDate,
                listing.airbnbTimeZone
            );
            const availableDayCount = differenceInDaysToNearestDay(nextStartDate, endDate);
            if (availableDayCount) {
                const className = classNames(`not-reservation days-${availableDayCount}`);
                const key = `NR${index}`;
                result.push(<div id={key} key={key} className={className} />);
            }
        }
        return result;
    }, []);
    return (
        <div className="multiCalendarRow">
            {days}
            <div className="reservationRow">{reservations}</div>

            <ModalAvailability
                show={showAvailability}
                onHide={closeAvailability}
                selectedDates={selectedDates}
                listing={listing}
            />
        </div>
    );
}

MultiCalendarListing.propTypes = {
    listing: listingType.isRequired,
    onShowSelectedReservation: PropTypes.func.isRequired,
    onSelectedDates: PropTypes.func.isRequired,
    selectedListingID: PropTypes.string,
    prices: PropTypes.arrayOf(
        PropTypes.shape({
            Airbnb: PropTypes.shape({
                price: PropTypes.number
            }),
            HomeAway: PropTypes.shape({
                price: PropTypes.number
            }),
            listingID: PropTypes.string,
            _id: PropTypes.string
        })
    ),
    onRefresh: PropTypes.func.isRequired
};

MultiCalendarListing.defaultProps = {
    selectedListingID: undefined,
    prices: []
};

export default MultiCalendarListing;
