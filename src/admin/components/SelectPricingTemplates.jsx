import "../css/react-select.css";

import {startOfDay, addDays} from "date-fns";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

import {pricingRulesType} from "../types";

function SelectPricingTemplates(props) {
    const {pricingRules, selectedValue, isDisabled, onSelectedTemplate} = props;
    const defaultOptions = [
        {
            value: "increase",
            label: "Increase Airbnb Smart Pricing by 20%",
            type: "Template"
        },
        {
            value: "decrease",
            label: "Decrease Airbnb Smart Pricing by $20",
            type: "Template"
        },
        {
            value: "orphan",
            label: "Decrease prices by 30% for orphan periods that are 2 days or less",
            type: "Template"
        },
        {
            value: "weekends",
            label: "Set prices on the weekends to $120",
            type: "Template"
        },
        {
            value: "lastMinAvailability",
            label: "Gradually decrease prices by 40% over the next 7 days",
            type: "Template"
        },
        {
            value: "minPrice",
            label: "Set minimum price to $120 for any day after 30 days",
            type: "Template"
        },
        {
            value: "specificDates",
            label: "Set a specific date range to $120",
            type: "Template"
        },
        {
            value: "custom",
            label: "Custom pricing rule",
            type: "Template"
        }
    ];
    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState([
        {
            label: "Templates",
            options: defaultOptions
        }
    ]);

    useEffect(() => {
        groupOptions(pricingRules);
    }, [pricingRules]);

    useEffect(() => {
        let selectedOption = options.find(group => {
            return group.options.find(option => {
                return option.value === selectedValue;
            });
        });
        if (!selectedOption) {
            selectedOption = null;
        }
        setSelectedOption(selectedOption);
    }, [selectedValue]);

    function groupOptions(pricingRules) {
        const groupBy = (xs, key) => {
            return xs.reduce((rv, x) => {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        const templates = pricingRules.reduce((result, rule, index, pricingRules) => {
            // ignore blocking pricing rules
            if (!rule.blocked) {
                result.push({
                    label: rule.title,
                    value: rule._id,
                    type: rule.type
                });
            }
            return result;
        }, []);
        const groupedTemplates = groupBy(templates, "type");
        const newOptions = [
            {
                label: "Templates",
                options: defaultOptions
            }
        ];

        const keys = Object.keys(groupedTemplates);
        keys.reverse();
        for (const key of keys) {
            newOptions.push({
                label: key,
                options: groupedTemplates[key]
            });
        }
        setOptions(newOptions);
    }

    function handleChange(selectedOption) {
        setSelectedOption(selectedOption);
        const template = selectTemplate(selectedOption.value);
        onSelectedTemplate(template);
    }

    function selectTemplate(templateName) {
        let template = pricingRules.find(pricingRule => {
            return pricingRule._id === templateName;
        });
        if (template) {
            delete template._id;
        } else {
            switch (templateName) {
                case "increase":
                    template = {
                        event: "floatingPeriod",
                        amount: 20,
                        scale: "increaseByPercentage",
                        limitDays: {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        },
                        floatingPeriodStartDay: 0,
                        floatingPeriodLength: 365
                        // orphanPeriodLength: 2,
                        // specificDatesStartDate: moment().startOf('day').toDate(),
                        // specificDatesEndDate: moment().add(7, 'd').startOf('day').toDate(),
                    };
                    break;
                case "decrease":
                    template = {
                        event: "floatingPeriod",
                        amount: 20,
                        scale: "decreaseByPrice",
                        limitDays: {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        },
                        floatingPeriodStartDay: 0,
                        floatingPeriodLength: 365
                        // orphanPeriodLength: 2,
                        // specificDatesStartDate: moment().startOf('day').toDate(),
                        // specificDatesEndDate: moment().add(7, 'd').startOf('day').toDate()
                    };
                    break;
                case "orphan":
                    template = {
                        event: "orphanPeriod",
                        amount: 30,
                        scale: "decreaseByPercentage",
                        limitDays: {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        },
                        // floatingPeriodStartDay: 0,
                        // floatingPeriodLength: 365,
                        orphanPeriodLength: 2
                        // specificDatesStartDate: moment().startOf('day').toDate(),
                        // specificDatesEndDate: moment().add(7, 'd').startOf('day').toDate()
                    };
                    break;
                case "weekends":
                    template = {
                        event: "floatingPeriod",
                        amount: 120,
                        scale: "fixedPrice",
                        limitDays: {
                            friday: true,
                            saturday: true
                        },
                        floatingPeriodStartDay: 0,
                        floatingPeriodLength: 365
                        // orphanPeriodLength: 2,
                        // specificDatesStartDate: moment().startOf('day').toDate(),
                        // specificDatesEndDate: moment().add(7, 'd').startOf('day').toDate()
                    };
                    break;
                case "lastMinAvailability":
                    template = {
                        event: "floatingPeriod",
                        amount: 40,
                        scale: "graduallyDecreaseByPercentageReverse",
                        limitDays: {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        },
                        floatingPeriodStartDay: 0,
                        floatingPeriodLength: 7
                        // orphanPeriodLength: 2,
                        // specificDatesStartDate: moment().startOf('day').toDate(),
                        // specificDatesEndDate: moment().add(7, 'd').startOf('day').toDate()
                    };
                    break;
                case "minPrice":
                case "custom":
                default:
                    template = {
                        event: "floatingPeriod",
                        amount: 120,
                        scale: "minPrice",
                        limitDays: {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        },
                        floatingPeriodStartDay: 30,
                        floatingPeriodLength: 335
                        // orphanPeriodLength: 2,
                        // specificDatesStartDate: moment().startOf('day').toDate(),
                        // specificDatesEndDate: moment().add(7, 'd').startOf('day').toDate()
                    };
                    break;
                case "specificDates":
                    template = {
                        event: "specificDates",
                        amount: 120,
                        scale: "fixedPrice",
                        limitDays: {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true
                        },
                        // floatingPeriodStartDay: 30,
                        // floatingPeriodLength: 365,
                        // orphanPeriodLength: 2,
                        specificDatesStartDate: startOfDay(new Date()),
                        specificDatesEndDate: startOfDay(addDays(new Date(), 7))
                    };
                    break;
            }
        }
        return template;
    }

    const formatGroupLabel = data => (
        <div className="az-content-label tx-12 tx-medium tx-gray-600">{data.label}</div>
    );

    return (
        <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            isDisabled={isDisabled}
            isSearchable
            placeholder="Templates..."
            formatGroupLabel={formatGroupLabel}
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectPricingTemplates.propTypes = {
    onSelectedTemplate: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    pricingRules: pricingRulesType.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectPricingTemplates.defaultProps = {
    isDisabled: false,
    selectedValue: ""
};
export default SelectPricingTemplates;
