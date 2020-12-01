import classNames from "classnames";
import {format, isSameDay, isSameMonth} from "date-fns";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle} from "react-icons/fi";

import {listingType, selectedDatesType} from "../types";

function SideBarPriceDetails(props) {
    const {onHide, listing, selectedDates} = props;

    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState({});
    const [blocked, setBlocked] = useState(false);
    useEffect(() => {
        setBlocked(false);
        showSpinner.blocked = false;
        setShowSpinner(showSpinner);
        if (selectedDates.blocked) {
            setBlocked(selectedDates.blocked);
        }
    }, [selectedDates.startDate, selectedDates.endDate]);

    function handleToggle(field) {
        if (field === "blocked") {
            setBlocked(!blocked);
        }
    }

    async function submitAvailability() {
        try {
            showSpinner.blocked = true;
            setShowSpinner(showSpinner);
            const url = "/setAvailabilityRange";

            const {startDate, endDate} = selectedDates;
            const dateRange = {startDate, endDate};
            const fields = {
                listingID: listing._id,
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
            showSpinner.blocked = false;
            setShowSpinner(showSpinner);
            console.error("error", error);
        }
    }

    const smartPriceOverlay = (
        <Tooltip>
            This is the price Airbnb would set your listing to if you turned on smart pricing. This
            is typically too low.
        </Tooltip>
    );
    const airbnbMinPriceOverlay = (
        <Tooltip>
            This minimum price is from Airbnb. You can change it in listing pricing settings in
            Airbnb or remove it by turning off Smart Pricing which won&apos;t effect Host Tools
            ability to use the data.
        </Tooltip>
    );
    const airbnbMaxPriceOverlay = (
        <Tooltip>
            This maximum price is from Airbnb. You can change it in listing pricing settings in
            Airbnb or remove it by turning off Smart Pricing which won&apos;t effect Host Tools
            ability to use the data.
        </Tooltip>
    );
    const availabilityOverlay = (
        <Tooltip>This will change the availability of your listing.</Tooltip>
    );
    // const priceOverlay = <Tooltip>.</Tooltip>;

    // const setPriceClasses = classNames("form-control", {
    //     "is-invalid": errors.setPrice
    // });
    const equations =
        blocked === false &&
        selectedDates &&
        selectedDates.appliedRules &&
        selectedDates.appliedRules.map(rule => {
            const priceClasses = classNames("mb-0", {
                "text-muted": !rule.changedPrice
            });
            const nameClasses = classNames({
                "text-muted": !rule.changedPrice
            });
            return (
                <tr key={rule.title + rule._id}>
                    <td colSpan="2">
                        <div className="row">
                            <div className="col-9 tx-medium tx-inverse text-truncate">
                                <span className={nameClasses}>{rule.title}</span>
                                {rule.title === "Airbnb Smart Price" && (
                                    <OverlayTrigger placement="top" overlay={smartPriceOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                )}
                                {rule.title === "Airbnb Minimum Listing Price" && (
                                    <OverlayTrigger placement="top" overlay={airbnbMinPriceOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                )}
                                {rule.title === "Airbnb Maximum Listing Price" && (
                                    <OverlayTrigger placement="top" overlay={airbnbMaxPriceOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                )}

                                <div className="tx-10 tx-light">{rule.equation}</div>
                            </div>
                            <div className="col-3 tx-right tx-medium tx-inverse d-flex justify-content-end align-items-center">
                                <h4 className={priceClasses}>
                                    {`${rule.currencySymbol}${rule.price}`}
                                </h4>
                            </div>
                        </div>
                    </td>
                </tr>
            );
        });

    let selectedDatesFormatted = "";
    if (selectedDates.startDate) {
        selectedDatesFormatted = format(selectedDates.startDate, "MMM do");
        if (selectedDates.endDate && !isSameDay(selectedDates.startDate, selectedDates.endDate)) {
            if (isSameMonth(selectedDates.startDate, selectedDates.endDate)) {
                selectedDatesFormatted += ` - ${format(selectedDates.endDate, "do")}`;
            } else {
                selectedDatesFormatted += ` - ${format(selectedDates.endDate, "MMM do")}`;
            }
        }
    }
    return (
        <div className="card">
            <div className="card-body">
                <div className="form-group">
                    <h5>{selectedDatesFormatted}</h5>
                </div>
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
                {/* {false && (
                    <div className="form-group">
                        <label
                            htmlFor="minPrice"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Set Price
                            <OverlayTrigger placement="top" overlay={priceOverlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        </label>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">{listing.currencySymbol}</span>
                            </div>
                            <input
                                id="setPrice"
                                className={setPriceClasses}
                                placeholder="Set Price..."
                                name="setPrice"
                                type="number"
                                value={setPrice}
                                onChange={event => {
                                    handleChange("setPrice", event.target.value);
                                }}
                                disabled={!selectedDates.airbnbAvailable}
                            />
                        </div>
                        {errors.setPrice && (
                            <div className="alert alert-danger">{errors.setPrice}</div>
                        )}
                    </div>
                )} */}
                {equations && (
                    <div className="row">
                        <div className="col-sm-6 d-flex align-items-center">
                            <div className="pricing-overview">
                                <div className="media">
                                    <div className="media-body">
                                        <label>Calculated</label>
                                        <h4>{selectedDates.priceFormatted}</h4>
                                        <span>PRICE</span>
                                    </div>
                                </div>
                                <div className="media">
                                    <div className="media-body">
                                        <label>Current</label>
                                        <h4>{selectedDates.currentPriceFormatted}</h4>
                                        <span>PRICE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {equations && (
                    <table className="table table-striped table-dashboard-two mg-b-0 price-details-table">
                        <thead>
                            <tr>
                                <th className="wd-lg-25p">Pricing Rule</th>
                                <th className="wd-lg-25p tx-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>{equations}</tbody>
                    </table>
                )}
                {errors.error && <div className="alert alert-danger">{errors.error}</div>}
            </div>
            <div className="d-flex justify-content-end card-footer">
                <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                    Close
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary mg-l-10"
                    onClick={submitAvailability}
                >
                    {showSpinner.blocked && <FaCircleNotch className="fa-spin mr-1" />}
                    Save
                </button>
            </div>
        </div>
    );
}
SideBarPriceDetails.propTypes = {
    onHide: PropTypes.func.isRequired,
    listing: listingType.isRequired,
    selectedDates: selectedDatesType.isRequired
};

export default SideBarPriceDetails;
