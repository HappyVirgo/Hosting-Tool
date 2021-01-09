import {FiCreditCard, FiPlus, FiRefreshCcw, FiSettings} from "react-icons/fi";
import {Link, withRouter} from "react-router-dom";
import React, {useState, useEffect} from "react";
import {FaCircleNotch} from "react-icons/fa";
import PropTypes from "prop-types";

import ModalAddAccount from "./ModalAddAccount";

// Errors:
//  user
//      user_not_active
//  account
//      account_added_after_trial
//      no_accounts
//      no_active_accounts
//      non_active_accounts
//
//  listing
//      no_listings
//      no_active_listings
//      listings_updating
//      listing_unlisted
//      listing_prices_not_downloaded
//
//  reservation
//      no_reservations
//
//  timeline
//      no_time_based_message_rules
//
//  messageRule
//      no_message_rules
//      no_listing_message_rules
//
//  pricingRules
//      no_listing_minimum_price
//      listing_pricing_paused
//      listing_pricing_enabled_no_enabled_rules
//      no_listing_pricing_rules
//      no_listing_enabled_pricing_rules
//
//  billing
//      credit_card ?

function Errors(props) {
    const {errors, onRefresh, showAddMessageRule, showAddPricingRule, showListingSettings} = props;
    // const [errors, setErrors] = useState({});
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showSpinner, setShowSpinner] = useState({});
    const [timer, setTimer] = useState();
    const [timerCount, setTimerCount] = useState(0);

    useEffect(() => {
        if (errors.listings_updating) {
            startTimer();
        }
        if (!errors.listings_updating) {
            stopTimer();
        }
    }, [errors]);

    // function handleShowAddAccount(message) {
    //     this.setState({showAddAccountModal: true, showSpinner: {}});
    // }

    async function handleCloseModal() {
        // try {
        // await this.getMessages();
        setShowAddAccountModal(false);
        // } catch (error) {}
    }

    function startTimer() {
        setTimerCount(0);
        setTimer(setInterval(processTimer, 1000 * 3));
    }

    function stopTimer() {
        clearInterval(timer);
    }

    async function processTimer() {
        setTimerCount(timerCount + 1);
        if (timerCount < 10) {
            await onRefresh();
        } else {
            stopTimer();
        }
    }

    if (!errors) {
        return false;
    }
    return (
        <div className="row">
            <div className="col-sm-12 offset-md-3 col-md-6">
                {errors.user_not_active && (
                    <div className="card mg-t-20 mg-b-20">
                        <div className="card-body">
                            <h5>Subscribe Today!</h5>
                            <p className="card-text">
                                Your account is no longer active which means that all Host Tools
                                automations have stopped for your listings. Please visit the&nbsp;
                                <Link to="/billing">billing page</Link>
                                &nbsp;and add your credit card to subscribe and re-activate your
                                account.
                            </p>
                        </div>
                        <div className="card-footer bd-t tx-right">
                            <Link to="/billing" roll="button" className="btn btn-outline-primary">
                                <FiCreditCard className="mr-1" />
                                Go To Billing
                            </Link>
                        </div>
                    </div>
                )}
                {errors.user_not_active && errors.account_added_after_trial && (
                    <div className="card mg-t-20 mg-b-20">
                        <div className="card-body alert-danger">
                            <h5>Your data will download as soon as you have subscribed.</h5>
                            <p className="card-text">
                                You added an account after your trial has finished. Please subscribe
                                and Host Tools will immediately download your your data.
                            </p>
                        </div>
                    </div>
                )}
                {/* {!errors.user_not_active && errors.no_accounts && (
                    <div className="card mg-t-20 mg-b-20">
                        <div className="card-body">
                            <h5>Get started</h5>
                            <p className="card-text">
                                Welcome to Host Tools, to get started let&apos;s link your
                                account. Click the &quot;Add Account&quot; button below
                                and follow the prompts.
                            </p>
                        </div>
                        <div className="card-footer bd-t tx-right">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={this.handleShowAddAccount}
                            >
                                <FiPlus className="mr-1" />
                                Add Account
                            </button>
                        </div>
                    </div>
                )} */}
                {!errors.user_not_active &&
                    (errors.no_active_accounts || errors.non_active_accounts) && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body alert-danger">
                                <h5>Your account needs to be linked</h5>
                                <p className="card-text">
                                    Your account need to be authenticated. Please browse to
                                    the&nbsp;
                                    <Link to="/settings">settings page</Link>
                                    &nbsp;and link your account by re-entering your credentials.
                                </p>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <Link
                                    to="/settings"
                                    roll="button"
                                    className="btn btn-outline-primary"
                                >
                                    <FiSettings className="mr-1" />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    )}
                {!errors.user_not_active &&
                    !errors.non_active_accounts &&
                    errors.listings_updating && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body alert-info">
                                <h5>Downloading Data...</h5>
                                <p className="card-text">
                                    Host Tools is in the process of downloading your account&apos;s
                                    data. This typically takes just a few seconds but can take a few
                                    minutes for larger accounts. This page will automatically
                                    refresh when the new data is available.
                                </p>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={async () => {
                                        try {
                                            setShowSpinner({
                                                ...showSpinner,
                                                ...{listings_updating: true}
                                            });
                                            await onRefresh();
                                            setShowSpinner({
                                                ...showSpinner,
                                                ...{listings_updating: false}
                                            });
                                        } catch (error) {
                                            console.log("error", error);
                                        }
                                    }}
                                >
                                    {!showSpinner.no_listings && <FiRefreshCcw className="mr-1" />}
                                    {showSpinner.no_listings && (
                                        <FaCircleNotch className="fa-spin mr-1" />
                                    )}
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                {!errors.user_not_active &&
                    !errors.no_accounts &&
                    !errors.no_active_accounts &&
                    errors.no_listings && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body alert-warning">
                                <h5>No listings found</h5>
                                <p className="card-text">
                                    Host Tools didn&apos;t find any listings associated with your
                                    account. If you&apos;re account was recently added it can take a
                                    few minutes for Host Tools to download your listings. Just wait
                                    a few minutes and then hit the refresh button.
                                </p>
                                <p className="card-text mg-t-10">
                                    If you recently added a new listing, go to the&nbsp;
                                    <Link to="/settings">settings page</Link>
                                    &nbsp;on Host Tools and click the &quot;Refresh&quot; button
                                    next to your account to download your latest listings.
                                </p>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={async () => {
                                        try {
                                            setShowSpinner({
                                                ...showSpinner,
                                                ...{no_listings: true}
                                            });
                                            await onRefresh();
                                            setShowSpinner({
                                                ...showSpinner,
                                                ...{no_listings: false}
                                            });
                                        } catch (error) {
                                            console.log("error", error);
                                        }
                                    }}
                                >
                                    {!showSpinner.no_listings && <FiRefreshCcw className="mr-1" />}
                                    {showSpinner.no_listings && (
                                        <FaCircleNotch className="fa-spin mr-1" />
                                    )}
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                {!errors.user_not_active &&
                    errors.no_active_listings &&
                    !errors.no_active_accounts &&
                    !errors.listings_updating && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body alert-warning">
                                <h5>All your listings are disabled</h5>
                                <p className="card-text">
                                    All your listings have been disabled. This means you&apos;ve
                                    effectively paused Host Tools. Please visit the&nbsp;
                                    <Link to="/settings">settings page</Link>
                                    &nbsp;and re-enable your listings.
                                </p>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <Link
                                    to="/settings"
                                    roll="button"
                                    className="btn btn-outline-primary"
                                >
                                    <FiSettings className="mr-1" />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    )}
                {!errors.user_not_active && errors.listing_unlisted && (
                    <div className="card mg-t-20 mg-b-20">
                        <div className="card-body alert-warning">
                            <h5>This listing is not listed.</h5>
                            <p className="card-text">
                                This feature is only available to listing that are currently active
                                and listed. Please re-list your listing, visit the&nbsp;
                                <Link to="/settings">settings page</Link>
                                &nbsp;and click the &quot;Refresh&quot; button next to your account
                                to download the latest listing data.
                            </p>
                        </div>
                        <div className="card-footer bd-t tx-right">
                            <Link to="/settings" roll="button" className="btn btn-outline-primary">
                                <FiSettings className="mr-1" />
                                Settings
                            </Link>
                        </div>
                    </div>
                )}
                {!errors.user_not_active && errors.listing_prices_not_downloaded && (
                    <div className="card mg-t-20 mg-b-20">
                        <div className="card-body alert-warning">
                            <h5>This listings pricing data hasn&apos;t been downloaded yet</h5>
                            <p className="card-text">
                                Host Tools is working on downloading your pricing data but it can
                                take a few minutes. Please refresh the page in a few minutes.
                            </p>
                        </div>
                        <div className="card-footer bd-t tx-right">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={async () => {
                                    try {
                                        setShowSpinner({
                                            ...showSpinner,
                                            ...{listing_prices_not_downloaded: true}
                                        });
                                        await onRefresh();
                                        setShowSpinner({
                                            ...showSpinner,
                                            ...{listing_prices_not_downloaded: false}
                                        });
                                    } catch (error) {
                                        console.log("error", error);
                                    }
                                }}
                            >
                                {!showSpinner.listing_prices_not_downloaded && (
                                    <FiRefreshCcw className="mr-1" />
                                )}
                                {showSpinner.listing_prices_not_downloaded && (
                                    <FaCircleNotch className="fa-spin mr-1" />
                                )}
                                Refresh
                            </button>
                        </div>
                    </div>
                )}
                {!errors.user_not_active &&
                    !errors.no_active_accounts &&
                    !errors.no_accounts &&
                    errors.no_message_rules &&
                    !errors.listings_updating && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body">
                                <h5>Just one more step</h5>
                                <p className="card-text">
                                    You&apos;ve added your account, now add a message rule.
                                    Automated messages, emails, SMS or reviews are sent when a
                                    message rule&apos;s parameters are met.
                                </p>
                                <p className="card-text">
                                    To create a message rule, click on Messaging at the menu at the
                                    top of the page.
                                </p>
                                <Link to="/FAQ#messageRules">More about message rules</Link>
                            </div>
                        </div>
                    )}
                {/* {!errors.user_not_active &&
                    !errors.no_accounts &&
                    !errors.no_message_rules &&
                    errors.no_time_based_message_rules && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body">
                                <h5>Add a scheduled message rule</h5>
                                <p className="card-text">
                                    Only scheduled message rules will show up in the timeline and
                                    you haven&apos;t created any scheduled message rules yet.
                                    Scheduled message rules are messages rules that are sent based
                                    on the check-in or check-out of a reservation. Message rules
                                    that send on an event like a new booking or inquiry don&apos;t
                                    show up in the timeline until they are sent.
                                </p>
                                <p className="card-text">
                                    To create a message rule, click on Messaging at the menu at the
                                    top of the page.
                                </p>
                                <Link to="/FAQ#messageRules">More about message rules</Link>
                            </div>
                        </div>
                    )} */}
                {!errors.user_not_active && errors.no_listing_message_rules && (
                    <div className="card mg-t-20 mg-b-20">
                        <div className="card-body">
                            <h5>Add a message rule</h5>
                            <p className="card-text">
                                Automated messages, emails, SMS or reviews are sent when a message
                                rule&apos;s parameters are met. The quickest way to create a message
                                rule is to click the &quot;Add Rule&quot; button, select from one of
                                the templates, and then customize it as needed. Once you save your
                                message rule, it&apos;s active.
                            </p>
                            <Link to="/FAQ#messageRules">More about message rules</Link>
                        </div>
                        <div className="card-footer bd-t tx-right">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={showAddMessageRule}
                            >
                                <FiPlus className="mr-1" />
                                Add Rule
                            </button>
                        </div>
                    </div>
                )}
                {!errors.user_not_active &&
                    !errors.no_accounts &&
                    !errors.no_listings &&
                    !errors.no_time_based_message_rules &&
                    errors.no_reservations && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body">
                                <h5>No Reservations</h5>
                                <p className="card-text">
                                    Host Tools is still downloading your reservations, this can
                                    sometimes take a few minutes. If recently linked your account
                                    just wait a few minutes and click the Refresh button below.
                                </p>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={async () => {
                                        try {
                                            setShowSpinner({
                                                ...showSpinner,
                                                ...{no_reservations: true}
                                            });
                                            await onRefresh();
                                            setShowSpinner({
                                                ...showSpinner,
                                                ...{no_reservations: false}
                                            });
                                        } catch (error) {
                                            console.log("error", error);
                                        }
                                    }}
                                >
                                    {!showSpinner.no_reservations && (
                                        <FiRefreshCcw className="mr-1" />
                                    )}
                                    {showSpinner.no_reservations && (
                                        <FaCircleNotch className="fa-spin mr-1" />
                                    )}
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                {!errors.user_not_active &&
                    errors.no_listing_minimum_price &&
                    !errors.no_listing_pricing_rules &&
                    !errors.listing_unlisted && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body alert-warning">
                                <h5>No minimum price set</h5>
                                <p className="card-text">
                                    There is no minimum price set for this listing, the pricing tool
                                    will not work without a minimum price set. You can set the
                                    minimum price in the listing settings.
                                </p>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={showListingSettings}
                                >
                                    <FiSettings className="mr-1" />
                                    Listing Settings
                                </button>
                            </div>
                        </div>
                    )}

                {!errors.user_not_active &&
                    errors.listing_pricing_enabled_no_enabled_rules &&
                    !errors.listing_unlisted && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body alert-warning">
                                <h5 className="card-title tx-dark tx-medium mg-b-10">
                                    Pricing tool is enabled but there are no pricing rules
                                </h5>
                                <p className="card-text">
                                    The pricing tool is currently enabled but there are no pricing
                                    rules. That means that every time Host Tools syncs your prices
                                    it will overwrite the current with the Prices shown on Host
                                    Tools. If you don&apos;t want that, please add a pricing rule or
                                    pause the pricing tool.
                                </p>
                                <Link to="/FAQ#pricingRules">More about pricing rules</Link>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={showAddPricingRule}
                                >
                                    <FiPlus className="mr-1" />
                                    Add Rule
                                </button>
                            </div>
                        </div>
                    )}

                {/* {!errors.user_not_active &&
                    !errors.listing_pricing_enabled_no_enabled_rules &&
                    errors.no_listing_pricing_rules &&
                    !errors.listing_unlisted && (
                        <div className="card mg-t-20 mg-b-20">
                            <div className="card-body">
                                <h5 className="card-title tx-dark tx-medium mg-b-10">
                                    Add a pricing rule
                                </h5>
                                <p className="card-text">
                                    Start build a pricing strategy by creating a series of pricing
                                    rules that define your listing&apos;s prices. Click the
                                    &quot;Add Rule&quot; button to create the first pricing rule.
                                </p>
                                <Link to="/FAQ#pricingRules">More about pricing rules</Link>
                            </div>
                            <div className="card-footer bd-t tx-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={showAddPricingRule}
                                >
                                    <FiPlus className="mr-1" />
                                    Add Rule
                                </button>
                            </div>
                        </div>
                    )} */}
            </div>
            <ModalAddAccount
                show={errors.no_accounts || showAddAccountModal}
                onHide={handleCloseModal}
                hideCloseButtons={errors.no_accounts}
            />
        </div>
    );
}

Errors.propTypes = {
    errors: PropTypes.shape({
        listings_updating: PropTypes.bool,
        no_accounts: PropTypes.bool,
        user_not_active: PropTypes.bool,
        listing_pricing_enabled_no_enabled_rules: PropTypes.bool,
        no_active_accounts: PropTypes.bool,
        no_listing_pricing_rules: PropTypes.bool,
        listing_unlisted: PropTypes.bool,
        no_listings: PropTypes.bool,
        no_listing_minimum_price: PropTypes.bool,
        no_reservations: PropTypes.bool,
        no_time_based_message_rules: PropTypes.bool,
        no_message_rules: PropTypes.bool,
        non_active_accounts: PropTypes.bool,
        no_active_listings: PropTypes.bool,
        listing_prices_not_downloaded: PropTypes.bool,
        account_added_after_trial: PropTypes.bool,
        no_listing_message_rules: PropTypes.bool
    }),
    onRefresh: PropTypes.func,
    showAddMessageRule: PropTypes.func,
    showAddPricingRule: PropTypes.func,
    showListingSettings: PropTypes.func
};

Errors.defaultProps = {
    errors: {},
    onRefresh: async () => {},
    showAddMessageRule: () => {},
    showAddPricingRule: () => {},
    showListingSettings: () => {}
};

export default withRouter(Errors);
