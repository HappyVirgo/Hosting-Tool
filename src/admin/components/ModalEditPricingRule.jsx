import classNames from "classnames";
import {format} from "date-fns";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle} from "react-icons/fi";

import {listingType, pricingRuleType} from "../types";

import SelectLimitDays from "./SelectLimitDays";
import DatePickerPricingRange from "./DatePickerPricingRange";
import SelectPricingDays from "./SelectPricingDays";
import SelectChannels from "./SelectChannels";
import SelectPricingMonths from "./SelectPricingMonths";
import SelectPricingOptions from "./SelectPricingOptions";
import SelectPricingTemplates from "./SelectPricingTemplates";
import SelectRuleTypes from "./SelectRuleTypes";
import SliderFloatingPeriod from "./SliderFloatingPeriod";

function ModalEditPricingRule(props) {
    const {show, onHide, airbnbUserID, airbnbListingID, listing} = props;

    const defaultPricingRule = {
        floatingPeriodStartDay: 10,
        floatingPeriodLength: 46,
        amount: "",
        event: null,
        scale: "fixedPrice",
        channel: "all",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        }
    };

    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState(false);
    const [pricingRules, setPricingRules] = useState([]);
    const [pricingRule, setPricingRule] = useState(defaultPricingRule);
    const [template, setTemplate] = useState("custom");
    const [isNewRule, setIsNewRule] = useState(true);
    const [amountUnit, setAmountUnit] = useState("$");

    useEffect(() => {
        getPricingRules();
        let isNewRule = true;
        let newPricingRule = {...props.pricingRule};
        if (newPricingRule._id) {
            isNewRule = false;
            cleanUpPricingRule(newPricingRule);
        } else {
            newPricingRule = defaultPricingRule;
            setPricingRule(newPricingRule);
        }
        setIsNewRule(isNewRule);
        setShowSpinner(false);
        setErrors({});
    }, [show]);

    async function getPricingRules() {
        try {
            const url = "/getPricingRules";
            const response = await fetch(url);
            const pricingRules = await response.json();
            if (response.ok) {
                setPricingRules(pricingRules);
            } else {
                console.error("response", response);
                window.location = "/admin";
            }
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    function handleChange(field, value) {
        const {scale} = pricingRule;
        const newPricingRule = {};
        // Don't allow orphanPeriodLength to be less than 0
        if (field === "orphanPeriodLength" && value < 0) {
            newPricingRule[field] = 0;
            // Don't allow amount to be less than 0 when selecting min nights
        } else if (field === "amount" && value < 0 && scale === "minNights") {
            newPricingRule[field] = 0;
            // Don't allow amount to be less than 0
        } else if (field === "amount" && value < 0) {
            newPricingRule[field] = 0;
        } else {
            newPricingRule[field] = value;
        }
        setPricingRule(pricingRule => {
            return {...pricingRule, ...newPricingRule};
        });
    }

    async function handleSubmit() {
        try {
            await cleanUpPricingRule();
            if (validateForm()) {
                setShowSpinner(true);
                const url = "/addPricingRule";
                pricingRule.airbnbUserID = airbnbUserID;
                pricingRule.airbnbListingID = airbnbListingID;
                pricingRule.title = titlePricingRule();
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pricingRule)
                });
                if (response.ok) {
                    onHide(true);
                } else if (response.status === 400) {
                    const data = await response.json();
                    setErrors(data);
                    setShowSpinner(false);
                } else {
                    console.error("response", response);
                    window.location = "/admin";
                }
                // Don't hide the spinner here, hide it on load
                // That way it's visible until the modal closes
                // setShowSpinner(false);
            }
        } catch (error) {
            setShowSpinner(false);
            console.error("error", error);
        }
    }

    function validateForm() {
        const errors = {};
        let formIsValid = true;
        // title
        // if (!pricingRule.title) {
        //     formIsValid = false;
        //     errors.title = "Missing message rule title.";
        // }
        if (!pricingRule.amount) {
            formIsValid = false;
            errors.amount = "Amount is missing a value.";
        } else if (pricingRule.amount < 0) {
            formIsValid = false;
            errors.amount = "Amount must be greater than 0.";
        }
        if (!pricingRule.event) {
            formIsValid = false;
            errors.event = "Please select a rule type.";
        }
        if (pricingRule.event === "orphanPeriod") {
            if (!pricingRule.orphanPeriodLength) {
                formIsValid = false;
                errors.orphanPeriodLength = "Orphan Period is missing a value.";
            } else if (pricingRule.orphanPeriodLength < 0) {
                formIsValid = false;
                errors.orphanPeriodLength = "Orphan Period must be greater than 0.";
            }
        }
        if (pricingRule.event === "specificDates") {
            if (!pricingRule.specificDatesStartDate) {
                formIsValid = false;
                errors.specificDates = "Please select a start date on the calendar.";
            } else if (!pricingRule.specificDatesEndDate) {
                formIsValid = false;
                errors.specificDates = "Please select a end date on the calendar.";
            }
        }
        if (pricingRule.event === "months") {
            if (Object.keys(pricingRule.months).length === 0) {
                formIsValid = false;
                errors.months = "Please select at least one month.";
            }
        }

        //     {!from && !to && "Please select the first day."}
        //     {from && !to && "Please select the last day."}
        //     {from &&
        //         to &&
        //         `Selected from ${from.toLocaleDateString()} to
        // ${to.toLocaleDateString()}`}

        setErrors(errors);
        return formIsValid;
    }

    async function cleanUpPricingRule(newPricingRule = pricingRule) {
        try {
            // Remove values that are set when saving the rule
            delete newPricingRule.airbnbListingID;
            delete newPricingRule.accountID;
            delete newPricingRule.listingID;
            delete newPricingRule.createdAt;
            delete newPricingRule.updatedAt;
            delete newPricingRule.__v;
            if (
                newPricingRule.event === "specificDates" &&
                !(newPricingRule.specificDatesStartDate instanceof Date)
            ) {
                newPricingRule.specificDatesStartDate = new Date(
                    newPricingRule.specificDatesStartDate
                );
            }
            if (
                newPricingRule.event === "specificDates" &&
                !(newPricingRule.specificDatesEndDate instanceof Date)
            ) {
                newPricingRule.specificDatesEndDate = new Date(newPricingRule.specificDatesEndDate);
            }

            const {limitDays} = newPricingRule;
            if (!limitDays) {
                newPricingRule.limitDays = {
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true
                };
            }
            setPricingRule(newPricingRule);
        } catch (error) {
            console.error("error: ", error);
            throw error;
        }
    }

    function titlePricingRule() {
        const {currencySymbol} = listing;
        let title;
        let {amount} = pricingRule;
        const {
            scale,
            channel,
            event,
            floatingPeriodStartDay,
            floatingPeriodLength,
            orphanPeriodLength,
            specificDatesStartDate,
            specificDatesEndDate,
            months,
            limitDays
        } = pricingRule;
        const scaleLowerCase = scale.toLowerCase();
        if (scaleLowerCase.search("percentage") >= 0) {
            amount += "%";
            if (scaleLowerCase.search("gradual") >= 0) {
                amount += " gradually";
            }
            if (scaleLowerCase.search("increase") >= 0) {
                amount = `+${amount}`;
            } else {
                amount = `-${amount}`;
            }
        } else if (scaleLowerCase.search("night") >= 0) {
            if (amount === 1) {
                amount = `Set booking length to a minimum of ${amount} day`;
            } else {
                amount = `Set booking length to a minimum of ${amount} days`;
            }
        } else {
            amount = `${currencySymbol}${amount}`;
            if (scaleLowerCase.search("gradual") >= 0) {
                amount += " gradually";
            }
            if (scale === "minPrice") {
                amount += " min";
            } else if (scale === "maxPrice") {
                amount += " max";
            } else if (scaleLowerCase.search("increase") >= 0 && scale !== "fixedPrice") {
                amount = `+${amount}`;
            } else if (scale !== "fixedPrice") {
                amount = `-${amount}`;
            }
        }

        switch (event) {
            case "floatingPeriod":
                if (floatingPeriodStartDay === 0) {
                    title = amount;
                } else {
                    title = `${amount} after ${floatingPeriodStartDay} days`;
                }
                if (floatingPeriodStartDay + floatingPeriodLength < 365) {
                    title = `${title} for ${floatingPeriodLength} days`;
                }
                break;
            case "orphanPeriod":
                if (orphanPeriodLength === 1) {
                    title = `${amount} for orphan periods of ${orphanPeriodLength} day or less`;
                } else {
                    title = `${amount} for orphan periods of ${orphanPeriodLength} days or less`;
                }
                break;
            case "specificDates":
                title = `${amount} from ${format(
                    specificDatesStartDate,
                    "eee, MMM do yyyy"
                )} to ${format(specificDatesEndDate, "eee, MMM do yyyy")}`;
                break;
            case "months": {
                const monthsList = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
                ];
                let index = 0;
                let startingMonth = "";
                while (startingMonth === "" && index >= 0 && index <= 11) {
                    if (months[monthsList[index].toLowerCase()]) {
                        startingMonth = monthsList[index];
                    }
                    index += 1;
                }
                index = 11;
                let endingMonth = "";
                while (endingMonth === "" && index >= 0 && index <= 11) {
                    if (months[monthsList[index].toLowerCase()]) {
                        endingMonth = monthsList[index];
                    }
                    index -= 1;
                }
                if (startingMonth === endingMonth) {
                    title = `${amount} for the month of ${startingMonth}`;
                } else {
                    title = `${amount} from ${startingMonth} thru ${endingMonth}`;
                }
                break;
            }
            default:
                break;
        }
        // Days
        let limitDaysFormatted = Object.keys(limitDays).reduce((result, day) => {
            if (limitDays[day]) {
                result.push(day.charAt(0).toUpperCase() + day.substring(1, 2));
            }
            return result;
        }, []);
        limitDaysFormatted = limitDaysFormatted.join(", ");
        title += ` (${limitDaysFormatted})`;

        if (channel && channel !== "all") {
            if (channel === "HomeAway") {
                title = `VRBO: ${title}`;
            } else {
                title = `${channel}: ${title}`;
            }
        }
        return title;
    }

    async function handleTemplateChange(template) {
        const newPricingRule = Object.assign(JSON.parse(JSON.stringify(pricingRule)), template);
        await cleanUpPricingRule(newPricingRule);
        // await handleSelectedOption("event", newPricingRule.event);
    }

    async function handleSelectedOption(field, option) {
        try {
            const newPricingRule = {};
            if (field === "months") {
                newPricingRule[field] = option.reduce((result, opt) => {
                    result[opt.value] = true;
                    return result;
                }, {});
            } else if (field === "limitDays") {
                newPricingRule[field] = option.reduce((result, opt) => {
                    if (opt.value === "weekends") {
                        result = {
                            friday: true,
                            saturday: true
                        };
                    } else if (opt.value === "weekdays") {
                        result = {
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            sunday: true
                        };
                    } else if (opt.value === "allDays") {
                        result = {
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true,
                            sunday: true
                        };
                    } else {
                        result[opt.value] = true;
                    }
                    return result;
                }, {});
            } else {
                newPricingRule[`${field}Formatted`] = option.label.toLowerCase();
                newPricingRule[field] = option.value;
            }
            if (field === "scale") {
                const {currencySymbol} = listing;
                let amountUnit = "%";
                if (option.value.search("Price") >= 0) {
                    amountUnit = currencySymbol;
                } else if (option.value.search("Night") >= 0) {
                    amountUnit = "days";
                }
                setAmountUnit(amountUnit);
            }
            setPricingRule(pricingRule => {
                return {...pricingRule, ...newPricingRule};
            });
            setTemplate("custom");
        } catch (error) {
            console.error("error: ", error);
        }
    }

    let title = "Edit Pricing Rule";
    if (isNewRule) {
        title = "Add New Pricing Rule";
    }

    const templatesOverlay = (
        <Tooltip>
            Use one of the pricing templates or select from one of your existing pricing rules to
            copy the details.
        </Tooltip>
    );

    const floatingPeriodOverlay = (
        <Tooltip>
            A floating window rule&apos;s start and end dates are calculated using a number of days
            from the current date. The window moves every day as it&apos;s always a number of days
            from today. This feature is often used for reducing prices as the dates get closer.
        </Tooltip>
    );

    const orphanPeriodLengthOverlay = (
        <Tooltip>
            An orphan period is the period of time between two bookings. This feature is often used
            to reduce pricing when there are only a few days between two bookings.
        </Tooltip>
    );

    const limitDaysOverlay = <Tooltip>Limit the days you want to apply the rule to.</Tooltip>;

    const amountClasses = classNames("form-control", {
        "is-invalid": errors.amount
    });

    const orphanPeriodLengthClasses = classNames("form-control", {
        "is-invalid": errors.orphanPeriod
    });
    return (
        <Modal show={show} onHide={onHide} size="lg">
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="pd-20 pd-sm-40">
                    <div className="form-group">
                        <label
                            htmlFor="templates"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Pricing Templates
                            <OverlayTrigger placement="top" overlay={templatesOverlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        </label>
                        <SelectPricingTemplates
                            id="templates"
                            selectedValue={template}
                            pricingRules={pricingRules}
                            onSelectedTemplate={template => {
                                handleTemplateChange(template);
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label
                            htmlFor="event"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Rule Type
                        </label>
                        <SelectRuleTypes
                            id="event"
                            selectedValue={pricingRule.event}
                            onSelectedOption={option => {
                                handleSelectedOption("event", option);
                            }}
                        />
                        {errors.event && <div className="alert alert-danger">{errors.event}</div>}
                    </div>
                    {pricingRule.event === "floatingPeriod" && (
                        <div className="form-group">
                            <label
                                htmlFor="floatingPeriod"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Floating Window
                                <OverlayTrigger placement="top" overlay={floatingPeriodOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <SliderFloatingPeriod
                                id="floatingPeriod"
                                range={[
                                    pricingRule.floatingPeriodStartDay,
                                    pricingRule.floatingPeriodStartDay +
                                        pricingRule.floatingPeriodLength
                                ]}
                                onChange={range => {
                                    // console.log("onChange range", range);
                                    const newPricingRule = {};
                                    [newPricingRule.floatingPeriodStartDay] = range;
                                    newPricingRule.floatingPeriodLength = range[1] - range[0];
                                    setPricingRule(pricingRule => {
                                        return {...pricingRule, ...newPricingRule};
                                    });
                                }}
                            />
                        </div>
                    )}
                    {pricingRule.event === "orphanPeriod" && (
                        <div className="form-group">
                            <label
                                htmlFor="orphanPeriodLength"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Orphan Period
                                <OverlayTrigger placement="top" overlay={orphanPeriodLengthOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <div className="input-group">
                                <input
                                    id="orphanPeriodLength"
                                    className={orphanPeriodLengthClasses}
                                    placeholder="Orphan Period Length..."
                                    name="orphanPeriodLength"
                                    type="number"
                                    value={pricingRule.orphanPeriodLength}
                                    onChange={event => {
                                        handleChange("orphanPeriodLength", event.target.value);
                                    }}
                                    required
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">
                                        days
                                    </span>
                                </div>
                            </div>
                            {errors.orphanPeriodLength && (
                                <div className="alert alert-danger">
                                    {errors.orphanPeriodLength}
                                </div>
                            )}
                        </div>
                    )}
                    {pricingRule.event === "specificDates" && (
                        <div className="form-group">
                            <label
                                htmlFor="specificDates"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Date Range
                            </label>
                            <DatePickerPricingRange
                                onSelectedDates={(startDate, endDate) => {
                                    const newPricingRule = {};
                                    newPricingRule.specificDatesStartDate = startDate;
                                    newPricingRule.specificDatesEndDate = endDate;
                                    setPricingRule(pricingRule => {
                                        return {...pricingRule, ...newPricingRule};
                                    });
                                }}
                                startDate={pricingRule.specificDatesStartDate}
                                endDate={pricingRule.specificDatesEndDate}
                            />
                        </div>
                    )}
                    {pricingRule.event === "months" && (
                        <div className="form-group">
                            <label
                                htmlFor="months"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Months
                            </label>
                            <SelectPricingMonths
                                id="months"
                                selectedValues={pricingRule.months}
                                onSelectedOption={option => {
                                    handleSelectedOption("months", option);
                                }}
                                error={errors.months}
                            />
                        </div>
                    )}
                    {pricingRule.scale === "minNights" && (
                        <div className="alert alert-warning">
                            Warning: Using the minimum night feature will overwrite all existing
                            minimum night calendar rules that exist on Airbnb for this listing.
                        </div>
                    )}
                    <div className="row">
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label
                                    htmlFor="scale"
                                    className="az-content-label tx-11 tx-medium tx-gray-600"
                                >
                                    Options
                                </label>
                                <SelectPricingOptions
                                    id="scale"
                                    selectedValue={pricingRule.scale}
                                    onSelectedOption={option => {
                                        handleSelectedOption("scale", option);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label
                                    htmlFor="amount"
                                    className="az-content-label tx-11 tx-medium tx-gray-600"
                                >
                                    Amount
                                </label>
                                <div className="input-group">
                                    {amountUnit !== "days" && (
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">{amountUnit}</span>
                                        </div>
                                    )}
                                    <input
                                        id="amount"
                                        className={amountClasses}
                                        placeholder="Amount..."
                                        name="amount"
                                        type="number"
                                        value={pricingRule.amount}
                                        onChange={event => {
                                            let value = parseInt(event.target.value, 10);
                                            if (isNaN(value)) {
                                                value = "";
                                            }
                                            handleChange("amount", value);
                                        }}
                                        required
                                    />
                                    {amountUnit === "days" && (
                                        <div className="input-group-append">
                                            <span className="input-group-text">{amountUnit}</span>
                                        </div>
                                    )}
                                </div>
                                {errors.amount && (
                                    <div className="alert alert-danger">{errors.amount}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label
                                    htmlFor="channel"
                                    className="az-content-label tx-11 tx-medium tx-gray-600"
                                >
                                    Channels
                                </label>
                                <SelectChannels
                                    id="channel"
                                    selectedValue={pricingRule.channel}
                                    onSelectedOption={option => {
                                        handleSelectedOption("channel", option);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="form-group">
                                <label
                                    htmlFor="limitDays"
                                    className="az-content-label tx-11 tx-medium tx-gray-600"
                                >
                                    Days of the week
                                    <OverlayTrigger placement="top" overlay={limitDaysOverlay}>
                                        <FiHelpCircle className="text-muted ml-1" />
                                    </OverlayTrigger>
                                </label>
                                <SelectLimitDays
                                    id="limitDays"
                                    selectedValues={pricingRule.limitDays}
                                    onSelectedOption={option => {
                                        handleSelectedOption("limitDays", option);
                                    }}
                                    error={errors.limitDays}
                                    includeAllDays
                                />
                            </div>
                        </div>
                    </div>
                    {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                        Close
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleSubmit}
                    >
                        {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                        Save
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

ModalEditPricingRule.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    airbnbUserID: PropTypes.string.isRequired,
    airbnbListingID: PropTypes.string,
    listing: listingType.isRequired,
    pricingRule: pricingRuleType.isRequired
};
ModalEditPricingRule.defaultProps = {
    airbnbListingID: undefined
};
export default ModalEditPricingRule;
