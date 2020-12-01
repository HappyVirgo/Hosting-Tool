import crypto from "crypto";

import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle, FiRefreshCcw, FiTrash2} from "react-icons/fi";

import {UserConsumer} from "../providers/UserProvider";
import airbnbIcon from "../img/airbnb-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";

import SelectListing from "./SelectListing";

class ModalListingGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: [],
            listingGroup: {name: "", listings: [], accessCode: ""},
            showSpinner: false,
            errors: {}
        };

        this.setOptions = this.setOptions.bind(this);
        this.hideListingGroupModal = this.hideListingGroupModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDeleteListing = this.handleDeleteListing.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.handleSelectedOption = this.handleSelectedOption.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.generateAccessCode = this.generateAccessCode.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const {show} = this.props;
        const nextShow = nextProps.show;
        if (nextShow && show !== nextShow) {
            const {listings} = nextProps;
            let {listingGroup} = nextProps;
            if (!listingGroup) {
                listingGroup = {listings: []};
            }
            if (!listingGroup.accessCode) {
                listingGroup.accessCode = "";
            }
            this.setOptions(listings, listingGroup);
            this.setState({showSpinner: false});
        }
    }

    setOptions(listings, listingGroup) {
        const options = listings.reduce((result, listing) => {
            if (
                listingGroup &&
                listingGroup.listings &&
                listingGroup.listings.find(listingInGroup => {
                    return listingInGroup._id === listing._id;
                })
            ) {
                return result;
            }
            // Don't allow users to add linked listings to listing groups
            if (listing.linkedListingID) {
                return result;
            }
            result.push({
                value: listing._id,
                label: listing.nickname ? listing.nickname : listing.airbnbName,
                source: listing.source
            });
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
        if (!listingGroup) {
            listingGroup = {name: "", listings: []};
        }
        this.setState({listingGroup, options});
    }

    async hideListingGroupModal(isSuccess) {
        try {
            const {onHide} = this.props;
            onHide(isSuccess);
        } catch (error) {
            console.error("error", error);
        }
    }

    handleChange(field, value) {
        const {listingGroup} = this.state;
        listingGroup[field] = value;
        this.setState({listingGroup});
    }

    handleSelectedOption(field, option) {
        if (field === "listing") {
            const {listings} = this.props;
            const {listingGroup} = this.state;
            const listing = listings.find(listing => {
                return option.value === listing._id;
            });
            const newListings = [...listingGroup.listings];
            if (newListings.some(newListing => listing._id === newListing._id)) {
                return;
            }
            newListings.push(listing);
            newListings.sort((a, b) => {
                let nameA = a.airbnbName.toLowerCase();
                let nameB = b.airbnbName.toLowerCase();
                if (a.nickname) {
                    nameA = a.nickname.toLowerCase();
                }
                if (b.nickname) {
                    nameB = b.nickname.toLowerCase();
                }
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            listingGroup.listings = newListings;
            this.setOptions(listings, listingGroup);
        }
    }

    async handleToggle(field) {
        const {listingGroup} = this.state;
        if (field === "accessCode") {
            if (listingGroup[field] === "") {
                this.generateAccessCode();
            } else {
                listingGroup[field] = "";
            }
        } else {
            listingGroup[field] = !listingGroup[field];
        }
        this.setState({listingGroup});
    }

    async generateAccessCode() {
        const {listingGroup} = this.state;
        const buf = await crypto.randomBytes(20);
        listingGroup.accessCode = buf.toString("hex");
        this.setState({listingGroup});
    }

    handleDeleteListing(listing) {
        const listingIDToRemove = listing._id;
        const {listings} = this.props;
        const {listingGroup} = this.state;
        listingGroup.listings = listingGroup.listings.filter(listing => {
            return listing._id !== listingIDToRemove;
        });
        this.setOptions(listings, listingGroup);
    }

    async handleSubmit() {
        try {
            this.setState({showSpinner: true});
            const {
                listingGroup: {_id, listings, name, accessCode}
            } = this.state;
            if (this.validateForm()) {
                const url = "/addListingGroup";
                const listingIDs = listings.map(listing => {
                    return listing._id;
                });
                const fields = {_id, listingIDs, name, accessCode};
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                if (response.ok) {
                    await this.hideListingGroupModal(true);
                } else {
                    console.error("response", response);
                    // window.location = "/admin";
                    this.setState({showSpinner: false});
                }
            }
        } catch (error) {
            this.setState({showSpinner: false});
            console.error("error", error);
        }
    }

    validateForm() {
        const {listingGroup} = this.state;
        const errors = {};
        let formIsValid = true;
        if (listingGroup.name) {
            listingGroup.name = listingGroup.name.trim();
        }
        if (!listingGroup.name) {
            formIsValid = false;
            errors.name = "Please add a group name.";
        }
        this.setState({errors});
        return formIsValid;
    }

    render() {
        const {show, onHide} = this.props;
        const {options, listingGroup, showSpinner, errors} = this.state;

        let turnoverUrl = `https://turnovers.hosttools.com/${listingGroup.accessCode}`;
        if (process.env.IS_BETA) {
            turnoverUrl = `https://beta-turnovers.hosttools.com/${listingGroup.accessCode}`;
        }

        const nameOverlay = (
            <Tooltip>This is a private name to help identify this grouping of listings</Tooltip>
        );
        const accessCodeOverlay = (
            <Tooltip>
                When you enable the Public Turnover URL, a unique URL is created for this listing
                group that you can share. The URL will display all the check-in and check-out
                details for the listings in this listing group.
            </Tooltip>
        );
        return (
            <Modal show={show} onHide={this.hideListingGroupModal} backdrop="static">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>Listing Settings</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="pd-20 pd-sm-40">
                        <div className="form-group">
                            <label
                                htmlFor="name"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Listing Group Name
                                <OverlayTrigger placement="top" overlay={nameOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <input
                                id="name"
                                className="form-control"
                                placeholder="Listing group name..."
                                name="name"
                                type="text"
                                value={listingGroup.name}
                                onChange={event => {
                                    this.handleChange("name", event.target.value);
                                }}
                            />
                            {errors.name && <div className="alert alert-danger">{errors.name}</div>}
                        </div>
                        <div className="form-group">
                            <label
                                htmlFor="event"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Add Listing
                            </label>
                            <SelectListing
                                id="listings"
                                options={options}
                                onSelectedOption={option => {
                                    this.handleSelectedOption("listing", option);
                                }}
                            />
                        </div>

                        <div className="form-group">
                            {listingGroup.listings &&
                                listingGroup.listings.length !== 0 &&
                                listingGroup.listings.map(listing => {
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
                                                    this.handleDeleteListing(listing);
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    );
                                })}
                            {listingGroup.listings && listingGroup.listings.length === 0 && (
                                <div className="text-center text-muted mg-y-40">
                                    No listings have been added to this group
                                </div>
                            )}
                        </div>
                        <div className="form-group mg-t-20">
                            <label className="ckbox">
                                <input
                                    id="accessCode"
                                    type="checkbox"
                                    checked={listingGroup.accessCode !== ""}
                                    onChange={() => {
                                        this.handleToggle("accessCode");
                                    }}
                                />
                                <span>
                                    <label
                                        htmlFor="accessCode"
                                        className="az-content-label tx-11 tx-medium tx-gray-600 d-inline align-middle"
                                    >
                                        Enable Public Turnover URL
                                        <OverlayTrigger placement="top" overlay={accessCodeOverlay}>
                                            <FiHelpCircle className="text-muted ml-1" />
                                        </OverlayTrigger>
                                    </label>
                                </span>
                            </label>
                        </div>
                        {!!listingGroup.accessCode && (
                            <div className="form-group">
                                <div className="input-group">
                                    <input
                                        id="url"
                                        className="form-control"
                                        name="url"
                                        type="text"
                                        value={turnoverUrl}
                                        readOnly
                                    />
                                    <div className="input-group-append">
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark"
                                            onClick={this.generateAccessCode}
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
                            onClick={() => {
                                onHide();
                            }}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={this.handleSubmit}
                        >
                            {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                            Save
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

ModalListingGroup.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    listingGroup: PropTypes.shape({
        listings: PropTypes.arrayOf(PropTypes.shape({})),
        accessCode: PropTypes.string
    }),
    listings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    updateUser: PropTypes.func.isRequired
};

const ConnectedModalListingGroup = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <ModalListingGroup {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default ConnectedModalListingGroup;
