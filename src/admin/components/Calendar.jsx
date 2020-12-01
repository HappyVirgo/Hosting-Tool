import "../css/calendar.scss";

import classNames from "classnames";
import {
    addDays,
    addYears,
    endOfMonth,
    endOfWeek,
    isBefore,
    isSameDay,
    isSameMonth,
    isWithinInterval,
    startOfMonth,
    startOfWeek,
    eachDayOfInterval,
    isAfter
} from "date-fns";
import {format, utcToZonedTime} from "date-fns-tz";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {FiChevronLeft, FiChevronRight} from "react-icons/fi";

import defaultAvatar from "../img/default-avatar.png";
import {listingType, pricesType} from "../types";

import {AirbnbLogo, VRBOLogo} from "./CustomIcons";
import {buildCalendarArray, updateSelectedDates} from "./CalendarUtils";

function Calendar(props) {
    const {
        listing,
        onSelectedDates,
        prices,
        onSelectedReservation,
        prevMonth,
        nextMonth,
        currentDate,
        changeChannel,
        channel,
        channels
    } = props;

    const [selectedDates, setSelectedDates] = useState({});
    const [calendarArray, setCalendarArray] = useState([]);
    const [hoverDate, setHoverDate] = useState();

    const today = utcToZonedTime(new Date(), listing.airbnbTimeZone);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    useEffect(() => {
        // convert prices to calendarArray
        // it should change date from a string to a date object
        const newCalendarArray = prices.reduce((result, price) => {
            const date = new Date(price.date);
            // convert date to correct timezone
            const localDate = utcToZonedTime(price.date, listing.airbnbTimeZone);
            if (!isBefore(localDate, startDate) && !isAfter(localDate, endDate)) {
                const isSelected = false;
                const {
                    blocked,
                    occupied,
                    reservation,
                    isStart,
                    isEnd,
                    currencySymbol,
                    airbnbDate
                } = price;
                // Fill in the dates before currentDate
                if (result.length === 0 && !isSameDay(startDate, localDate)) {
                    result = eachDayOfInterval({
                        start: startDate,
                        end: date
                    }).map(date => {
                        return {
                            date,
                            localDate,
                            isSelected: false,
                            blocked: false,
                            dateHasPast: true
                        };
                    });
                } else {
                    result.push({
                        date,
                        localDate,
                        isSelected,
                        blocked,
                        occupied,
                        reservation,
                        isStart,
                        isEnd,
                        currencySymbol,
                        appliedRules: price[channel].appliedRules,
                        currentPrice: price[channel].currentPrice,
                        currentPriceFormatted: price[channel].currentPriceFormatted,
                        price: price[channel].price,
                        priceFormatted: price[channel].priceFormatted,
                        airbnbDate
                    });
                }
            }
            return result;
        }, []);
        setCalendarArray(newCalendarArray);
        setSelectedDates({});
    }, [prices, currentDate, channel]);

    useEffect(() => {
        if (calendarArray.length) {
            const newCalendarArray = buildCalendarArray(selectedDates, calendarArray);
            setCalendarArray(newCalendarArray);
        }
    }, [selectedDates]);

    function handleSelectedDates(day) {
        if (day.dateHasPast) {
            setHoverDate();
            setSelectedDates({});
            return;
        }
        const newSelectedDates = updateSelectedDates(
            calendarArray,
            listing,
            selectedDates,
            day,
            channel
        );
        setSelectedDates(newSelectedDates);
        setHoverDate();
        onSelectedDates(newSelectedDates);
    }

    function handleHoverDates(day) {
        if (day.dateHasPast) {
            return;
        }
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

    function handleSelectedReservation(reservation) {
        onSelectedReservation(reservation);
    }

    function renderHeader() {
        const dateFormat = "MMMM yyyy";
        const airbnbClassName = classNames("btn", {
            "btn-primary": channel === "Airbnb",
            "btn-outline-primary": channel === "HomeAway"
        });
        const vrboClassName = classNames("btn", {
            "btn-outline-primary": channel === "Airbnb",
            "btn-primary": channel === "HomeAway"
        });
        return (
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="btn-group">
                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        disabled={isSameMonth(today, monthStart)}
                        onClick={prevMonth}
                    >
                        <FiChevronLeft />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        disabled={isSameMonth(today, addYears(monthStart, 1))}
                        onClick={nextMonth}
                    >
                        <FiChevronRight />
                    </button>
                </div>
                <h4 className="mb-0">{format(currentDate, dateFormat)}</h4>
                {channels.length <= 1 && <div />}
                {channels.length > 1 && (
                    <div className="btn-group">
                        <button
                            type="button"
                            className={airbnbClassName}
                            onClick={() => {
                                changeChannel("Airbnb");
                            }}
                        >
                            <AirbnbLogo className="mr-1" />
                            Airbnb
                        </button>
                        <button
                            type="button"
                            className={vrboClassName}
                            onClick={() => {
                                changeChannel("HomeAway");
                            }}
                        >
                            <VRBOLogo className="mr-1" />
                            VRBO
                        </button>
                    </div>
                )}
            </div>
        );
    }

    function renderDaysHeader() {
        const dateFormat = "eeee";
        const days = [];
        const startDate = startOfWeek(currentDate);

        for (let i = 0; i < 7; i += 1) {
            days.push(
                <div className="text-center titles flex-fill" key={`DH${i}`}>
                    <h5>{format(addDays(startDate, i), dateFormat)}</h5>
                </div>
            );
        }

        return <div className="header d-none d-sm-flex">{days}</div>;
    }

    function renderCells() {
        const dateFormat = "d";
        const dateFormatMobile = "eee, MMMM do yyyy";
        const rows = [];
        const mobileRows = [];

        let reservations = [];
        let formattedDate = "";
        let formattedDateMobile = "";
        let index = -1;
        let days = [];
        while (calendarArray.length && index < 34) {
            for (let i = 0; i < 7; i += 1) {
                index += 1;
                const {
                    localDate,
                    blocked,
                    isStart,
                    isEnd,
                    reservation,
                    isSelected,
                    currencySymbol,
                    priceFormatted,
                    appliedRules,
                    currentPrice,
                    currentPriceFormatted,
                    price,
                    airbnbDate
                } = calendarArray[index];
                const dateHasPast = !isAfter(localDate, today) && !isSameDay(today, localDate);
                formattedDate = format(localDate, dateFormat);
                if (formattedDate === "1") {
                    formattedDate = `${format(localDate, "MMM")} ${formattedDate}`;
                }
                formattedDateMobile = format(localDate, dateFormatMobile);
                if (isSameDay(today, localDate)) {
                    formattedDate = "Today";
                    formattedDateMobile = "Today";
                }
                // let prevPrice = false;
                // if (day !== startDate) {
                //     prevPrice = prices.find(findSameDay(subDays(day, 1)));
                // }

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
                const dayClasses = classNames("box", {
                    "bg-light crossed disabled": !isSelected && (blocked || dateHasPast),
                    "bg-selected": highlight,
                    "bg-primary": isSelected
                });
                const listItemClasses = classNames(
                    "list-group-item d-flex justify-content-between",
                    {
                        // disabled: !isSameMonth(day, monthStart),
                        "bg-light": blocked || dateHasPast,
                        disabled: blocked || dateHasPast
                    }
                );

                days.push(
                    <div
                        className={dayClasses}
                        key={localDate}
                        onClick={() =>
                            handleSelectedDates({
                                localDate,
                                blocked,
                                dateHasPast,
                                appliedRules,
                                priceFormatted,
                                currencySymbol,
                                currentPrice,
                                currentPriceFormatted,
                                price,
                                airbnbDate
                            })
                        }
                        onKeyPress={() =>
                            handleSelectedDates({
                                localDate,
                                blocked,
                                dateHasPast,
                                appliedRules,
                                priceFormatted,
                                currencySymbol,
                                currentPrice,
                                currentPriceFormatted,
                                price,
                                airbnbDate
                            })
                        }
                        role="presentation"
                        onMouseOver={() => handleHoverDates({localDate, dateHasPast})}
                        onFocus={() => handleHoverDates({localDate, dateHasPast})}
                        onMouseLeave={() => handleHoverOutDates({localDate, dateHasPast})}
                    >
                        <div className="inner">
                            <span className="number">{formattedDate}</span>
                            <span className="bg">
                                <h5 className="mg-b-0">
                                    {!dateHasPast && !blocked && !!priceFormatted && priceFormatted}
                                    {!dateHasPast &&
                                        !blocked &&
                                        !priceFormatted &&
                                        !!currentPriceFormatted &&
                                        currentPriceFormatted}
                                </h5>
                            </span>
                            <span className="currentPrice">
                                {!dateHasPast &&
                                    !blocked &&
                                    !!currentPriceFormatted &&
                                    price !== currentPrice &&
                                    currentPriceFormatted}
                            </span>
                        </div>
                    </div>
                );
                let lastReservation = reservations[reservations.length - 1];
                if (!dateHasPast && !reservation) {
                    if (i === 0 || (reservations.length && lastReservation.available !== true)) {
                        reservations.push({
                            available: true,
                            dayCount: 0
                        });
                        lastReservation = reservations[reservations.length - 1];
                    }
                    lastReservation.dayCount += 1;
                }
                if (!dateHasPast && reservation) {
                    if (i === 0 || (reservations.length && lastReservation.available) || isStart) {
                        reservations.push({
                            available: false,
                            dayCount: 0,
                            isStart,
                            isEnd,
                            reservation
                        });
                        lastReservation = reservations[reservations.length - 1];
                    }
                    lastReservation.dayCount += 1;
                    lastReservation.isStart = lastReservation.isStart || isStart;
                    lastReservation.isEnd = lastReservation.isEnd || isEnd;
                    lastReservation.reservation = lastReservation.reservation || reservation;
                }
                if (dateHasPast) {
                    reservations.push({available: false, dayCount: 1});
                }
                if (isWithinInterval(localDate, {start: monthStart, end: monthEnd})) {
                    mobileRows.push(
                        <li
                            className={listItemClasses}
                            key={`mobile${localDate}`}
                            role="presentation"
                        >
                            <div className="">
                                <h6 className="mb-0">{formattedDateMobile}</h6>
                                {!dateHasPast &&
                                    !blocked &&
                                    !!currentPriceFormatted &&
                                    price !== currentPriceFormatted && (
                                        <div className="d-block tx-11 text-muted">
                                            {`Current Price: ${currentPriceFormatted}`}
                                        </div>
                                    )}
                                {dateHasPast && blocked && (
                                    <div className="tx-10 tx-light">Not Available</div>
                                )}
                            </div>
                            {!dateHasPast && !blocked && !!priceFormatted && (
                                <h2 className="mb-0">{priceFormatted}</h2>
                            )}
                        </li>
                    );
                }
            }
            reservations = reservations.map((reservation, index) => {
                if (reservation.reservation) {
                    const containerClass = classNames(`reservation days-${reservation.dayCount}`);
                    let start;
                    let full;
                    if (reservation.isStart) {
                        const startClass = classNames("startRounded bg-primary");
                        let firstName = reservation.reservation.airbnbFirstName;
                        if (
                            reservation.reservation.custom &&
                            reservation.reservation.custom.firstName
                        ) {
                            firstName = reservation.reservation.custom.firstName;
                        }
                        if (!firstName) {
                            firstName = reservation.reservation.source;
                        }

                        let thumbnail = reservation.reservation.airbnbThumbnailUrl;
                        if (!thumbnail) {
                            thumbnail = defaultAvatar;
                        }
                        start = [
                            <div key={`RSI${reservation.reservation._id}`} className={startClass}>
                                <img alt={firstName} src={thumbnail} />
                            </div>
                        ];
                        start.push(
                            <div
                                key={`RS${reservation.reservation._id}`}
                                className="start bg-primary pd-l-5 text-truncate"
                            >
                                {firstName}
                            </div>
                        );
                    } else if (!reservation.available) {
                        full = <div className="full bg-primary" />;
                    }
                    let end;
                    if (reservation.isEnd) {
                        end = <div className="endRounded bg-primary" />;
                    }
                    return (
                        <div
                            key={`R${reservation.reservation._id}`}
                            className={containerClass}
                            onClick={() => handleSelectedReservation(reservation.reservation)}
                            onKeyPress={() => handleSelectedReservation(reservation.reservation)}
                            role="presentation"
                        >
                            {start}
                            {full}
                            {end}
                        </div>
                    );
                }
                const className = classNames(`not-reservation days-${reservation.dayCount}`);
                const key = `NR${index}`;
                return <div key={key} className={className} />;
            });
            rows.push(
                <div className="gridRow" key={calendarArray[index].date}>
                    {days}
                    <div className="reservationRow">{reservations}</div>
                </div>
            );
            days = [];
            reservations = [];
        }
        return (
            <div>
                <div className="grid d-none d-sm-block">{rows}</div>
                <ul className="list-group d-block d-sm-none">{mobileRows}</ul>
            </div>
        );
    }

    return (
        <div className="calendar">
            {renderHeader()}
            {renderDaysHeader()}
            {renderCells()}
        </div>
    );
}

Calendar.propTypes = {
    prices: pricesType.isRequired,
    currentDate: PropTypes.instanceOf(Date).isRequired,
    nextMonth: PropTypes.func.isRequired,
    prevMonth: PropTypes.func.isRequired,
    onSelectedDates: PropTypes.func.isRequired,
    onSelectedReservation: PropTypes.func.isRequired,
    listing: listingType.isRequired,
    changeChannel: PropTypes.func.isRequired,
    channel: PropTypes.string.isRequired,
    channels: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Calendar;
