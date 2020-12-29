import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {FaCircleNotch} from "react-icons/fa";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {format, isSameDay, isSameMonth} from "date-fns";
import {FiHelpCircle} from "react-icons/fi";
import {zonedTimeToUtc} from "date-fns-tz";

import {selectedDatesType, listingType} from "../types";

function ModalAvailability(props) {
    const {show, onHide, selectedDates, listing} = props;

    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState({});
    const [blocked, setBlocked] = useState(true);

    useEffect(() => {
        if (show) {
            setShowSpinner({blocked: false});
            setBlocked(!!selectedDates.blocked);
        }
    }, [show]);

    function handleToggle(field) {
        if (field === "blocked") {
            setBlocked(!blocked);
        }
    }

    async function submitAvailability() {
        if (selectedDates.blocked === blocked) {
            onHide();
            return;
        }
        try {
            setShowSpinner({blocked: true});
            const url = "/setAvailabilityRange";
            const {startDate, endDate, listingID} = selectedDates;
            const dateRange = {
                startDate: zonedTimeToUtc(startDate, listing.airbnbTimeZone),
                endDate: zonedTimeToUtc(endDate, listing.airbnbTimeZone)
            };
            const fields = {
                listingID,
                blocked,
                dateRange
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
        } catch (error) {
            setShowSpinner({blocked: false});
            console.error("error", error);
        }
    }
    let selectedDatesFormatted = "";
    if (selectedDates.startDate && selectedDates.endDate) {
        selectedDatesFormatted = format(selectedDates.startDate, "MMM do");
        if (!isSameDay(selectedDates.startDate, selectedDates.endDate)) {
            if (isSameMonth(selectedDates.startDate, selectedDates.endDate)) {
                selectedDatesFormatted += ` - ${format(selectedDates.endDate, "do")}`;
            } else {
                selectedDatesFormatted += ` - ${format(selectedDates.endDate, "MMM do")}`;
            }
        }
    }
    const availabilityOverlay = (
        <Tooltip>This will change the availability of your listing.</Tooltip>
    );
    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{selectedDatesFormatted}</Modal.Title>
            </Modal.Header>

            <Modal.Body className="pd-20 pd-sm-40">
                <div className="form-group">
                    <label
                        htmlFor="minPrice"
                        className="az-content-label tx-11 tx-medium tx-gray-600"
                    >
                        Availability
                        <OverlayTrigger placement="top" overlay={availabilityOverlay}>
                            <FiHelpCircle className="text-muted ml-1" />
                        </OverlayTrigger>
                    </label>
                    <div className="custom-control custom-switch">
                        <input
                            type="checkbox"
                            className="custom-control-input"
                            id="blocked"
                            data-testid="blocked-checkbox"
                            checked={blocked === true}
                            onChange={() => {
                                handleToggle("blocked");
                            }}
                        />
                        <label className="custom-control-label" htmlFor="blocked">
                            {blocked && "Block"}
                            {!blocked && "Available"}
                        </label>
                    </div>
                </div>
                {errors.error && <div className="alert alert-danger">{errors.error}</div>}
            </Modal.Body>

            <Modal.Footer>
                <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary mg-l-10"
                    onClick={submitAvailability}
                >
                    {showSpinner.blocked && <FaCircleNotch className="fa-spin mr-1" />}
                    Save
                </button>
            </Modal.Footer>
        </Modal>
    );
}
ModalAvailability.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    selectedDates: selectedDatesType.isRequired,
    listing: listingType.isRequired
};

export default ModalAvailability;
