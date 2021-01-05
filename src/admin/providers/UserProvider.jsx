import {isBefore} from "date-fns";
import PropTypes from "prop-types";
import React, {Component} from "react";

export const UserContext = React.createContext();

export const UserConsumer = UserContext.Consumer;

class UserProvider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {
                isFiller: true,
                accounts: [
                    {
                        isFiller: true,
                        _id: 1,
                        airbnbUserID: 1,
                        airbnbUsername: " ",
                        listings: [
                            {isFiller: true, airbnbListingID: 1, airbnbUserID: 1},
                            {isFiller: true, airbnbListingID: 2, airbnbUserID: 1},
                            {isFiller: true, airbnbListingID: 3, airbnbUserID: 1}
                        ]
                    },
                    {
                        isFiller: true,
                        _id: 2,
                        airbnbUserID: 2,
                        airbnbUsername: " ",
                        listings: [{isFiller: true, airbnbListingID: 1, airbnbUserID: 2}]
                    },
                    {
                        isFiller: true,
                        _id: 3,
                        airbnbUserID: 3,
                        airbnbUsername: " ",
                        listings: [
                            {isFiller: true, airbnbListingID: 1, airbnbUserID: 3},
                            {isFiller: true, airbnbListingID: 2, airbnbUserID: 3}
                        ]
                    }
                ],
                badAccounts: [],
                integrations: [],
                badIntegrations: [],
                listings: [],
                listingGroups: [],
                tags: [],
                locks: []
            },
            errors: {hasErrors: false}
        };
    }

    componentDidMount() {
        this.updateUser();
    }

    updateUser = async count => {
        try {
            const url = "/getUser";
            const response = await fetch(url);
            if (response.ok) {
                const user = await response.json();

                const {listingGroups} = user;
                const accounts = user.accounts.filter(account => {
                    return account.type === "Airbnb" || account.type === "HomeAway";
                });
                const badAccounts = accounts.filter(account => {
                    return account.lastLoginAttemptSuccessful === false;
                });
                const linkedAccounts = accounts.filter(account => {
                    return account.lastLoginAttemptSuccessful !== false;
                });
                const listings = accounts.reduce((result, account) => {
                    result = result.concat(account.listings);
                    return result;
                }, []);
                const integrations = user.accounts.filter(account => {
                    return account.type === "August";
                });
                const badIntegrations = integrations.filter(account => {
                    return account.lastLoginAttemptSuccessful === false;
                });
                const linkedIntegrations = integrations.filter(account => {
                    return account.lastLoginAttemptSuccessful !== false;
                });

                // Build errors
                const errors = {};
                // User
                if (
                    user.subscriptionStatus !== "active" &&
                    user.subscriptionStatus !== "trialing"
                ) {
                    errors.user_not_active = true;
                    errors.hasErrors = true;
                    const foundAccountsAddedAfterTrial = linkedAccounts.some(account => {
                        return isBefore(user.trialLengthEndDate, account.createdAt);
                    });
                    if (!foundAccountsAddedAfterTrial) {
                        errors.account_added_after_trial = true;
                        errors.hasErrors = true;
                    }
                }
                // Accounts
                if (linkedAccounts.length === 0 && badAccounts.length === 0) {
                    errors.no_accounts = true;
                    errors.hasErrors = true;
                } else {
                    // Only show these errors if accounts already exist
                    if (linkedAccounts.length === 0) {
                        errors.no_active_accounts = true;
                        errors.hasErrors = true; // Don't want to show Timeline if there are no active accounts
                    }
                    if (badAccounts.length !== 0) {
                        errors.non_active_accounts = true;
                        // errors.hasErrors = true; // Still want to show the timeline if there are bad accounts and no good accounts
                    }
                }
                // Listings
                const hasUpdatedListings = accounts.every(account => {
                    return !!account.listingsUpdatedLast;
                });
                if (!hasUpdatedListings) {
                    errors.listings_updating = true;
                    // errors.hasErrors = true;
                } else if (listings.length === 0) {
                    errors.no_listings = true;
                    errors.hasErrors = true;
                }
                const foundEnabledListings = accounts.some(account => {
                    return account.listings.some(listing => {
                        return listing.listingEnabled;
                    });
                });
                if (!foundEnabledListings) {
                    errors.no_active_listings = true;
                    errors.hasErrors = true;
                }

                // Reservation
                if (user.reservationCount === 0) {
                    errors.no_reservations = true;
                    errors.hasErrors = true;
                }
                // Timeline
                if (user.timeBasedMessageRulesCount === 0) {
                    errors.no_time_based_message_rules = true;
                    // errors.hasErrors = true; // This is more of a warning than an error, lets still show the timeline
                }
                if (user.messageRulesCount === 0) {
                    errors.no_message_rules = true;
                    errors.hasErrors = true;
                }
                this.setState({
                    user: Object.assign(
                        user,
                        {accounts: linkedAccounts},
                        {badAccounts},
                        {listings},
                        {listingGroups},
                        {integrations: linkedIntegrations},
                        {badIntegrations}
                    ),
                    errors
                });
                if (count) {
                    setTimeout(() => {
                        count -= 1;
                        this.updateUser(count);
                    }, 5000);
                }
            } else {
                console.log("response", response);
                // window.location = "/";
            }
        } catch (error) {
            console.log("error: ", error);
            throw error;
        }
    };

    render() {
        const {children} = this.props;
        const value = {...this.state, updateUser: this.updateUser};
        return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
    }
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default UserProvider;
