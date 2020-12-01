import PropTypes from "prop-types";
import React, {Component} from "react";
import TagManager from "react-gtm-module";
import {FiCalendar, FiChevronRight, FiMail, FiSettings, FiX} from "react-icons/fi";
import {Link, withRouter} from "react-router-dom";

import {UserConsumer} from "../providers/UserProvider";

import Errors from "./Errors";
import ModalListingSettings from "./ModalListingSettings";

class Listings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showListingSettingsModal: false,
            listing: {},
            errors: {}
        };
        this.handleShowListingSettingModal = this.handleShowListingSettingModal.bind(this);
        this.handleHideListingSettingModal = this.handleHideListingSettingModal.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
    }

    componentDidMount() {
        const tagManagerArgs = {
            dataLayer: {
                page: "Listings"
            }
        };
        TagManager.dataLayer(tagManagerArgs);
    }

    async onRefresh() {
        try {
            const {updateUser} = this.props;
            await updateUser();
        } catch (error) {
            console.log("error", error);
            throw error;
        }
    }

    handleShowListingSettingModal(listing) {
        this.setState({listing, showListingSettingsModal: true});
    }

    handleHideListingSettingModal() {
        this.setState({showListingSettingsModal: false});
    }

    render() {
        const {errors, showListingSettingsModal, listing} = this.state;

        const {
            user: {listingGroups, globalMessageRulesCount}
        } = this.props;

        let {
            user: {listings}
        } = this.props;
        listings = listings.filter(listing => {
            return listing.listingEnabled !== false;
        });

        return (
            <div className="az-content">
                <Errors errors={errors} onRefresh={this.onRefresh} />
                <div className="container">
                    <div className="az-content-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div>
                                <div className="az-content-breadcrumb">
                                    <span>Home</span>
                                    <FiChevronRight />
                                    <span>Listings</span>
                                </div>
                                <h2 className="az-content-title mb-0">Listings</h2>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-12 offset-lg-1 col-lg-10">
                                <div className="row mt-3 pd-y-10 bd-b bd-1">
                                    <div className="col-12 text-uppercase tx-11 font-weight-bold d-flex align-items-center">
                                        Listing Groups
                                    </div>
                                </div>

                                <div className="row pd-y-10 bd-t bd-1">
                                    <div className="col-7 d-flex align-items-center text-truncate">
                                        All Listings
                                    </div>
                                    <div className="col-5 d-flex align-items-center justify-content-end text-nowrap">
                                        {globalMessageRulesCount !== 0 && (
                                            <span className="d-none d-sm-inline ml-1">
                                                <FiMail className="mr-1" />
                                                {globalMessageRulesCount}
                                            </span>
                                        )}
                                        <Link
                                            to="/admin/messaging/all"
                                            roll="button"
                                            className="btn btn-xs btn-outline-primary ml-3"
                                        >
                                            <FiMail className="mr-1" />
                                            <span className="d-none d-sm-inline">Messages</span>
                                        </Link>
                                    </div>
                                </div>

                                {listingGroups.length !== 0 &&
                                    listingGroups.map(listingGroup => {
                                        return (
                                            <div
                                                key={`${listing.airbnbListingID}${listing.airbnbUserID}`}
                                                className="row pd-y-10 bd-t bd-1"
                                            >
                                                <div className="col-7 d-flex align-items-center text-truncate">
                                                    {listingGroup.name}
                                                </div>
                                                <div className="col-5 d-flex align-items-center justify-content-end text-nowrap">
                                                    {listingGroup.uniqueMessageRulesCount !== 0 && (
                                                        <span className="d-none d-sm-inline ml-1">
                                                            <FiMail className="mr-1" />
                                                            {listingGroup.uniqueMessageRulesCount}
                                                        </span>
                                                    )}
                                                    <div className="btn-group ml-3">
                                                        <Link
                                                            to={`/admin/messaging/${listingGroup._id}`}
                                                            roll="button"
                                                            className="btn btn-xs btn-outline-primary"
                                                        >
                                                            <FiMail className="mr-1" />
                                                            <span className="d-none d-sm-inline">
                                                                Messages
                                                            </span>
                                                        </Link>
                                                        <Link
                                                            to="/admin/settings"
                                                            roll="button"
                                                            className="btn btn-xs btn-outline-primary"
                                                        >
                                                            <FiSettings />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                <div className="row mt-3 pd-y-10 bd-b bd-1">
                                    <div className="col-12 text-uppercase tx-11 font-weight-bold d-flex align-items-center">
                                        Listings
                                    </div>
                                </div>

                                {listings.length !== 0 &&
                                    listings.map(listing => {
                                        if (listing.isFiller) {
                                            return (
                                                <div
                                                    key={`${listing.airbnbListingID}${listing.airbnbUserID}`}
                                                    className="row pd-y-10 bd-t bd-1"
                                                >
                                                    <div className="col-12 d-flex align-items-center justify-content-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-dark ml-3"
                                                            disabled
                                                        >
                                                            <FiSettings className="mr-1" />
                                                            Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div
                                                key={`${listing.airbnbListingID}${listing.airbnbUserID}`}
                                                className="row pd-y-10 bd-t bd-1"
                                            >
                                                <div className="col-7 d-flex align-items-center text-truncate">
                                                    {listing.nickname
                                                        ? listing.nickname
                                                        : listing.airbnbName}
                                                </div>
                                                <div className="col-5 d-flex align-items-center justify-content-end text-nowrap">
                                                    {listing.airbnbStatus !== "listed" && (
                                                        <span className="badge badge-info d-none d-sm-block ml-1">
                                                            <FiX className="mr-1" />
                                                            {listing.airbnbStatus === "unlisted"
                                                                ? "Unlisted"
                                                                : ""}
                                                            {listing.airbnbStatus === "in progress"
                                                                ? "In Progress"
                                                                : ""}
                                                        </span>
                                                    )}
                                                    {listing.pricingRulesCount !== 0 && (
                                                        <span className="d-none d-sm-inline ml-1">
                                                            <FiCalendar className="mr-1" />
                                                            {listing.pricingRulesCount}
                                                        </span>
                                                    )}
                                                    {listing.uniqueMessageRulesCount !== 0 && (
                                                        <span className="d-none d-sm-inline ml-1">
                                                            <FiMail className="mr-1" />
                                                            {listing.uniqueMessageRulesCount}
                                                        </span>
                                                    )}
                                                    <div className="btn-group ml-3">
                                                        <Link
                                                            to={`/admin/messaging/${listing.airbnbUserID}/${listing.airbnbListingID}`}
                                                            roll="button"
                                                            className="btn btn-xs btn-outline-primary"
                                                        >
                                                            <FiMail className="mr-1" />
                                                            <span className="d-none d-sm-inline">
                                                                Messages
                                                            </span>
                                                        </Link>
                                                        <Link
                                                            to={`/admin/pricing/${listing.airbnbUserID}/${listing.airbnbListingID}`}
                                                            roll="button"
                                                            className="btn btn-xs btn-outline-primary"
                                                        >
                                                            <FiCalendar className="mr-1" />
                                                            <span className="d-none d-sm-inline">
                                                                Pricing
                                                            </span>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-primary"
                                                            onClick={() => {
                                                                this.handleShowListingSettingModal(
                                                                    listing
                                                                );
                                                            }}
                                                        >
                                                            <FiSettings />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                {listings.length === 0 && (
                                    <div className="row pd-y-10 bd-t bd-1">
                                        <div className="col-12 text-muted">No Listings Found</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <ModalListingSettings
                    show={showListingSettingsModal}
                    onHide={this.handleHideListingSettingModal}
                    listing={listing}
                    listings={listings}
                />
            </div>
        );
    }
}

Listings.propTypes = {
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
    }).isRequired,
    updateUser: PropTypes.func.isRequired
};

const ConnectedListings = props => (
    <UserConsumer>
        {({user, updateUser}) => <Listings {...props} user={user} updateUser={updateUser} />}
    </UserConsumer>
);
export default withRouter(ConnectedListings);
