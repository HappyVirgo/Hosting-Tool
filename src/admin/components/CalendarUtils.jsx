import {isBefore, isSameDay, isWithinInterval, isAfter, differenceInHours} from "date-fns";
import {zonedTimeToUtc} from "date-fns-tz";

export async function getAllPrices() {
    try {
        const url = "/getAllPrices";
        const response = await fetch(url);
        if (response.ok) {
            const prices = await response.json();
            return prices;
        }
        return {};
    } catch (error) {
        console.error("error: ", error);
        throw error;
    }
}

export function buildCalendarArray(selectedDates, calendarArray) {
    return calendarArray.map(day => {
        const {localDate} = day;
        let isSelected = false;
        const {startDate, endDate} = selectedDates;
        const isWithinRange =
            startDate &&
            endDate &&
            isWithinInterval(localDate, {
                start: startDate,
                end: endDate
            });
        const isStartDate =
            isWithinRange || (startDate && !endDate && isSameDay(localDate, startDate));
        if (isWithinRange || isStartDate) {
            isSelected = true;
            return {...day, ...{isSelected, localDate}};
        }
        if (day.isSelected !== isSelected) {
            return {...day, ...{isSelected, localDate}};
        }
        return {...day, ...{localDate}};
    });
}

export function updateSelectedDates(calendarArray, listing, selectedDates, day) {
    const {localDate} = day;
    let newStartDate;
    let newEndDate;
    let blocked;
    let newSelectedDates = {...selectedDates};
    const {startDate, endDate} = selectedDates;
    if (!startDate && !endDate) {
        // console.log("START");
        // if startDate and endDate aren't defined then looking for startDate
        // START
        //
        newStartDate = localDate;
        const {
            currencySymbol,
            appliedRules,
            priceFormatted,
            currentPrice,
            price,
            currentPriceFormatted
        } = day;
        newSelectedDates.appliedRules = appliedRules;
        newSelectedDates.price = price;
        newSelectedDates.priceFormatted = priceFormatted;
        newSelectedDates.currentPrice = currentPrice;
        newSelectedDates.currentPriceFormatted = currentPriceFormatted;
        newSelectedDates.currencySymbol = currencySymbol;
    } else if (startDate && !endDate) {
        // console.log("END");
        newStartDate = startDate;
        // if startDate is defined but not endDate then it's looking for an endDate
        // END
        //
        if (isBefore(localDate, startDate)) {
            // console.log("BACKWARDS");
            newStartDate = localDate;
            newEndDate = startDate;
        } else if (isAfter(localDate, startDate)) {
            // console.log("FORWARDS");
            newEndDate = localDate;
        } else {
            // console.log("ONE DATE");
            newEndDate = localDate;
        }
        const isRangeOccupied = calendarArray.some(day => {
            const isWithinRange = isWithinInterval(day.date, {
                start: newStartDate,
                end: newEndDate
            });
            if (isWithinRange) {
                return day.occupied;
            }
            return false;
        });
        const isRangeBlocked = calendarArray.reduce((result, day) => {
            if (result === "mixed") {
                return result;
            }
            const isWithinRange = isWithinInterval(day.date, {
                start: zonedTimeToUtc(newStartDate, listing.airbnbTimeZone),
                end: zonedTimeToUtc(newEndDate, listing.airbnbTimeZone)
            });
            if (isWithinRange) {
                if (result === "blocked" && !day.blocked) {
                    result = "mixed";
                } else if (result === "available" && day.blocked) {
                    result = "mixed";
                } else if (!day.blocked) {
                    result = "available";
                } else {
                    result = "blocked";
                }
                return result;
            }
            return result;
        }, "");
        if (isRangeBlocked === "blocked") {
            blocked = true;
        }
        if (isRangeBlocked === "available") {
            blocked = false;
        }
        if (isRangeOccupied) {
            newStartDate = localDate;
            newEndDate = undefined;
        }
    } else if (isSameDay(localDate, startDate)) {
        // console.log("CLEAR");
        // If both startDate and endDate are defined and startDate is same as date then clear them
        // CLEAR
        //
    } else {
        // console.log("START OVER");
        // If both startDate and endDate are defined, then reset startDate
        // START OVER
        //
        newStartDate = localDate;
    }

    newSelectedDates = {
        ...newSelectedDates,
        startDate: newStartDate,
        endDate: newEndDate,
        listingID: listing._id,
        blocked
    };
    return newSelectedDates;
}

export function differenceInDaysToNearestDay(date1, date2) {
    return Math.round(differenceInHours(date1, date2) / 24);
}

export function roundToNearestDate(date) {
    date.setHours(Math.round((date.getHours() + Math.round(date.getMinutes() / 60)) / 24) * 24);
    date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
    return date;
}
