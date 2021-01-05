import classNames from "classnames";
import React, {useState, useEffect, useContext} from "react";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {
    FiAlertTriangle,
    FiCalendar,
    FiChevronRight,
    FiEdit2,
    FiMail,
    FiPlus,
    FiRefreshCcw,
    FiSettings,
    FiSlash,
    FiTrash2,
    FiX,
    FiLink,
    FiLock
} from "react-icons/fi";

import airbnbIcon from "../img/airbnb-icon.svg";
import augustIcon from "../img/august-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";
import {UserContext} from "../providers/UserProvider";

import Errors from "./Errors";
import ModalAddAccount from "./ModalAddAccount";
import ModalConfirm from "./ModalConfirm";
import ModalListingGroup from "./ModalListingGroup";
import ModalListingSettings from "./ModalListingSettings";
import ModalTag from "./ModalTag";
import ModalEditEmail from "./ModalEditEmail";

function Settings() {
    const {
        user: {accounts, badAccounts, listings, listingGroups, tags, integrations, badIntegrations},
        updateUser
    } = useContext(UserContext);

    const [tag, setTag] = useState({});
    const [editEmail, setEditEmail] = useState({});
    const [confirmModal, setConfirmModal] = useState({});
    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState({});
    const [showConfirmDeleteAccountModal, setShowConfirmDeleteAccountModal] = useState(false);
    const [showConfirmDeleteListingGroupModal, setShowConfirmDeleteListingGroupModal] = useState(
        false
    );
    const [showConfirmDeleteTagModal, setShowConfirmDeleteTagModal] = useState(false);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showListingSettingsModal, setShowListingSettingsModal] = useState(false);
    const [showAddListingGroupModal, setShowAddListingGroupModal] = useState(false);
    const [showAddTagModal, setShowAddTagModal] = useState(false);
    const [showEditEmailModal, setShowEditEmailModal] = useState(false);
    const [listingGroup, setListingGroup] = useState({});
    const [credentials, setCredentials] = useState({
        source: "",
        airbnbUsername: "",
        airbnbPassword: ""
    });
    const [listing, setListing] = useState({});

    useEffect(() => {
        const tagManagerArgs = {
            dataLayer: {
                page: "Settings"
            }
        };
        TagManager.dataLayer(tagManagerArgs);
    }, []);

    async function onRefresh() {
        try {
            await updateUser();
        } catch (error) {
            console.log("error", error);
            throw error;
        }
    }

    async function forceUpdateListings(airbnbUserID) {
        try {
            showSpinner[airbnbUserID] = true;
            setShowSpinner(showSpinner);
            const fields = {airbnbUserID};
            const url = "/forceUpdateListings";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                setTimeout(async () => {
                    try {
                        await updateUser(20);
                        showSpinner[airbnbUserID] = false;
                        setShowSpinner(showSpinner);
                    } catch (error) {
                        console.log("error: ", error);
                    }
                }, 3000);
            } else {
                console.log("response", response);
                window.location = "/";
            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    function handleShowConfirmDeleteAccountModal(confirmModal) {
        setShowConfirmDeleteAccountModal(true);
        setConfirmModal(confirmModal);
    }

    async function handleCloseConfirmDeleteAccountModal(isDelete) {
        try {
            if (isDelete) {
                const accountID = confirmModal.data._id;
                const url = "/deleteAccount";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({accountID})
                });
                if (response.ok) {
                    await updateUser();
                } else {
                    console.log("response", response);
                    // window.location = "/";
                }
            }
            setShowConfirmDeleteAccountModal(false);
        } catch (error) {
            console.log("error", error);
            setShowConfirmDeleteAccountModal(false);
        }
    }

    function showConfirmDeleteAccount(account) {
        handleShowConfirmDeleteAccountModal({
            title: "Delete account?",
            message: `Deleting this account will also delete all the associated message rules and pricing rules and message history from Host Tools. Are you sure you would like to delete the ${account.airbnbUsername} account?  If you're not sure, please contact Tom and ask for advice.`,
            buttonText: "Delete",
            data: account,
            type: "danger"
        });
    }

    function handleShowAddAccountModal(type, airbnbUsername) {
        if (typeof airbnbUsername !== "string") {
            airbnbUsername = "";
            type = "";
        }
        if (airbnbUsername && !type) {
            type = "Airbnb";
        }
        setCredentials({type, airbnbUsername, airbnbPassword: ""});
        setShowAddAccountModal(true);
    }

    function handleShowListingSettingModal(listing) {
        setListing(listing);
        setShowListingSettingsModal(true);
    }

    async function handleCloseModal(reload) {
        if (reload === true) {
            await onRefresh();
        }
        setShowAddAccountModal(false);
        setShowListingSettingsModal(false);
        setShowAddListingGroupModal(false);
        setShowAddTagModal(false);
        setShowEditEmailModal(false);
    }

    function handleShowAddListingGroupModal(listingGroup) {
        setListingGroup(listingGroup);
        setShowAddListingGroupModal(true);
    }

    function handleShowConfirmDeleteListingGroupModal(confirmModal) {
        setShowConfirmDeleteListingGroupModal(true);
        setConfirmModal(confirmModal);
    }

    async function handleCloseConfirmDeleteListingGroupModal(isDelete) {
        try {
            if (isDelete) {
                const fields = confirmModal.data;
                const url = "/deleteListingGroup";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                if (response.ok) {
                    await updateUser();
                } else {
                    console.log("response", response);
                    window.location = "/";
                }
            }
            setShowConfirmDeleteListingGroupModal(false);
        } catch (error) {
            console.log("error", error);
            setShowConfirmDeleteListingGroupModal(false);
        }
    }

    function handleDeleteListingGroup(listingGroup) {
        handleShowConfirmDeleteListingGroupModal({
            title: "Delete listing group?",
            message: (
                <span>
                    Are you sure you would like to delete the&nbsp;
                    <strong>{listingGroup.name}</strong>
                    &nbsp;listing group? This will delete all associated rules as well.
                </span>
            ),
            buttonText: "Delete",
            data: listingGroup,
            type: "danger"
        });
    }

    function handleShowAddTagModal(tag) {
        setTag(tag);
        setShowAddTagModal(true);
    }

    function handleShowConfirmDeleteTagModal(confirmModal) {
        setShowConfirmDeleteTagModal(true);
        setConfirmModal(confirmModal);
    }

    async function handleCloseConfirmDeleteTagModal(isDelete) {
        try {
            if (isDelete) {
                const fields = confirmModal.data;
                console.log("fields", fields);
                const url = "/deleteTag";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                if (response.ok) {
                    await onRefresh();
                } else {
                    console.log("response", response);
                    window.location = "/";
                }
            }
            setShowConfirmDeleteTagModal(false);
        } catch (error) {
            console.log("error", error);
            setShowConfirmDeleteTagModal(false);
        }
    }

    function handleDeleteTag(tag) {
        handleShowConfirmDeleteTagModal({
            title: "Delete tag?",
            message: (
                <span>
                    Are you sure you would like to delete the&nbsp;
                    <strong>{tag.name}</strong>
                    &nbsp;tag? This will delete all associated rules as well.
                </span>
            ),
            buttonText: "Delete",
            data: tag,
            type: "danger"
        });
    }

    function handleShowEditEmailModal(id, email) {
        setEditEmail({email, id, type: "account"});
        setShowEditEmailModal(true);
    }
    return (
        <div className="az-content">
            <Errors errors={errors} onRefresh={onRefresh} />
            <div className="container">
                <div className="az-content-body">
                    <div className="d-flex justify-content-between mb-3 flex-row">
                        <div>
                            <div className="az-content-breadcrumb">
                                <span>Home</span>
                                <FiChevronRight />
                                <span>Settings</span>
                            </div>
                            <h2 className="az-content-title mb-0">User Settings</h2>
                        </div>
                    </div>
                    <div className="row ">
                        <div className="col-md-12 offset-lg-1 col-lg-10">
                            <div className="d-flex justify-content-between mb-3 flex-row">
                                <div className="d-flex align-items-center justify-content-end">
                                    <h2 className="mg-b-0">Channel Accounts</h2>
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-none d-sm-block"
                                        onClick={handleShowAddAccountModal}
                                    >
                                        <FiPlus className="mr-1" />
                                        Link Account
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-block d-sm-none"
                                        onClick={handleShowAddAccountModal}
                                    >
                                        <FiPlus className="mr-1" />
                                        Account
                                    </button>
                                </div>
                            </div>
                            {badAccounts.length !== 0 && (
                                <div className="row mt-3 pd-y-10 bd-b bd-1">
                                    <div className="col-12 text-uppercase tx-11 font-weight-bold">
                                        Accounts with errors
                                    </div>
                                </div>
                            )}
                            {badAccounts.map(account => {
                                const tableCellLeftClassnames = classNames(
                                    "col-8 pd-y-10 text-uppercase tx-11 font-weight-bold d-flex align-items-center",
                                    {
                                        "tx-danger": !account.isFiller,
                                        "alert-danger": !account.isFiller
                                    }
                                );
                                const tableCellRightClassnames = classNames(
                                    "col-4 pd-y-10",
                                    "text-right",
                                    {
                                        "tx-danger": !account.isFiller,
                                        "alert-danger": !account.isFiller
                                    }
                                );
                                const fixButtonClassnames = classNames("btn", "btn-xs", {
                                    "btn-outline-primary": !account.isFiller,
                                    "btn-outline-light": account.isFiller
                                });
                                const deleteButtonClassnames = classNames("btn", "btn-xs", {
                                    "btn-outline-danger": !account.isFiller,
                                    "btn-outline-light": account.isFiller
                                });
                                return (
                                    <div
                                        className="row bd-t bd-1"
                                        key={`${account._id}BadAccounts`}
                                    >
                                        <div className={tableCellLeftClassnames}>
                                            {!account.isFiller && (
                                                <FiAlertTriangle className="mr-2" />
                                            )}
                                            {account.airbnbUsername}
                                        </div>

                                        <div className={tableCellRightClassnames}>
                                            <div className="btn-group">
                                                <button
                                                    type="button"
                                                    className={fixButtonClassnames}
                                                    onClick={() => {
                                                        handleShowEditEmailModal(
                                                            account._id,
                                                            account.airbnbUsername
                                                        );
                                                    }}
                                                    disabled={account.isFiller}
                                                >
                                                    <FiEdit2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={fixButtonClassnames}
                                                    onClick={() => {
                                                        handleShowAddAccountModal(
                                                            account.type,
                                                            account.airbnbUsername
                                                        );
                                                    }}
                                                    disabled={account.isFiller}
                                                >
                                                    <FiRefreshCcw />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Fix
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={deleteButtonClassnames}
                                                    onClick={() => {
                                                        showConfirmDeleteAccount(account);
                                                    }}
                                                    disabled={account.isFiller}
                                                >
                                                    <FiTrash2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {accounts.map(account => {
                                let icon = airbnbIcon;
                                if (account.type === "HomeAway") {
                                    icon = homeawayIcon;
                                }
                                let rows = [];
                                rows.push(
                                    <div
                                        key={`U${account.airbnbUserID}`}
                                        className="row mt-3 pd-y-10 bd-b bd-1"
                                    >
                                        <div className="col-8 text-uppercase tx-11 font-weight-bold d-flex align-items-end align-items-center">
                                            {!account.isFiller && (
                                                <img
                                                    alt={account.type}
                                                    src={icon}
                                                    className="icon buttonHeight mg-r-5"
                                                />
                                            )}
                                            {account.airbnbUsername}
                                        </div>
                                        <div className="col-4 text-right">
                                            {!account.isFiller && (
                                                <div className="btn-group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-primary"
                                                        onClick={() => {
                                                            handleShowEditEmailModal(
                                                                account._id,
                                                                account.airbnbUsername
                                                            );
                                                        }}
                                                    >
                                                        <FiEdit2 />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Edit
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-primary"
                                                        onClick={() => {
                                                            forceUpdateListings(
                                                                account.airbnbUserID
                                                            );
                                                        }}
                                                    >
                                                        {!showSpinner[account.airbnbUserID] && (
                                                            <FiRefreshCcw />
                                                        )}
                                                        {showSpinner[account.airbnbUserID] && (
                                                            <FaCircleNotch className="fa-spin" />
                                                        )}
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Refresh
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-danger"
                                                        onClick={() => {
                                                            showConfirmDeleteAccount(account);
                                                        }}
                                                    >
                                                        <FiTrash2 />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                            {account.isFiller && (
                                                <div className="btn-group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-light"
                                                        disabled
                                                    >
                                                        <FiRefreshCcw />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Refresh
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-light"
                                                        disabled
                                                    >
                                                        <FiTrash2 />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                                if (!account.isFiller) {
                                    rows = rows.concat(
                                        account.listings.map(listing => {
                                            return (
                                                <div
                                                    key={`AUAL${listing.airbnbUserID}-${listing.airbnbListingID}`}
                                                    className="row pd-y-10 bd-t bd-1"
                                                >
                                                    <div className="col-8 d-flex align-items-center">
                                                        <span>
                                                            {listing.nickname
                                                                ? listing.nickname
                                                                : listing.airbnbName}
                                                        </span>
                                                    </div>
                                                    <div className="col-4 d-flex align-items-center justify-content-end">
                                                        {listing.airbnbStatus &&
                                                            listing.airbnbStatus !== "listed" && (
                                                                <span className="badge badge-info ml-1 d-flex align-items-center">
                                                                    <FiX />
                                                                    <span className="d-none d-sm-inline ml-1">
                                                                        {listing.airbnbStatus ===
                                                                        "unlisted"
                                                                            ? "Unlisted"
                                                                            : ""}
                                                                        {listing.airbnbStatus !==
                                                                            "unlisted" &&
                                                                            listing.airbnbStatus !==
                                                                                "in progress" &&
                                                                            listing.airbnbStatus}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        {listing.lockCount !== 0 &&
                                                            listing.listingEnabled && (
                                                                <span className="ml-1 d-flex align-items-center">
                                                                    <FiLock className="mr-1" />
                                                                    {listing.lockCount}
                                                                </span>
                                                            )}
                                                        {listing.linkedListingCount !== 0 &&
                                                            listing.listingEnabled && (
                                                                <span className="ml-1 d-flex align-items-center">
                                                                    <FiLink className="mr-1" />
                                                                    {listing.linkedListingCount}
                                                                </span>
                                                            )}
                                                        {listing.pricingRulesCount !== 0 &&
                                                            listing.listingEnabled && (
                                                                <span className="ml-1 d-flex align-items-center">
                                                                    <FiCalendar className="mr-1" />
                                                                    {listing.pricingRulesCount}
                                                                </span>
                                                            )}
                                                        {listing.uniqueMessageRulesCount !== 0 &&
                                                            listing.listingEnabled && (
                                                                <span className="ml-1 d-flex align-items-center">
                                                                    <FiMail className="mr-1" />
                                                                    {
                                                                        listing.uniqueMessageRulesCount
                                                                    }
                                                                </span>
                                                            )}
                                                        {!listing.listingEnabled && (
                                                            <span className="badge badge-secondary ml-1 d-flex align-items-center">
                                                                <FiSlash />
                                                                <span className="d-none d-sm-inline ml-1">
                                                                    Disabled
                                                                </span>
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-primary ml-2"
                                                            onClick={() => {
                                                                handleShowListingSettingModal(
                                                                    listing
                                                                );
                                                            }}
                                                        >
                                                            <FiSettings />
                                                            <span className="d-none d-sm-inline ml-1">
                                                                Settings
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    );
                                }

                                if (account.isFiller) {
                                    rows = rows.concat(
                                        account.listings.map(listing => {
                                            return (
                                                <div
                                                    key={`${
                                                        listing.airbnbUserID +
                                                        listing.airbnbListingID
                                                    }Filler`}
                                                    className="row pd-y-10 bd-t bd-1"
                                                >
                                                    <div className="col-12 d-flex align-items-center justify-content-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-dark ml-2"
                                                            disabled
                                                        >
                                                            <FiSettings />
                                                            <span className="d-none d-sm-inline ml-1">
                                                                Settings
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    );
                                }
                                if (account.listings.length === 0) {
                                    rows.push(
                                        <div key="0Listings" className="row pd-y-10 bd-t bd-1">
                                            <div className="col-12 text-muted">
                                                No Listings Found
                                            </div>
                                        </div>
                                    );
                                }
                                return rows;
                            })}

                            <div className="d-flex justify-content-between mg-b-10 mg-t-40 flex-row">
                                <div className="d-flex align-items-center justify-content-end">
                                    <h2 className="mg-b-0">Smart Locks</h2>
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-none d-sm-block"
                                        onClick={() => {
                                            handleShowAddAccountModal("August", "");
                                        }}
                                    >
                                        <FiPlus className="mr-1" />
                                        Link Account
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-block d-sm-none"
                                        onClick={() => {
                                            handleShowAddAccountModal("August", "");
                                        }}
                                    >
                                        <FiPlus className="mr-1" />
                                        Account
                                    </button>
                                </div>
                            </div>
                            {badIntegrations.length !== 0 && (
                                <div className="row mt-3 pd-y-10 bd-b bd-1">
                                    <div className="col-12 text-uppercase tx-11 font-weight-bold">
                                        Accounts with errors
                                    </div>
                                </div>
                            )}
                            {badIntegrations.map(account => {
                                const tableCellLeftClassnames = classNames(
                                    "col-8 pd-y-10 text-uppercase tx-11 font-weight-bold d-flex align-items-center",
                                    {
                                        "tx-danger": !account.isFiller,
                                        "alert-danger": !account.isFiller
                                    }
                                );
                                const tableCellRightClassnames = classNames(
                                    "col-4 pd-y-10",
                                    "text-right",
                                    {
                                        "tx-danger": !account.isFiller,
                                        "alert-danger": !account.isFiller
                                    }
                                );
                                const fixButtonClassnames = classNames("btn", "btn-xs", {
                                    "btn-outline-primary": !account.isFiller,
                                    "btn-outline-light": account.isFiller
                                });
                                const deleteButtonClassnames = classNames("btn", "btn-xs", {
                                    "btn-outline-danger": !account.isFiller,
                                    "btn-outline-light": account.isFiller
                                });
                                return (
                                    <div
                                        className="row bd-t bd-1"
                                        key={`${account._id}BadAccounts`}
                                    >
                                        <div className={tableCellLeftClassnames}>
                                            {!account.isFiller && (
                                                <FiAlertTriangle className="mr-2" />
                                            )}
                                            {account.airbnbUsername}
                                        </div>

                                        <div className={tableCellRightClassnames}>
                                            <div className="btn-group">
                                                <button
                                                    type="button"
                                                    className={fixButtonClassnames}
                                                    onClick={() => {
                                                        handleShowEditEmailModal(
                                                            account._id,
                                                            account.airbnbUsername
                                                        );
                                                    }}
                                                    disabled={account.isFiller}
                                                >
                                                    <FiEdit2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={fixButtonClassnames}
                                                    onClick={() => {
                                                        handleShowAddAccountModal(
                                                            account.type,
                                                            account.airbnbUsername
                                                        );
                                                    }}
                                                    disabled={account.isFiller}
                                                >
                                                    <FiRefreshCcw />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Fix
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={deleteButtonClassnames}
                                                    onClick={() => {
                                                        showConfirmDeleteAccount(account);
                                                    }}
                                                    disabled={account.isFiller}
                                                >
                                                    <FiTrash2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {integrations.map(account => {
                                const icon = augustIcon;
                                // if (account.type === "HomeAway") {
                                //     icon = homeawayIcon;
                                // }
                                let rows = [];
                                rows.push(
                                    <div
                                        key={`U${account.airbnbUserID}`}
                                        className="row mt-3 pd-y-10 bd-b bd-1"
                                    >
                                        <div className="col-8 text-uppercase tx-11 font-weight-bold d-flex align-items-end align-items-center">
                                            {!account.isFiller && (
                                                <img
                                                    alt={account.type}
                                                    src={icon}
                                                    className="icon buttonHeight mg-r-5"
                                                />
                                            )}
                                            {account.airbnbUsername}
                                        </div>
                                        <div className="col-4 text-right">
                                            {!account.isFiller && (
                                                <div className="btn-group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-primary"
                                                        onClick={() => {
                                                            handleShowEditEmailModal(
                                                                account._id,
                                                                account.airbnbUsername
                                                            );
                                                        }}
                                                    >
                                                        <FiEdit2 />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Edit
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-primary"
                                                        onClick={() => {
                                                            forceUpdateListings(
                                                                account.airbnbUserID
                                                            );
                                                        }}
                                                    >
                                                        {!showSpinner[account.airbnbUserID] && (
                                                            <FiRefreshCcw />
                                                        )}
                                                        {showSpinner[account.airbnbUserID] && (
                                                            <FaCircleNotch className="fa-spin" />
                                                        )}
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Refresh
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-danger"
                                                        onClick={() => {
                                                            showConfirmDeleteAccount(account);
                                                        }}
                                                    >
                                                        <FiTrash2 />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                            {account.isFiller && (
                                                <div className="btn-group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-light"
                                                        disabled
                                                    >
                                                        <FiRefreshCcw />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Refresh
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-light"
                                                        disabled
                                                    >
                                                        <FiTrash2 />
                                                        <span className="d-none d-sm-inline ml-1">
                                                            Delete
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                                rows = rows.concat(
                                    account.locks.map(lock => {
                                        console.log("lock", lock);
                                        return (
                                            <div
                                                key={`LL${lock.august.lockId}`}
                                                className="row pd-y-10 bd-t bd-1"
                                            >
                                                <div className="col-8 d-flex align-items-center">
                                                    <span>{lock.name}</span>
                                                </div>
                                                <div className="col-4 d-flex align-items-center justify-content-end">
                                                    {lock.listingID && (
                                                        <span className="badge badge-info ml-1 d-flex align-items-center">
                                                            <FiLink />
                                                            <span className="d-none d-sm-inline ml-1">
                                                                {listings.reduce(
                                                                    (result, listing) => {
                                                                        if (
                                                                            listing._id ===
                                                                            lock.listingID
                                                                        ) {
                                                                            return listing.nickname
                                                                                ? listing.nickname
                                                                                : listing.airbnbName;
                                                                        }
                                                                        return result;
                                                                    },
                                                                    ""
                                                                )}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {!lock.listingID && (
                                                        <span className="badge badge-secondary ml-1 d-flex align-items-center">
                                                            <FiSlash />
                                                            <span className="d-none d-sm-inline ml-1">
                                                                Not Linked
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                );

                                if (account.locks.length === 0) {
                                    rows.push(
                                        <div key="0Listings" className="row pd-y-10 bd-t bd-1">
                                            <div className="col-12 text-muted">
                                                No Smart Locks Found
                                            </div>
                                        </div>
                                    );
                                }
                                return rows;
                            })}
                            {integrations.length === 0 && (
                                <div className="row pd-y-10 bd-t bd-1">
                                    <div className="col-12 text-muted">No Smart Locks Found</div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mg-b-10 mg-t-40 flex-row">
                                <div className="d-flex align-items-center justify-content-end">
                                    <h2 className="mg-b-0">Listing Groups</h2>
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-none d-sm-block"
                                        onClick={() => {
                                            handleShowAddListingGroupModal();
                                        }}
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Group
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-block d-sm-none"
                                        onClick={() => {
                                            handleShowAddListingGroupModal();
                                        }}
                                    >
                                        <FiPlus className="mr-1" />
                                        Group
                                    </button>
                                </div>
                            </div>
                            {listingGroups.map(listingGroup => {
                                let rows = [];
                                rows.push(
                                    <div
                                        key={`LG${listingGroup._id}`}
                                        className="row mt-3 pd-y-10 bd-b bd-1"
                                    >
                                        <div className="col-8 text-uppercase tx-11 font-weight-bold d-flex align-items-end align-items-center">
                                            {listingGroup.name}
                                        </div>
                                        <div className="col-4 text-right">
                                            <div className="btn-group">
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-primary"
                                                    onClick={() => {
                                                        handleShowAddListingGroupModal(
                                                            listingGroup
                                                        );
                                                    }}
                                                >
                                                    <FiEdit2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-danger"
                                                    onClick={() => {
                                                        handleDeleteListingGroup(listingGroup);
                                                    }}
                                                >
                                                    <FiTrash2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                                rows = rows.concat(
                                    listingGroup.listings.map(listing => {
                                        return (
                                            <div
                                                key={`LGL${listingGroup._id + listing._id}`}
                                                className="row pd-y-10 bd-t bd-1"
                                            >
                                                <div className="col-12">
                                                    <span>
                                                        {listing.nickname
                                                            ? listing.nickname
                                                            : listing.airbnbName}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                );

                                if (listingGroup.listings.length === 0) {
                                    rows.push(
                                        <div key="LG0Listings" className="row pd-y-10 bd-t bd-1">
                                            <div className="col-12 text-muted">
                                                No Listings Found
                                            </div>
                                        </div>
                                    );
                                }
                                return rows;
                            })}
                            {listingGroups.length === 0 && (
                                <div className="row pd-y-10 bd-t bd-1">
                                    <div className="col-12 text-muted">No Listing Groups Found</div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mg-b-10 mg-t-40 flex-row">
                                <div className="d-flex align-items-center justify-content-end">
                                    <h2 className="mg-b-0">Custom Message Tags</h2>
                                </div>
                                <div className="d-flex align-items-center justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary d-none d-sm-block"
                                        onClick={() => {
                                            handleShowAddTagModal();
                                        }}
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Tag
                                    </button>
                                </div>
                            </div>
                            {tags.map(tag => {
                                return (
                                    <div key={`T${tag.name}`} className="row pd-y-10 bd-t bd-1">
                                        <div className="col-8 d-flex align-items-center">
                                            <span>{tag.name}</span>
                                        </div>
                                        <div className="col-4 d-flex align-items-center justify-content-end">
                                            <div className="btn-group">
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-primary ml-2"
                                                    onClick={() => {
                                                        handleShowAddTagModal(tag);
                                                    }}
                                                >
                                                    <FiEdit2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-danger"
                                                    onClick={() => {
                                                        handleDeleteTag(tag);
                                                    }}
                                                >
                                                    <FiTrash2 />
                                                    <span className="d-none d-sm-inline ml-1">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {tags.length === 0 && (
                                <div className="row pd-y-10 bd-t bd-1">
                                    <div className="col-12 text-muted">No Message Tags Found</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ModalConfirm
                show={showConfirmDeleteAccountModal}
                onHide={handleCloseConfirmDeleteAccountModal}
                {...confirmModal}
            />
            <ModalAddAccount
                show={showAddAccountModal}
                onHide={handleCloseModal}
                credentials={credentials}
            />
            <ModalListingSettings
                show={showListingSettingsModal}
                onHide={handleCloseModal}
                listing={listing}
                listings={listings}
            />
            <ModalConfirm
                show={showConfirmDeleteListingGroupModal}
                onHide={handleCloseConfirmDeleteListingGroupModal}
                {...confirmModal}
            />
            <ModalListingGroup
                show={showAddListingGroupModal}
                onHide={handleCloseModal}
                listingGroup={listingGroup}
                listings={listings}
            />
            <ModalConfirm
                show={showConfirmDeleteTagModal}
                onHide={handleCloseConfirmDeleteTagModal}
                {...confirmModal}
            />
            <ModalTag show={showAddTagModal} onHide={handleCloseModal} tag={tag} />
            <ModalEditEmail
                show={showEditEmailModal}
                onHide={handleCloseModal}
                editEmail={editEmail}
            />
        </div>
    );
}

export default Settings;
