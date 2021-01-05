import React, {useState, useEffect} from "react";
import {Nav, NavDropdown} from "react-bootstrap";
import {FiChevronDown, FiChevronLeft, FiMail, FiSearch, FiX} from "react-icons/fi";
import {Link, NavLink} from "react-router-dom";

import {userType} from "../types";

function NavMessaging(props) {
    const {
        user: {listings, listingGroups, globalMessageRulesCount}
    } = props;

    const [query, setQuery] = useState("");
    const [filteredListings, setFilteredListings] = useState([]);
    const [filteredListingGroups, setFilteredListingGroups] = useState([]);
    const [showMessagesNav, setShowMessagesNav] = useState(false);
    const [filteredListingCount, setFilteredListingCount] = useState(1);

    useEffect(() => {
        filterListings();
    }, [listings]);

    async function filterListings() {
        const filteredQuery = query.toLowerCase();
        const filteredListings = listings.filter(listing => {
            const isEnabled = listing.listingEnabled !== false;
            let matchesQuery = true;
            if (filteredQuery !== "") {
                if (
                    listing.airbnbName.toLowerCase().indexOf(filteredQuery) === -1 &&
                    (!listing.nickname ||
                        listing.nickname.toLowerCase().indexOf(filteredQuery) === -1)
                ) {
                    matchesQuery = false;
                }
            }
            const isLinkedListing = !!listing.linkedListingID;
            return isEnabled && matchesQuery && !isLinkedListing;
        });
        let filteredListingGroups = [].concat(listingGroups);
        filteredListingGroups.unshift({
            _id: "all",
            uniqueMessageRulesCount: globalMessageRulesCount,
            name: "All Listings"
        });
        filteredListingGroups = filteredListingGroups.filter(listingGroup => {
            let matchesQuery = true;
            if (filteredQuery !== "") {
                if (listingGroup.name.toLowerCase().indexOf(filteredQuery) === -1) {
                    matchesQuery = false;
                }
            }
            return matchesQuery;
        });
        setFilteredListings(filteredListings);
        setFilteredListingGroups(filteredListingGroups);
        setFilteredListingCount(filteredListings.length);
    }

    async function handleChange(event) {
        setQuery(event.target.value);
        filterListings();
    }

    async function handleSearchByQuery(query) {
        await setQuery(query);
        filterListings();
    }

    async function handleSearch(event) {
        event.preventDefault();
    }

    let menu = [];
    if (filteredListingCount > 1) {
        const messagesDropdownButton = (
            <span className="d-flex flex-nowrap align-items-center">
                <FiMail className="d-block d-sm-none" />
                <span className="d-none d-sm-block">Messaging</span>
                <FiChevronDown className="ml-1" />
            </span>
        );
        const items = [];
        if (filteredListingGroups.length) {
            items.push(
                <div
                    key="messageRuleNavListingGroupsLabel"
                    className="pd-x-15 pd-y-8 tx-11 tx-medium tx-gray-600 tx-uppercase justify-content-between d-flex"
                >
                    Listing Groups
                </div>
            );
            for (let i = 0; i < filteredListingGroups.length; i += 1) {
                const listingGroup = filteredListingGroups[i];
                items.push(
                    <NavDropdown.Item
                        as={Link}
                        to={`/messaging/${listingGroup._id}`}
                        className="nav-sub-link justify-content-between d-flex"
                        key={`messageRuleNavItem${listingGroup._id}`}
                    >
                        <span className="text">{listingGroup.name}</span>
                        {listingGroup.uniqueMessageRulesCount}
                    </NavDropdown.Item>
                );
            }
        }
        if (filteredListingGroups.length && filteredListings.length) {
            items.push(<NavDropdown.Divider key="messageRuleNavDivider" />);
        }
        if (filteredListings.length) {
            items.push(
                <div
                    key="messageRuleNavListingsLabel"
                    className="pd-x-15 pd-y-8 tx-11 tx-medium tx-gray-600 tx-uppercase"
                >
                    Listings
                </div>
            );
            for (let i = 0; i < filteredListings.length; i += 1) {
                const listing = filteredListings[i];
                items.push(
                    <NavDropdown.Item
                        as={Link}
                        to={`/messaging/${listing.airbnbUserID}/${listing.airbnbListingID}`}
                        className="nav-sub-link justify-content-between d-flex"
                        key={`messageRuleNavItem${listing.airbnbUserID}${listing.airbnbListingID}`}
                    >
                        <span className="text">
                            {listing.nickname ? listing.nickname : listing.airbnbName}
                        </span>
                        {listing.uniqueMessageRulesCount}
                    </NavDropdown.Item>
                );
            }
        }
        if (!listingGroups.length && !filteredListings.length) {
            items.push(
                <div
                    key="messageRuleNavNothingFound"
                    className="pd-x-15 pd-y-8 tx-gray-600 text-center"
                >
                    Nothing Found
                </div>
            );
        }
        menu = (
            <NavDropdown
                title={messagesDropdownButton}
                className="mr-2"
                show={showMessagesNav}
                onToggle={showMessagesNav => {
                    setShowMessagesNav(showMessagesNav);
                }}
            >
                <div className="d-md-none pl-2 pr-2 pt-2 d-flex align-items-center justify-content-between">
                    <button
                        className="az-header-arrow btn bg-white pd-l-10 pd-0"
                        type="button"
                        onClick={() => {
                            setShowMessagesNav(false);
                        }}
                    >
                        <FiChevronLeft />
                    </button>
                    <h4 className="m-0">Messaging</h4>
                    <span className="p-3" />
                </div>
                <NavDropdown.Divider className="d-md-none" />
                <div className="pd-x-8 pd-b-8">
                    <form className="search" onSubmit={event => handleSearch(event)}>
                        <input
                            type="search"
                            className="form-control"
                            placeholder="Filter..."
                            value={query}
                            onChange={handleChange}
                        />
                        {!query && (
                            <button type="button" className="btn" onClick={handleSearch}>
                                <FiSearch />
                            </button>
                        )}
                        {!!query && (
                            <button
                                type="button"
                                className="btn"
                                onClick={() => handleSearchByQuery("")}
                            >
                                <FiX />
                            </button>
                        )}
                    </form>
                </div>
                <div className="scrollable-menu">{items}</div>
            </NavDropdown>
        );
    } else if (filteredListings.length === 1) {
        menu = (
            <Nav.Link
                as={NavLink}
                to={`/messaging/${filteredListings[0].airbnbUserID}/${filteredListings[0].airbnbListingID}`}
                className="mr-2"
            >
                <FiMail className="d-block d-md-none" />
                <span className="d-none d-md-block">Messaging</span>
            </Nav.Link>
        );
    }
    return menu;
}

NavMessaging.propTypes = {
    user: userType.isRequired
};

export default NavMessaging;
