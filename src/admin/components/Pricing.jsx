import classNames from "classnames";
import {addMonths, differenceInMonths, isAfter, isSameMonth, subMonths} from "date-fns";
import {utcToZonedTime} from "date-fns-tz";
import React, {useState, useEffect, useContext} from "react";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {
    FiChevronRight,
    FiClock,
    FiPause,
    FiPlay,
    FiPlus,
    FiRefreshCcw,
    FiSettings
} from "react-icons/fi";
import {useParams, useHistory} from "react-router-dom";

import {UserContext} from "../providers/UserProvider";

import Calendar from "./Calendar";
import ChartPrices from "./ChartPrices";
import Errors from "./Errors";
import ModalConfirm from "./ModalConfirm";
import ModalEditPricingRule from "./ModalEditPricingRule";
import ModalListingSettings from "./ModalListingSettings";
import SideBarPriceDetails from "./SideBarPriceDetails";
import ModalReservationDetails from "./ModalReservationDetails";
import SortablePricingRules from "./SortablePricingRules";

function Pricing(props) {
    const {
        user: {listings}
    } = useContext(UserContext);

    const history = useHistory();
    const {airbnbUserID, airbnbListingID} = useParams();

    const fillerPricingRules = [
        {
            isFiller: true,
            _id: "1",
            event: "",
            day: 1,
            time: 1,
            title: " ",
            message: "\n\n\n\n\n\n\n\n\n",
            paused: true
        },
        {
            isFiller: true,
            _id: "2",
            event: "  ",
            day: 2,
            time: 1,
            title: " ",
            message: "\n\n\n\n\n\n\n\n",
            paused: true
        },
        {
            isFiller: true,
            _id: "3",
            event: "   ",
            day: 3,
            time: 1,
            title: " ",
            message: "\n\n\n\n\n",
            paused: true
        },
        {
            isFiller: true,
            _id: "4",
            event: "    ",
            day: 1,
            time: 1,
            title: " ",
            message: "\n\n\n\n\n\n",
            paused: true
        }
    ];

    const [showEditPricingModal, setShowEditPricingModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showListingSettingsModal, setShowListingSettingsModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({});
    const [prices, setPrices] = useState([]);
    const [showSpinner, setShowSpinner] = useState({syncPricing: false});
    const [listing, setListing] = useState({
        pricingEnabled: false,
        isFiller: true,
        source: "Airbnb"
    });
    // const [fillerPricingRules, setFillerPricingRules] = useState(fillerPricingRules)
    const [pricingRules, setPricingRules] = useState(fillerPricingRules);
    const [pricingRule, setPricingRule] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [errors, setErrors] = useState({});
    const [selectedDates, setSelectedDates] = useState({});
    const [showDateSettings, setShowDateSettings] = useState(false);
    const [showReservationSettings, setShowReservationSettings] = useState(false);
    const [reservation, setReservation] = useState({});
    const [channel, setChannel] = useState("Airbnb");
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        try {
            if (!airbnbUserID || !airbnbListingID) {
                window.location = "/";
            }
            getPrices();
            getPricingRules();
            getListing();
            const tagManagerArgs = {
                dataLayer: {
                    page: "Pricing"
                }
            };
            TagManager.dataLayer(tagManagerArgs);
        } catch (error) {
            console.error("error", error);
        }
    }, []);

    useEffect(() => {
        setPricingRules(fillerPricingRules);
        getPrices();
        getPricingRules();
        getListing();
        closeReservation();
    }, [airbnbListingID]);

    useEffect(() => {
        if (listing.linkedListingID) {
            const linkedToListing = listings.find(list => listing.linkedListingID === list._id);
            const channels = [listing.source, linkedToListing.source];
            setChannels(channels);
        } else {
            const linkedToListing = listings.find(list => listing._id === list.linkedListingID);
            if (linkedToListing) {
                const channels = [listing.source, linkedToListing.source];
                setChannels(channels);
            } else {
                const channels = [listing.source];
                setChannels(channels);
            }
        }
    }, [listing, listings]);

    useEffect(() => {
        buildErrors();
    }, [listing, pricingRules]);

    async function getPricingRules() {
        try {
            const url = `/getPricingRules/${airbnbUserID}/${airbnbListingID}`;
            const response = await fetch(url);
            if (response.ok) {
                const pricingRules = await response.json();
                await setPricingRules(pricingRules);
            } else {
                console.error("response", response);
            }
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    async function getPrices() {
        try {
            const url = `/getPrices/${airbnbUserID}/${airbnbListingID}/lastYear`;
            const response = await fetch(url);
            if (response.ok) {
                const prices = await response.json();
                setPrices(prices);
            } else {
                console.error("response", response);
            }
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    async function getListing() {
        try {
            const url = `/getListing/${airbnbUserID}/${airbnbListingID}`;
            const response = await fetch(url);
            if (response.ok) {
                const listing = await response.json();
                const newCurrentDate = utcToZonedTime(new Date(), listing.airbnbTimeZone);
                setListing(listing);
                setCurrentDate(newCurrentDate);
            } else {
                console.error("response", response);
            }
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    function buildErrors() {
        const errors = {};
        const pricingRuleCount = pricingRules.length;
        const pricingRuleIsFiller = pricingRuleCount && pricingRules[0].isFiller;
        if (!pricingRuleIsFiller) {
            const pricingRulesEnabledCount = pricingRules.filter(pricingRule => {
                return pricingRule.paused === false;
            }).length;
            errors.no_listing_pricing_rules = pricingRuleCount === 0;
            errors.no_listing_enabled_pricing_rules = pricingRulesEnabledCount === 0;
            errors.listing_pricing_enabled_no_enabled_rules =
                pricingRulesEnabledCount === 0 && listing.pricingEnabled;
        }
        if (!listing.isFiller) {
            errors.no_listing_minimum_price = !listing.minPrice;
            errors.listing_pricing_paused = !listing.pricingEnabled;
            errors.listing_unlisted =
                listing.airbnbStatus &&
                listing.airbnbStatus !== "listed" &&
                listing.airbnbListingState !== "active";
            errors.listing_prices_not_downloaded = !listing.pricesDownloadedLast;
        }
        setErrors(errors);
    }

    function nextMonth() {
        const newCurrentDate = addMonths(currentDate, 1);
        if (differenceInMonths(newCurrentDate, new Date()) < 12) {
            setCurrentDate(newCurrentDate);
        }
    }

    function prevMonth() {
        const newCurrentDate = subMonths(currentDate, 1);
        if (isAfter(newCurrentDate, new Date()) || isSameMonth(newCurrentDate, new Date())) {
            setCurrentDate(newCurrentDate);
        }
    }

    function changeChannel(channel) {
        setChannel(channel);
    }

    async function handleRefresh() {
        try {
            await getPrices();
            await getPricingRules();
            await getListing();
        } catch (error) {
            console.error("error", error);
            throw error;
        }
    }

    async function handleRefreshPrices() {
        try {
            await getPrices();
            await getPricingRules();
        } catch (error) {
            console.error("error", error);
            throw error;
        }
    }

    function handleShowConfirmModal(confirmModal) {
        setShowConfirmModal(true);
        setConfirmModal(confirmModal);
    }

    function handleShowEditPricingRule(pricingRule = {}) {
        setShowEditPricingModal(true);
        setPricingRule(pricingRule);
    }

    function handleShowListingSettingModal() {
        setShowListingSettingsModal(true);
    }

    async function handleCloseModal(isChange) {
        try {
            // Needs to be === true because sometimes isChange can be an event object which we don't want
            if (isChange === true) {
                await handleRefresh();
            }
            setShowEditPricingModal(false);
            setShowListingSettingsModal(false);
        } catch (error) {
            console.error("error: ", error);
        }
    }

    async function handleCloseConfirmModal(isDelete) {
        try {
            if (isDelete) {
                const pricingRule = confirmModal.data;
                const {_id} = pricingRule;
                const url = "/deletePricingRule";
                const fields = {
                    _id
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
                    await handleRefreshPrices();
                } else {
                    console.error("response", response);
                    window.location = "/";
                }
            }
            setShowConfirmModal(false);
        } catch (error) {
            console.error("error", error);
        }
    }

    function handleShowConfirmDeletePricingRule(pricingRule) {
        handleShowConfirmModal({
            title: "Delete Pricing Rule?",
            message: "Are you sure you would like to delete this pricing rule?",
            buttonText: "Delete",
            data: pricingRule,
            type: "danger"
        });
    }

    async function handleTogglePricing() {
        try {
            setShowSpinner(showSpinner => {
                return {...showSpinner, ...{togglePricing: true}};
            });
            const fields = {
                pricingEnabled: !listing.pricingEnabled,
                airbnbUserID,
                airbnbListingID
            };
            const url = "/enablePricing";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                await getListing();
                setShowSpinner(showSpinner => {
                    return {...showSpinner, ...{togglePricing: false}};
                });
            } else {
                console.error("response", response);
                // window.location = "/";
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    async function handleSyncPrices() {
        try {
            setShowSpinner(showSpinner => {
                return {...showSpinner, ...{syncPricing: true}};
            });

            const fields = {
                airbnbUserID,
                airbnbListingID
            };
            const url = "/forceUpdatePricing";
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
                    getPrices();
                    setShowSpinner(showSpinner => {
                        return {...showSpinner, ...{syncPricing: false}};
                    });
                }, 5000);
                setTimeout(() => {
                    getPrices();
                }, 10000);
                setTimeout(() => {
                    getPrices();
                }, 15000);
                setTimeout(() => {
                    getPrices();
                }, 20000);
                setTimeout(() => {
                    getPrices();
                }, 25000);
                setTimeout(() => {
                    getPrices();
                }, 30000);
            } else if (response.status === 400) {
                const data = await response.json();

                setErrors(errors => {
                    return {...errors, ...{syncPrices: data.error}};
                });
                setShowSpinner(showSpinner => {
                    return {...showSpinner, ...{syncPricing: false}};
                });
                setTimeout(() => {
                    setErrors(errors => {
                        return {...errors, ...{syncPrices: undefined}};
                    });
                }, 5000);
            } else {
                setShowSpinner(showSpinner => {
                    return {...showSpinner, ...{syncPricing: false}};
                });
                console.error("response", response);
                // window.location = "/";
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    async function handleTogglePricingRule(pricingRule) {
        try {
            const {_id, paused} = pricingRule;
            const url = "/pausePricingRule";
            const fields = {
                _id,
                paused: !paused
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
                await handleRefreshPrices();
            } else {
                console.error("response", response);
                // window.location = "/";
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    function handleSelectedDates(selectedDates) {
        let showDateSettings = true;
        if (!selectedDates.endDate) {
            showDateSettings = false;
        }
        closeReservation();
        setShowDateSettings(showDateSettings);
        setSelectedDates(selectedDates);
    }

    async function closeSelectedDates(isSuccess) {
        if (isSuccess === true) {
            await getPrices();
        }
        handleSelectedDates({});
    }

    function showSelectedReservation(reservation) {
        closeSelectedDates();
        if (reservation.source === "Airbnb" || reservation.source === "HomeAway") {
            history.push(`/inbox/${reservation._id}`);
        } else {
            const showReservationSettings = true;
            setShowReservationSettings(showReservationSettings);
            setReservation(reservation);
        }
    }

    function closeReservation(isSuccess) {
        const showReservationSettings = false;
        setShowReservationSettings(showReservationSettings);
        if (isSuccess) {
            getPrices();
        }
    }

    const addPriceRuleButton = (
        <div className="d-flex justify-content-end mb-2 calendarPadding mt-3 mt-lg-0">
            <button
                type="button"
                className="btn btn-outline-primary text-nowrap"
                onClick={() => {
                    handleShowEditPricingRule();
                }}
            >
                <FiPlus className="mr-1" />
                Add Rule
            </button>
        </div>
    );

    const syncPricesButtonClasses = classNames("btn", {
        "btn-outline-primary": !errors.syncPrices,
        "btn-outline-danger": errors.syncPrices
    });

    return (
        <div className="az-content">
            <div className="container">
                <div className="az-content-body">
                    <div className="d-flex justify-content-between mb-3 flex-column flex-md-row">
                        <div className="mb-3 mb-md-0">
                            <div className="az-content-breadcrumb">
                                <span>Home</span>
                                <FiChevronRight />
                                <span>Pricing</span>
                            </div>
                            <h2 className="az-content-title mb-0">
                                {listing.nickname ? listing.nickname : listing.airbnbName}
                            </h2>
                        </div>
                        <div className="d-flex align-items-center justify-content-end">
                            {errors.syncPrices && (
                                <div className="mr-3 d-flex align-items-center text-danger">
                                    <div className="d-none d-sm-flex">
                                        <FiClock className="mr-1" />
                                    </div>
                                    {errors.syncPrices}
                                </div>
                            )}
                            {!errors.syncPrices && (
                                <div className="mr-3 d-flex align-items-center text-nowrap">
                                    {(!!listing.hoursSincePricesUpdatedLast ||
                                        listing.hoursSincePricesUpdatedLast === 0) && (
                                        <div className="d-none d-sm-flex">
                                            <FiClock className="mr-1" />
                                        </div>
                                    )}
                                    {!!listing.hoursSincePricesUpdatedLast &&
                                        listing.hoursSincePricesUpdatedLast !== 0 &&
                                        `Synced ${listing.hoursSincePricesUpdatedLast} hour${
                                            listing.hoursSincePricesUpdatedLast === 1 ? "" : "s"
                                        } ago`}
                                    {listing.hoursSincePricesUpdatedLast === 0 &&
                                        "Synced a few minutes ago"}
                                </div>
                            )}
                            <div className="btn-group">
                                {listing.pricingEnabled && (
                                    <button
                                        type="button"
                                        className={syncPricesButtonClasses}
                                        onClick={handleSyncPrices}
                                    >
                                        {!showSpinner.syncPricing && (
                                            <FiRefreshCcw className="mr-1" />
                                        )}
                                        {showSpinner.syncPricing && (
                                            <FaCircleNotch className="fa-spin mr-1" />
                                        )}
                                        <span className="d-none d-sm-block text-nowrap">
                                            Sync Pricing
                                        </span>
                                    </button>
                                )}
                                {listing.pricingEnabled && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={handleTogglePricing}
                                    >
                                        {!showSpinner.togglePricing && <FiPause className="mr-1" />}
                                        {showSpinner.togglePricing && (
                                            <FaCircleNotch className="fa-spin mr-1" />
                                        )}
                                        <span className="d-none d-sm-block">Enabled</span>
                                    </button>
                                )}
                                {!listing.pricingEnabled &&
                                    !errors.no_listing_pricing_rules &&
                                    !errors.listing_unlisted &&
                                    !errors.no_listing_minimum_price && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={handleTogglePricing}
                                        >
                                            {!showSpinner.togglePricing && (
                                                <FiPlay className="mr-1" />
                                            )}
                                            {showSpinner.togglePricing && (
                                                <FaCircleNotch className="fa-spin mr-1" />
                                            )}
                                            <span className="d-none d-sm-block">Paused</span>
                                        </button>
                                    )}
                                <button
                                    type="button"
                                    className="btn btn-outline-dark"
                                    onClick={() => handleShowListingSettingModal()}
                                >
                                    <FiSettings />
                                </button>
                            </div>
                        </div>
                    </div>

                    <Errors
                        errors={errors}
                        showAddPricingRule={handleShowEditPricingRule}
                        showListingSettings={handleShowListingSettingModal}
                        onRefresh={handleRefresh}
                    />
                    {!errors.no_listing_pricing_rules && !errors.listing_unlisted && (
                        <div className="d-none d-sm-block">
                            <ChartPrices
                                prices={prices}
                                currentDate={currentDate}
                                channel={channel}
                                channels={channels}
                                listing={listing}
                            />
                        </div>
                    )}
                    {!!listing.airbnbTimeZone && !errors.listing_unlisted && (
                        <div className="row mt-3 flex-grow-1">
                            <div className="col-md-12 col-lg-8">
                                <Calendar
                                    prices={prices}
                                    currentDate={currentDate}
                                    nextMonth={nextMonth}
                                    prevMonth={prevMonth}
                                    listing={listing}
                                    selectedDates={selectedDates}
                                    onSelectedDates={handleSelectedDates}
                                    onSelectedReservation={showSelectedReservation}
                                    changeChannel={changeChannel}
                                    channel={channel}
                                    channels={channels}
                                />
                            </div>
                            {showDateSettings && (
                                <div className="col-md-12 col-lg-4">
                                    {addPriceRuleButton}
                                    <h5>&nbsp;</h5>
                                    <SideBarPriceDetails
                                        onHide={closeSelectedDates}
                                        listing={listing}
                                        selectedDates={selectedDates}
                                        channel={channel}
                                    />
                                </div>
                            )}
                            <ModalReservationDetails
                                show={showReservationSettings}
                                onHide={closeReservation}
                                reservation={reservation}
                            />
                            {!showDateSettings && (
                                <div className="col-md-12 col-lg-4">
                                    {addPriceRuleButton}
                                    <h5>Pricing Rules</h5>
                                    <SortablePricingRules
                                        pricingRules={pricingRules}
                                        airbnbUserID={airbnbUserID}
                                        airbnbListingID={airbnbListingID}
                                        onEditPricingRule={handleShowEditPricingRule}
                                        onDeletePricingRule={handleShowConfirmDeletePricingRule}
                                        onPausePricingRule={handleTogglePricingRule}
                                        onReorderPricing={handleRefreshPrices}
                                        channel={channel}
                                    />
                                    <h5 className="mt-2">Note:</h5>
                                    <ol>
                                        <li>
                                            Rules are stacking, they are applied one at a time
                                            starting at the top of the list. You can reorder the
                                            rules by dragging the 3 black horizontal bars icon.
                                        </li>
                                        <li>
                                            Currently Host Tools only sets prices 365 days in
                                            advance. It is recommended that you adjust your settings
                                            on Airbnb to only accept booking 1 year in advance.
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ModalEditPricingRule
                show={showEditPricingModal}
                onHide={handleCloseModal}
                pricingRule={pricingRule}
                listing={listing}
                airbnbUserID={airbnbUserID}
                airbnbListingID={airbnbListingID}
            />
            <ModalConfirm
                show={showConfirmModal}
                onHide={handleCloseConfirmModal}
                {...confirmModal}
            />
            <ModalListingSettings
                show={showListingSettingsModal}
                onHide={handleCloseModal}
                listing={listing}
                listings={listings}
            />
        </div>
    );
}

export default Pricing;
