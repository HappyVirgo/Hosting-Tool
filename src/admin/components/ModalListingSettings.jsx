import crypto from "crypto";

import classNames from "classnames";
import isUrl from "is-url";
import PropTypes from "prop-types";
import React, {useEffect, useState, useContext} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiCalendar, FiHelpCircle, FiPlus, FiRefreshCcw, FiTrash2} from "react-icons/fi";

import airbnbIcon from "../img/airbnb-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";
import {UserConsumer, UserContext} from "../providers/UserProvider";
import {listingType} from "../types";
import augustIcon from "../img/august-icon.svg";

import SelectListing from "./SelectListing";
import SelectLock from "./SelectLock";
import SelectPriceSource from "./SelectPriceSource";

const sortListings = (a, b) => {
    let labelA = a.nickname ? a.nickname : a.airbnbName;
    let labelB = b.nickname ? b.nickname : b.airbnbName;
    // Make sure the label is defined
    if (!labelA || !labelB) {
        return 0;
    }
    labelA = labelA.toLowerCase();
    labelB = labelB.toLowerCase();
    if (labelA < labelB) {
        return -1;
    }
    if (labelA > labelB) {
        return 1;
    }
    return 0;
};
function ModalListingSettings(props) {
    const {
        user: {listings, locks},
        updateUser
    } = useContext(UserContext);
    const {
        show,
        onHide,
        listing,
        listing: {
            airbnbName,
            nickname,
            priceSource,
            basePrice,
            minPrice,
            pricingEnabled,
            calendars,
            syncAvailability
        }
    } = props;

    // const [listing, setListing] = useState({});
    const [listingSettings, setListingSettings] = useState({
        calendarExportCode: "",
        priceSource: "Amount",
        basePrice: 0,
        minPrice: 0,
        nickname: "",
        syncAvailability: false,
        listingEnabled: true
    });
    const [iCalURL, setICalURL] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [linkedListings, setLinkedListings] = useState([]);
    const [linkedLocks, setLinkedLocks] = useState([]);
    const [listingOptions, setListingOptions] = useState([]);
    const [lockOptions, setLockOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [linkedToListing, setLinkedToListing] = useState({});

    useEffect(() => {
        if (show) {
            let {calendarExportCode, listingEnabled} = listing;
            listingEnabled = listingEnabled !== false;
            if (!calendarExportCode) {
                calendarExportCode = "";
            }
            const listingID = listing._id;
            const linkedListingIDs = listings.reduce((result, listing) => {
                if (listing.linkedListingID === listingID) {
                    result.push(listing._id);
                }
                return result;
            }, []);
            buildListingOptions(linkedListingIDs);

            const linkedLockIDs = locks.reduce((result, lock) => {
                if (lock.listingID === listingID) {
                    result.push(lock._id);
                }
                return result;
            }, []);
            buildLockOptions(linkedLockIDs);

            let linkedToListing = false;
            if (listing.linkedListingID) {
                linkedToListing = listings.find(list => listing.linkedListingID === list._id);
            }
            const newListingSettings = {
                airbnbName,
                nickname,
                priceSource,
                basePrice,
                minPrice,
                listingEnabled,
                pricingEnabled,
                calendars,
                calendarExportCode,
                syncAvailability
            };
            if (!nickname) {
                newListingSettings.nickname = "";
            }
            if (!priceSource) {
                newListingSettings.priceSource = "Amount";
            }
            if (!basePrice) {
                newListingSettings.basePrice = 0;
            }
            setListingSettings(newListingSettings);
            setShowSpinner(false);
            setLinkedToListing(linkedToListing);
        }
    }, [show]);

    function buildListingOptions(linkedListingIDs) {
        const listingID = listing._id;
        const {source} = listing;
        const sources = [source];
        const result = listings.reduce(
            (result, listing) => {
                // Don't include this listing
                if (listingID === listing._id) {
                    return result;
                }
                // Only include enabled listings
                if (listing.listingEnabled === false) {
                    return result;
                }
                const isLinkedListing = linkedListingIDs.find(linkedListingID => {
                    return linkedListingID === listing._id;
                });
                if (isLinkedListing) {
                    sources.push(listing.source);
                    result.linkedListings.push(listing);
                    return result;
                }
                if (listing.linkedListingID) {
                    // Don't allow listings that are already linked somewhere else
                    return result;
                }
                result.options.push({
                    value: listing._id,
                    label: listing.nickname ? listing.nickname : listing.airbnbName,
                    source: listing.source
                });
                return result;
            },
            {options: [], linkedListings: []}
        );
        const {linkedListings} = result;
        let {options} = result;
        // Only allow one listing from each source, remove any options with a
        // source already selected or with the same source as parent listing
        options = options.reduce((result, option) => {
            if (!sources.includes(option.source)) {
                result.push(option);
            }
            return result;
        }, []);

        options.sort((a, b) => {
            let labelA = a.label;
            let labelB = b.label;
            // Make sure the label is defined
            if (!labelA || !labelB) {
                return 0;
            }
            labelA = labelA.toLowerCase();
            labelB = labelB.toLowerCase();
            if (labelA < labelB) {
                return -1;
            }
            if (labelA > labelB) {
                return 1;
            }
            return 0;
        });
        linkedListings.sort(sortListings);
        setListingOptions(options);
        setLinkedListings(linkedListings);
    }

    function buildLockOptions(linkedLockIDs) {
        const result = locks.reduce(
            (result, lock) => {
                const isLinkedLock = linkedLockIDs.find(linkedLockID => {
                    return linkedLockID === lock._id;
                });
                if (isLinkedLock) {
                    result.linkedLocks.push(lock);
                    return result;
                }
                // Only include locks that aren't already linked
                if (lock.listingID) {
                    return result;
                }
                result.options.push({
                    value: lock._id,
                    label: lock.name,
                    source: lock.source
                });
                return result;
            },
            {options: [], linkedLocks: []}
        );
        const {linkedLocks, options} = result;
        options.sort((a, b) => {
            let labelA = a.label;
            let labelB = b.label;
            // Make sure the label is defined
            if (!labelA || !labelB) {
                return 0;
            }
            labelA = labelA.toLowerCase();
            labelB = labelB.toLowerCase();
            if (labelA < labelB) {
                return -1;
            }
            if (labelA > labelB) {
                return 1;
            }
            return 0;
        });
        setLockOptions(options);
        setLinkedLocks(linkedLocks);
    }

    function handleSelectedOption(field, option) {
        if (!option) {
            return;
        }
        if (field === "linkedListing") {
            const newListing = listings.find(listing => {
                return option.value === listing._id;
            });
            // Make sure the listing isn't already on the linkedListings list
            if (linkedListings.some(linkedListing => newListing._id === linkedListing._id)) {
                return;
            }
            linkedListings.push(newListing);
            const linkedListingIDs = linkedListings.map(linkedListing => {
                return linkedListing._id;
            });
            buildListingOptions(linkedListingIDs);
        } else if (field === "linkedLock") {
            const newLock = locks.find(lock => {
                return option.value === lock._id;
            });
            // Make sure the listing isn't already on the linkedListings list
            if (linkedLocks.some(linkedLock => newLock._id === linkedLock._id)) {
                return;
            }
            linkedLocks.push(newLock);
            const linkedLockIDs = linkedLocks.map(linkedLock => {
                return linkedLock._id;
            });
            buildLockOptions(linkedLockIDs);
        } else {
            const newListingSettings = {};
            newListingSettings[field] = option.value;
            setListingSettings(listingSettings => {
                return {...listingSettings, ...newListingSettings};
            });
        }
    }

    async function hideListingSettingsModal(isSuccess) {
        try {
            // Needs to be === true because sometimes isSuccess can be an event object which we don't want
            if (isSuccess === true) {
                await updateUser();
            }
            onHide(isSuccess);
        } catch (error) {
            console.error("error", error);
        }
    }

    function handleChange(field, value) {
        if (field === "iCalURL") {
            setICalURL(value);
        } else {
            const newListingSettings = {};
            newListingSettings[field] = value;
            setListingSettings(listingSettings => {
                return {...listingSettings, ...newListingSettings};
            });
        }
    }

    function handleToggle(field) {
        const newListingSettings = {};
        if (field === "calendarExportCode") {
            if (listingSettings[field] === "") {
                generateCalendarExportCode();
            } else {
                newListingSettings[field] = "";
            }
        } else {
            newListingSettings[field] = !listingSettings[field];
        }
        setListingSettings(listingSettings => {
            return {...listingSettings, ...newListingSettings};
        });
    }

    function addCalendar() {
        if (!isUrl(iCalURL)) {
            setErrors({iCalURL: "Please enter a valid iCal link."});
            return;
        }
        const {calendars} = listingSettings;
        const newListingSettings = {calendars};
        if (!newListingSettings.calendars) {
            newListingSettings.calendars = [];
        }
        if (
            newListingSettings.calendars.some(calendar => {
                return calendar.iCalURL === iCalURL;
            })
        ) {
            setErrors({iCalURL: "The iCal link already exists."});
            return;
        }
        newListingSettings.calendars.push({iCalURL});
        setListingSettings(listingSettings => {
            return {...listingSettings, ...newListingSettings};
        });
        setICalURL("");
        setErrors({});
    }

    function deleteCalendar(iCalURL) {
        const calendars = listingSettings.calendars.filter(calendar => {
            return calendar.iCalURL !== iCalURL;
        });
        setListingSettings(listingSettings => {
            return {...listingSettings, ...{calendars}};
        });
    }

    async function generateCalendarExportCode() {
        const buf = await crypto.randomBytes(20);
        const calendarExportCode = buf.toString("hex");
        setListingSettings(listingSettings => {
            return {...listingSettings, ...{calendarExportCode}};
        });
    }

    // addLinkedListingID(linkedListingID) {
    //     const {listingSettings} = this.state;
    //     if (!listingSettings.linkedListingIDs) {
    //         listingSettings.linkedListingIDs = [];
    //     }
    //     if (
    //         listingSettings.linkedListingIDs.some(currentLinkedListingID => {
    //             return currentLinkedListingID === linkedListingID;
    //         })
    //     ) {
    //         setErrors( {linkedListingID: "This listing is already linked already exists."});
    //         return;
    //     }
    //     listingSettings.linkedListingIDs.push(linkedListingID);
    // setListingSettings(listingSettings);
    // setICalURL("");
    // setErrors({});
    // }

    function deleteLinkedListingID(linkedListingToRemove) {
        const filteredLinkedListings = linkedListings.filter(linkedListing => {
            return linkedListing._id !== linkedListingToRemove._id;
        });
        const linkedListingIDs = filteredLinkedListings.map(linkedListing => {
            return linkedListing._id;
        });
        buildListingOptions(linkedListingIDs);
    }

    function deleteLock(lockToRemove) {
        const filteredLocks = linkedLocks.filter(lock => {
            return lock._id !== lockToRemove._id;
        });
        const lockIDs = filteredLocks.map(lock => {
            return lock._id;
        });
        buildLockOptions(lockIDs);
    }

    async function handleSubmit() {
        try {
            setShowSpinner(true);
            const {airbnbUserID, airbnbListingID} = listing;
            const linkedListingIDs = linkedListings.map(linkedListing => {
                return linkedListing._id;
            });
            const linkedLockIDs = linkedLocks.map(linkedLock => {
                return linkedLock._id;
            });
            if (validateForm()) {
                const url = "/editListingSettings";
                const fields = {
                    airbnbUserID,
                    airbnbListingID,
                    linkedListingIDs,
                    linkedLockIDs,
                    ...listingSettings
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
                    hideListingSettingsModal(true);
                } else {
                    console.error("response", response);
                    // window.location = "/admin";
                }
            }
            // this.setState({showSpinner: false});
        } catch (error) {
            setShowSpinner(false);
            console.error("error", error);
        }
    }

    function validateForm() {
        const errors = {};
        let formIsValid = true;
        if (listingSettings.listingEnabled) {
            if (listingSettings.pricingEnabled) {
                if (isNaN(listingSettings.minPrice) || listingSettings.minPrice === "") {
                    formIsValid = false;
                    errors.minPrice = "Please add a minimum price.";
                }
                if (listingSettings.priceSource === "Amount") {
                    if (isNaN(listingSettings.basePrice) || listingSettings.basePrice === "") {
                        formIsValid = false;
                        errors.basePrice = "Please add a base price.";
                    }
                    else if (Number(listingSettings.basePrice) < Number(listingSettings.minPrice)) {
                        formIsValid = false;
                        errors.basePrice =
                            "Please add a base price that is higher than your minimum price.";
                    }
                }
            }
        }
        setErrors(errors);
        return formIsValid;
    }

    const nicknameOverlay = (
        <Tooltip>
            The listing nickname is for your reference only, it will not be changed on your public
            listing.
        </Tooltip>
    );
    const listingEnabledOverlay = (
        <Tooltip>
            Disabling a listing will immediately stop all automation&apos;s. You will also no longer
            be billed for the listing.
        </Tooltip>
    );
    const minPriceOverlay = (
        <Tooltip>
            The listing minimum price is the lowest the pricing engine will set your price to.
        </Tooltip>
    );
    const priceSourceOverlay = (
        <Tooltip>
            The listing base price is the initial price the pricing engine will use when calculating
            your price. You can set a static amount or use Airbnb&apos;s Smart Pricing. If you link
            this listing to another listing, you can use Airbnb&apos;s or VRBO&apos;s current
            pricing as the base price or just copy your prices from one listing to the other.
        </Tooltip>
    );
    const iCalOverlay = (
        <Tooltip>
            Calendar syncing allows you to automatically synchronize your calendar with your
            external calendar availability, like HomeAway, Booking.com, etc. Add all the iCal
            calendar links from all the channels you list this property on.
        </Tooltip>
    );
    const LinkListingOverlay = (
        <Tooltip>
            If you have a property listed with multiple providers you can link them so that you
            don&apos;t have to create the same message rules for both listings. If you enable
            Availability Syncing, this will also sync the availability from this listing to the
            linked listings and vice versa to prevent double bookings. You can only link one listing
            from each channel.
        </Tooltip>
    );
    const LinkLockOverlay = (
        <Tooltip>
            Once you link a lock with your listing, Host Tools will automatically create temporary
            keypad codes for each reservation that they can use during their stay. You can also
            include the keypad code as a message tag in your message rules.
        </Tooltip>
    );
    const LinkedToListingOverlay = (
        <Tooltip>
            This listing is linked to another listing. To unlink it, open the parent listing&apos;s
            settings and unlink it.
        </Tooltip>
    );
    const calendarExportCodeOverlay = (
        <Tooltip>Export your listing&apos;s availability calendar.</Tooltip>
    );

    const syncAvailabilityOverlay = (
        <Tooltip>
            Allow Host Tools to set the calendar availability. Enabling this will overwrite any
            blocked dates on Airbnb or HomeAway with the blocked dates set on Host Tools. Once this
            is enabled, if you need to change the availability of a date on the calendar, you should
            change it on Host Tools because it will overwrite any blocked dates on Airbnb or
            HomeAway.
        </Tooltip>
    );

    const minPriceClasses = classNames("form-control", {
        "is-invalid": errors.minPrice
    });
    const priceSourceColumnClasses = classNames({
        "col-7": listingSettings.priceSource === "Amount",
        "col-12": listingSettings.priceSource !== "Amount"
    });

    const basePriceColumnClasses = classNames({
        "col-5": listingSettings.priceSource === "Amount",
        "d-none": listingSettings.priceSource !== "Amount"
    });

    const basePriceClasses = classNames("form-control", {
        "is-invalid": errors.basePrice
    });

    const iCalURLClasses = classNames("form-control", {
        "is-invalid": errors.iCalURL
    });

    let calendarExportURL = `https://hosttools.com/ical/${listingSettings.calendarExportCode}`;
    if (process.env.IS_BETA) {
        calendarExportURL = `https://beta.hosttools.com/ical/${listingSettings.calendarExportCode}`;
    }
    let linkedToListingIcon;
    if (listing.linkedListingID) {
        linkedToListingIcon = airbnbIcon;
        if (linkedToListing.source === "HomeAway") {
            linkedToListingIcon = homeawayIcon;
        }
    }
    const isLinkedListing = !!listing.linkedListingID;
    return (
        <Modal show={show} onHide={hideListingSettingsModal} backdrop="static">
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>Listing Settings</Modal.Title>
                </Modal.Header>

                <Modal.Body className="pd-20 pd-sm-40">
                    <div className="form-group">
                        <label
                            htmlFor="title"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Title
                        </label>
                        <p id="title">{listing.airbnbName}</p>
                    </div>
                    {!isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label
                                htmlFor="nickname"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Nickname
                                <OverlayTrigger placement="top" overlay={nicknameOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="nickname"
                                className="form-control"
                                placeholder={listing.airbnbName}
                                name="nickname"
                                type="text"
                                value={listingSettings.nickname}
                                onChange={event => {
                                    handleChange("nickname", event.target.value);
                                }}
                                disabled={!listingSettings.listingEnabled}
                            />
                        </div>
                    )}
                    {!isLinkedListing && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="listingEnabled"
                                    type="checkbox"
                                    checked={!listingSettings.listingEnabled}
                                    onChange={() => {
                                        handleToggle("listingEnabled");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="listingEnabled"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Disable listing
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={listingEnabledOverlay}
                                        >
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {!isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="pricingEnabled"
                                    type="checkbox"
                                    checked={!listingSettings.pricingEnabled}
                                    onChange={() => {
                                        handleToggle("pricingEnabled");
                                    }}
                                    disabled={!listingSettings.listingEnabled}
                                />
                                <span>
                                    <label
                                        htmlFor="pricingEnabled"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Pause pricing tool
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {!isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label
                                htmlFor="minPrice"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Minimum Price
                                <OverlayTrigger placement="top" overlay={minPriceOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        {listing.currencySymbol}
                                    </span>
                                </div>
                                <input
                                    id="minPrice"
                                    className={minPriceClasses}
                                    placeholder="Min Price..."
                                    name="minPrice"
                                    type="number"
                                    value={listingSettings.minPrice}
                                    onChange={event => {
                                        handleChange("minPrice", event.target.value);
                                    }}
                                    disabled={!listingSettings.listingEnabled}
                                />
                            </div>
                            {errors.minPrice && (
                                <div className="alert alert-danger">{errors.minPrice}</div>
                            )}
                        </div>
                    )}

                    {!isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label
                                htmlFor="priceSource"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Base Price
                                <OverlayTrigger placement="top" overlay={priceSourceOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <div className="row">
                                <div className={priceSourceColumnClasses}>
                                    <SelectPriceSource
                                        id="priceSource"
                                        selectedValue={listingSettings.priceSource}
                                        includeChannels={linkedListings.length > 0}
                                        onSelectedOption={option => {
                                            handleSelectedOption("priceSource", option);
                                        }}
                                        isDisabled={!listingSettings.listingEnabled}
                                    />
                                </div>
                                <div className={basePriceColumnClasses}>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                {listing.currencySymbol}
                                            </span>
                                        </div>
                                        <input
                                            id="basePrice"
                                            className={basePriceClasses}
                                            placeholder="Base Price..."
                                            name="basePrice"
                                            type="number"
                                            value={listingSettings.basePrice}
                                            onChange={event => {
                                                handleChange("basePrice", event.target.value);
                                            }}
                                            disabled={!listingSettings.listingEnabled}
                                        />
                                    </div>
                                </div>
                            </div>
                            {errors.basePrice && (
                                <div className="alert alert-danger">{errors.basePrice}</div>
                            )}
                        </div>
                    )}
                    {!isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label
                                htmlFor="event"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Smart Locks
                                <OverlayTrigger placement="top" overlay={LinkLockOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            {linkedLocks.length !== 0 &&
                                linkedLocks.map(lock => {
                                    const icon = augustIcon;
                                    // if (listing.source === "HomeAway") {
                                    //     icon = homeawayIcon;
                                    // }
                                    return (
                                        <div
                                            key={lock._id}
                                            className="d-flex justify-content-between mb-3"
                                        >
                                            <div className="d-flex align-items-center text-truncate">
                                                <img
                                                    alt={lock.source}
                                                    src={icon}
                                                    className="icon buttonHeight mg-r-5"
                                                />
                                                <span className="text-truncate">{lock.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-xs btn-outline-danger"
                                                onClick={() => {
                                                    deleteLock(lock);
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    );
                                })}
                            <SelectLock
                                id="locks"
                                options={lockOptions}
                                onSelectedOption={option => {
                                    handleSelectedOption("linkedLock", option);
                                }}
                                isDisabled={!listingSettings.listingEnabled}
                            />
                        </div>
                    )}
                    {isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label
                                htmlFor="event"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Linked To
                                <OverlayTrigger placement="top" overlay={LinkedToListingOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <div
                                key={linkedToListing._id}
                                className="d-flex justify-content-between mb-3"
                            >
                                <div className="d-flex align-items-center text-truncate">
                                    <img
                                        alt={linkedToListing.source}
                                        src={linkedToListingIcon}
                                        className="icon buttonHeight mg-r-5"
                                    />
                                    <span className="text-truncate">
                                        {linkedToListing.nickname
                                            ? linkedToListing.nickname
                                            : linkedToListing.airbnbName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    {!listing.linkedListingID && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="syncAvailability"
                                    type="checkbox"
                                    checked={
                                        listingSettings.syncAvailability &&
                                        listingSettings.listingEnabled
                                    }
                                    onChange={() => {
                                        handleToggle("syncAvailability");
                                    }}
                                    disabled={!listingSettings.listingEnabled}
                                />
                                <span>
                                    <label
                                        htmlFor="syncAvailability"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Sync Availability
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={syncAvailabilityOverlay}
                                        >
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                </span>
                            </label>
                            {listingSettings.syncAvailability && !listing.syncAvailability && (
                                <div className="alert alert-danger">
                                    Enabling availability sync will overwrite all blocked dates on
                                    your listing&apos;s calendars with the reservations and blocked
                                    dates on Host Tool&apos;s calendar. Host Tools calendar should
                                    be thought of as the parent calendar to the children HomeAway or
                                    Airbnb calendar&apos;s. After enabling availability syncing, you
                                    should only block dates on the Host Tools calendar and it will
                                    populate the blocked dates to the other calendars.
                                </div>
                            )}
                        </div>
                    )}
                    {!isLinkedListing && listingSettings.listingEnabled && (
                        <div className="form-group">
                            <label
                                htmlFor="event"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Link Listings
                                <OverlayTrigger placement="top" overlay={LinkListingOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            {linkedListings.length !== 0 &&
                                linkedListings.map(listing => {
                                    let icon = airbnbIcon;
                                    if (listing.source === "HomeAway") {
                                        icon = homeawayIcon;
                                    }
                                    return (
                                        <div
                                            key={listing._id}
                                            className="d-flex justify-content-between mb-3"
                                        >
                                            <div className="d-flex align-items-center text-truncate">
                                                <img
                                                    alt={listing.source}
                                                    src={icon}
                                                    className="icon buttonHeight mg-r-5"
                                                />
                                                <span className="text-truncate">
                                                    {listing.nickname
                                                        ? listing.nickname
                                                        : listing.airbnbName}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-xs btn-outline-danger"
                                                onClick={() => {
                                                    deleteLinkedListingID(listing);
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    );
                                })}
                            <SelectListing
                                id="listings"
                                options={listingOptions}
                                onSelectedOption={option => {
                                    handleSelectedOption("linkedListing", option);
                                }}
                                isDisabled={!listingSettings.listingEnabled}
                            />
                        </div>
                    )}
                    {!listing.linkedListingID && (
                        <div className="form-group">
                            <label
                                htmlFor="iCalURL"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Import Calendars
                                <OverlayTrigger placement="top" overlay={iCalOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            {listingSettings.calendars &&
                                listingSettings.calendars.map(calendar => {
                                    const {iCalURL} = calendar;
                                    return (
                                        <div
                                            key={calendar._id}
                                            className="d-flex justify-content-between align-items-center mb-3"
                                        >
                                            <span className="text-truncate">{iCalURL}</span>
                                            <button
                                                type="button"
                                                className="btn btn-xs btn-outline-danger"
                                                onClick={() => {
                                                    deleteCalendar(iCalURL);
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    );
                                })}
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <FiCalendar />
                                    </span>
                                </div>
                                <input
                                    id="iCalURL"
                                    className={iCalURLClasses}
                                    placeholder="iCal..."
                                    name="iCalURL"
                                    type="text"
                                    value={iCalURL}
                                    onChange={event => {
                                        handleChange("iCalURL", event.target.value);
                                    }}
                                />
                                <div className="input-group-append">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={addCalendar}
                                    >
                                        <FiPlus className="mr-1" />
                                        Add
                                    </button>
                                </div>
                            </div>
                            {errors.iCalURL && (
                                <div className="alert alert-danger">{errors.iCalURL}</div>
                            )}
                        </div>
                    )}
                    {!listing.linkedListingID && (
                        <div className="form-group">
                            <label className="ckbox">
                                <input
                                    id="calendarExportCode"
                                    type="checkbox"
                                    checked={
                                        listingSettings.calendarExportCode !== "" &&
                                        listingSettings.listingEnabled
                                    }
                                    onChange={() => {
                                        handleToggle("calendarExportCode");
                                    }}
                                    disabled={!listingSettings.listingEnabled}
                                />
                                <span>
                                    <label
                                        htmlFor="calendarExportCode"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Export Calendar
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={calendarExportCodeOverlay}
                                        >
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                </span>
                            </label>
                        </div>
                    )}
                    {!listing.linkedListingID &&
                        !!listingSettings.calendarExportCode &&
                        listingSettings.listingEnabled && (
                            <div className="form-group">
                                <div className="input-group">
                                    <input
                                        id="url"
                                        className="form-control"
                                        name="url"
                                        type="text"
                                        value={calendarExportURL}
                                        readOnly
                                    />
                                    <div className="input-group-append">
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark"
                                            onClick={generateCalendarExportCode}
                                        >
                                            <FiRefreshCcw className="mr-1" />
                                            New URL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                </Modal.Body>

                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={hideListingSettingsModal}
                    >
                        Close
                    </button>
                    {!isLinkedListing && (
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleSubmit}
                        >
                            {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                            Save
                        </button>
                    )}
                </Modal.Footer>
            </form>
        </Modal>
    );
}

ModalListingSettings.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    listing: listingType.isRequired
};

const ConnectedModalListingSettings = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <ModalListingSettings {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default ConnectedModalListingSettings;
