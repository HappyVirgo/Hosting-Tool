import PropTypes from "prop-types";

const {shape, instanceOf, string, oneOfType, arrayOf} = PropTypes;

export const messageType = shape({
    sentDate: string,
    sendDate: oneOfType([string, instanceOf(Date)]),
    airbnbConfirmationCode: string
});
export const reservationType = shape({
    _id: string,
    source: string,
    airbnbFirstName: string,
    airbnbLastName: string,
    airbnbPhone: string,
    airbnbPreferredLocale: string,
    custom: shape({})
});
export const pricingRuleType = shape({
    _id: PropTypes.string,
    accountID: PropTypes.string,
    listingID: PropTypes.string,
    title: PropTypes.string,
    order: PropTypes.number,
    scale: PropTypes.string, // fixedPrice, minPrice, maxPrice, increaseByPrice, decreaseByPrice, increaseByPercentage, decreaseByPercentage, graduallyIncreaseByPrice, graduallyDecreaseByPrice, graduallyIncreaseByPercentage, graduallyDecreaseByPercentage
    amount: PropTypes.number,
    limitDays: PropTypes.shape({
        sunday: PropTypes.bool,
        monday: PropTypes.bool,
        tuesday: PropTypes.bool,
        wednesday: PropTypes.bool,
        thursday: PropTypes.bool,
        friday: PropTypes.bool,
        saturday: PropTypes.bool
    }),
    event: PropTypes.string, // floatingPeriod, orphanPeriod, specificDates
    floatingPeriodStartDay: PropTypes.number,
    floatingPeriodLength: PropTypes.number,
    orphanPeriodLength: PropTypes.number,
    specificDatesStartDate: PropTypes.string,
    specificDatesEndDate: PropTypes.string,
    paused: PropTypes.bool,
    channel: PropTypes.string
});
export const pricingRulesType = PropTypes.arrayOf(pricingRuleType);
//
// Price Types
//

const appliedRulesType = PropTypes.arrayOf(PropTypes.shape({}));

export const priceType = PropTypes.shape({
    occupied: PropTypes.bool,
    currencySymbol: PropTypes.string,
    Airbnb: PropTypes.shape({
        price: PropTypes.number,
        priceFormatted: PropTypes.string,
        minNights: PropTypes.number,
        appliedRules: appliedRulesType
    }),
    HomeAway: PropTypes.shape({
        price: PropTypes.number,
        priceFormatted: PropTypes.string,
        minNights: PropTypes.number,
        appliedRules: appliedRulesType
    })
});
export const pricesType = PropTypes.arrayOf(priceType);

export const selectedDatesType = PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    blocked: PropTypes.bool,
    listingID: PropTypes.string,
    appliedRules: appliedRulesType
});

export const listingType = shape({
    _id: string,
    currencySymbol: string,
    reservations: PropTypes.arrayOf(reservationType),
    airbnbListingID: PropTypes.string,
    airbnbUserID: PropTypes.string,
    nickname: PropTypes.string,
    airbnbName: PropTypes.string,
    minPrice: PropTypes.number,
    pricingEnabled: PropTypes.bool,
    listingEnabled: PropTypes.bool,
    calendars: PropTypes.arrayOf(PropTypes.shape({iCalURL: PropTypes.string})),
    isCoHost: PropTypes.bool
});

export const listingGroupType = shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    uniqueMessageRulesCount: PropTypes.number
});

export const accountType = shape({});

export const userType = shape({
    username: string,
    firstName: string,
    lastName: string,
    accounts: arrayOf(accountType),
    badAccounts: arrayOf(accountType),
    listings: arrayOf(listingType),
    listingGroups: arrayOf(listingGroupType),
    tags: arrayOf(shape({})),
    globalMessageRulesCount: PropTypes.number,
    isFiller: PropTypes.bool,
    isBeta: PropTypes.bool,
    subscriptionStatus: PropTypes.string,
    _id: PropTypes.string
});
