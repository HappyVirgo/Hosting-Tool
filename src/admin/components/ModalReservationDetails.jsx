import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {FaCircleNotch} from "react-icons/fa";
import {Modal} from "react-bootstrap";

import {reservationType} from "../types";

import SelectLanguages from "./SelectLanguages";

function ModalReservationDetails(props) {
    const {show, onHide, reservation} = props;

    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState({});

    // https://github.com/reactstrap/reactstrap/issues/570
    const [reservationDetails, setReservationDetails] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        preferredLocale: ""
    });

    useEffect(() => {
        if (show) {
            setReservationDetails({
                firstName: reservation.airbnbFirstName,
                lastName: reservation.airbnbLastName,
                // email: reservation.airbnbEmail,
                phone: reservation.airbnbPhone,
                preferredLocale: reservation.airbnbPreferredLocale,
                ...reservation.custom
            });
        }
    }, [show]);

    function handleReservationDetailsChange(field, value) {
        reservationDetails[field] = value;
        setReservationDetails({
            ...reservationDetails
        });
    }

    async function submitReservationDetails() {
        try {
            showSpinner.reservation = true;
            setShowSpinner(showSpinner);
            const url = "/setReservationDetails";
            const fields = {
                reservationID: reservation._id,
                reservationDetails
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
                onHide(true);
            } else {
                const data = await response.json();
                setErrors({error: data});
            }
            showSpinner.reservation = false;
            setShowSpinner(showSpinner);
        } catch (error) {
            showSpinner.reservation = false;
            setShowSpinner(showSpinner);
            console.log("error", error);
        }
    }

    const firstNameClasses = classNames("form-control", {
        "is-invalid": errors.firstName
    });

    const lastNameClasses = classNames("form-control", {
        "is-invalid": errors.lastName
    });

    const emailClasses = classNames("form-control", {
        "is-invalid": errors.email
    });

    const phoneClasses = classNames("form-control", {
        "is-invalid": errors.phone
    });

    const language = {};
    if (reservationDetails.preferredLocale) {
        language[reservationDetails.preferredLocale] = "";
    } else {
        language.default = "";
    }

    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Reservation Details</Modal.Title>
            </Modal.Header>

            <Modal.Body className="pd-20 pd-sm-40">
                <div className="form-group">
                    <label
                        htmlFor="firstName"
                        className="az-content-label tx-11 tx-medium tx-gray-600"
                    >
                        First Name
                    </label>
                    <input
                        id="firstName"
                        className={firstNameClasses}
                        placeholder="First Name..."
                        name="firstName"
                        type="text"
                        value={reservationDetails.firstName}
                        onChange={event => {
                            handleReservationDetailsChange("firstName", event.target.value);
                        }}
                        disabled={reservation.source === "Airbnb"}
                    />
                    {errors.firstName && (
                        <div className="alert alert-danger">{errors.firstName}</div>
                    )}
                </div>
                <div className="form-group">
                    <label
                        htmlFor="lastName"
                        className="az-content-label tx-11 tx-medium tx-gray-600"
                    >
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        className={lastNameClasses}
                        placeholder="Last Name..."
                        name="lastName"
                        type="text"
                        value={reservationDetails.lastName}
                        onChange={event => {
                            handleReservationDetailsChange("lastName", event.target.value);
                        }}
                        disabled={reservation.source === "Airbnb"}
                    />
                    {errors.lastName && <div className="alert alert-danger">{errors.lastName}</div>}
                </div>
                {reservation.source !== "Airbnb" && (
                    <div className="form-group">
                        <label
                            htmlFor="email"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            className={emailClasses}
                            placeholder="Email..."
                            name="email"
                            type="text"
                            value={reservationDetails.email}
                            onChange={event => {
                                handleReservationDetailsChange("email", event.target.value);
                            }}
                            disabled={reservation.source === "Airbnb"}
                        />
                        {errors.email && <div className="alert alert-danger">{errors.email}</div>}
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="phone" className="az-content-label tx-11 tx-medium tx-gray-600">
                        Phone
                    </label>
                    <input
                        id="phone"
                        className={phoneClasses}
                        placeholder="Phone..."
                        name="phone"
                        type="text"
                        value={reservationDetails.phone}
                        onChange={event => {
                            handleReservationDetailsChange("phone", event.target.value);
                        }}
                        disabled={reservation.source === "Airbnb"}
                    />
                    {errors.phone && <div className="alert alert-danger">{errors.phone}</div>}
                </div>
                <div className="form-group">
                    <label
                        htmlFor="preferredLocale"
                        className="az-content-label tx-11 tx-medium tx-gray-600"
                    >
                        Language
                    </label>
                    <SelectLanguages
                        id="preferredLocale"
                        selectedValues={language}
                        onSelectedOption={option => {
                            handleReservationDetailsChange("preferredLocale", option.value);
                        }}
                        isMulti={false}
                        isDisabled={reservation.source === "Airbnb"}
                    />
                </div>
                {errors.error && <div className="alert alert-danger">{errors.error}</div>}
            </Modal.Body>

            <Modal.Footer>
                <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                    Close
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary mg-l-10"
                    onClick={submitReservationDetails}
                    disabled={reservation.source === "Airbnb"}
                >
                    {showSpinner.reservation && <FaCircleNotch className="fa-spin mr-1" />}
                    Save
                </button>
            </Modal.Footer>
        </Modal>
    );
}
ModalReservationDetails.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    reservation: reservationType.isRequired
};

export default ModalReservationDetails;
