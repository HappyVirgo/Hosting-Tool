import "./Header.css";

import gravatar from "gravatar";
// import LogRocket from "logrocket";
import React, {useState, useEffect, useContext} from "react";
import {Badge, Nav, NavDropdown, Navbar} from "react-bootstrap";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";
import {
    FiChevronLeft,
    FiCreditCard,
    FiExternalLink,
    FiHelpCircle,
    FiPlus,
    FiSettings,
    FiMessageSquare,
    FiCalendar,
    FiSearch,
    FiX
} from "react-icons/fi";
import {Link, Redirect, useLocation, useHistory} from "react-router-dom";

import logoBlack from "../img/logo-black.svg";
import logoSquare from "../img/logo-icon-square.svg";
import {UserContext} from "../providers/UserProvider";

import ModalAddAccount from "./ModalAddAccount";
import NavMessaging from "./NavMessaging";
import NavPricing from "./NavPricing";

function Header() {
    const {
        user,
        user: {listings, firstName, lastName, username, subscriptionStatus}
    } = useContext(UserContext);
    const location = useLocation();
    const history = useHistory();
    const {search} = location;

    const [isBeta, setIsBeta] = useState(false);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showProfileNav, setShowProfileNav] = useState(false);
    const [query, setQuery] = useState(new URLSearchParams(search).get("q") || "");

    useEffect(() => {
        //     LogRocket.init("acu09k/superhost-tools");
        const tagManagerArgs = {
            gtmId: "GTM-59XQPWR",
            dataLayer: {
                userId: user._id
            }
        };
        TagManager.initialize(tagManagerArgs);
        ReactPixel.init("2039536889686642", {uid: user._id}, {});
        ReactPixel.pageView(); // For tracking page view
    }, []);

    useEffect(() => {
        if (username) {
            identifyUser();
        }
    }, [username]);

    useEffect(() => {
        const query = new URLSearchParams(search).get("q");
        if (query) {
            setQuery(query);
        } else {
            setQuery("");
        }
    }, [search]);

    function identifyUser() {
        const {_id} = user;
        const identity = {
            email: username,
            user_id: _id,
            custom_data: {}
        };
        if (firstName) {
            identity.name = firstName;
        }
        if (lastName) {
            identity.name += ` ${lastName}`;
        }
        if (subscriptionStatus) {
            identity.custom_data.Status = subscriptionStatus;
        }
        if (listings.length) {
            const visibleListings = listings.filter(listing => {
                if (listing.linkedListingID || !listing.listingEnabled) {
                    return false;
                }
                return true;
            });
            identity.custom_data.Listings = visibleListings.length;
        }
        // eslint-disable-next-line no-undef
        HelpCrunch("updateUser", identity);
    }

    function handleShowAddAccount(message) {
        setShowAddAccountModal(true);
    }

    function handleCloseModal() {
        setShowAddAccountModal(false);
    }

    function handleCloseNav() {
        setShowProfileNav(false);
    }

    function handleChange(event) {
        setQuery(event.target.value);
    }

    async function handleSearch(event) {
        event.preventDefault();
        history.push(`/admin/inbox?q=${encodeURIComponent(query)}`);
    }

    async function handleClearQuery() {
        await setQuery("");
    }

    const filteredListings = listings.filter(listing => {
        return listing.listingEnabled !== false;
    });

    const regexCalendar = /#!\/calendar\/(.*)/;
    const foundCalendar = location.hash.match(regexCalendar);
    if (foundCalendar) {
        return <Redirect to={`/admin/pricing/${foundCalendar[1]}`} />;
    }
    const regexMessageRules = /#!\/messageRules\/(.*)/;
    const foundMessageRules = location.hash.match(regexMessageRules);
    if (foundMessageRules) {
        return <Redirect to={`/admin/messaging/${foundMessageRules[1]}`} />;
    }
    const regexListings = /#!\/listings/;
    const foundListings = location.hash.match(regexListings);
    if (foundListings) {
        return <Redirect to="/admin/listings" />;
    }
    const regexBilling = /#!\/billing/;
    const foundBilling = location.hash.match(regexBilling);
    if (foundBilling) {
        return <Redirect to="/admin/billing" />;
    }
    const regexSettings = /#!\/settings/;
    const foundSettings = location.hash.match(regexSettings);
    if (foundSettings) {
        return <Redirect to="/admin/settings" />;
    }

    const userImage = gravatar.url(username, {s: "120", r: "pg", d: "mp"});

    const searchElement = (
        <form className="search" onSubmit={event => handleSearch(event)}>
            <input
                type="search"
                className="form-control"
                placeholder="Search..."
                value={query}
                onChange={handleChange}
            />
            {!query && (
                <button type="button" className="btn" onClick={handleSearch}>
                    <FiSearch />
                </button>
            )}
            {!!query && (
                <button type="button" className="btn" onClick={handleClearQuery}>
                    <FiX />
                </button>
            )}
        </form>
    );

    let subscriptionBadge;
    if (isBeta) {
        subscriptionBadge = (
            <Badge variant="warning" className="ml-2">
                Beta
            </Badge>
        );
    } else if (subscriptionStatus === "trialing") {
        subscriptionBadge = (
            <Badge variant="warning" className="ml-2">
                Trial
            </Badge>
        );
    }
    const profileImage = (
        <img src={userImage} alt={`${firstName} ${lastName} Avatar`} className="user-image" />
    );
    const profileNav = (
        <NavDropdown
            alignRight
            title={profileImage}
            className="ml-2"
            show={showProfileNav}
            onToggle={showProfileNav => {
                setShowProfileNav(showProfileNav);
            }}
        >
            <div className="d-md-none pl-2 pr-2 pt-2 d-flex">
                <button
                    className="az-header-arrow btn bg-white pd-l-10 pd-0"
                    type="button"
                    onClick={handleCloseNav}
                >
                    <FiChevronLeft />
                </button>
            </div>
            <div className="az-header-profile">
                <div className="az-img-user">
                    <img src={userImage} alt="" />
                </div>
                <h6>{`${firstName || ""} ${lastName || ""}`}</h6>
                <span>{subscriptionStatus}</span>
            </div>

            <div className="d-block d-lg-none pd-y-8 pd-x-15">{searchElement}</div>
            <NavDropdown.Item as={Link} to="/admin/settings" className="d-flex align-items-center">
                <FiSettings className="mr-1" />
                Settings
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/admin/billing" className="d-flex align-items-center">
                <FiCreditCard className="mr-1" />
                Billing
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/admin/faq" className="d-flex align-items-center">
                <FiHelpCircle className="mr-1" />
                F.A.Q.
            </NavDropdown.Item>
            <NavDropdown.Item onClick={handleShowAddAccount} className="d-flex align-items-center">
                <FiPlus className="mr-1" />
                Link Account
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="/logout" className="d-flex align-items-center">
                <FiExternalLink className="mr-1" />
                Sign Out
            </NavDropdown.Item>
        </NavDropdown>
    );
    return (
        <div className="az-header">
            <div className="container">
                <Navbar bg="transparent" expand="sm" className="flex-grow-1">
                    <Navbar.Brand as={Link} to="/admin">
                        <img
                            src={logoBlack}
                            height="30"
                            className="d-none d-sm-block"
                            alt="Host Tools Logo"
                        />
                        <img
                            src={logoSquare}
                            height="30"
                            className="d-block d-sm-none"
                            alt="Host Tools Logo"
                        />
                    </Navbar.Brand>
                    <Nav className="flex-grow-1">
                        {!user.isFiller && filteredListings.length !== 0 && (
                            <Nav.Link as={Link} to="/admin" className="mr-3">
                                <FiCalendar className="d-block d-sm-none" />
                                <span className="d-none d-sm-block">Calendar</span>
                            </Nav.Link>
                        )}
                        {!user.isFiller && filteredListings.length !== 0 && (
                            <Nav.Link as={Link} to="/admin/inbox" className="mr-3">
                                <FiMessageSquare className="d-block d-sm-none" />
                                <span className="d-none d-sm-block">Inbox</span>
                            </Nav.Link>
                        )}
                        {!user.isFiller && <NavMessaging user={user} />}
                        {!user.isFiller && <NavPricing user={user} />}
                        <span className="d-flex align-items-center ml-auto">
                            {subscriptionBadge}
                            <div className="d-none d-lg-block ml-2">{searchElement}</div>
                            {profileNav}
                        </span>
                    </Nav>
                </Navbar>
            </div>

            <ModalAddAccount show={showAddAccountModal} onHide={handleCloseModal} />
        </div>
    );
}

export default Header;
