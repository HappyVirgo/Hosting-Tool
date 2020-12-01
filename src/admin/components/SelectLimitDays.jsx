import "../css/react-select.css";

import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectLimitDays(props) {
    const {error, onSelectedOption, selectedValues, isDisabled, includeAllDays} = props;

    const [selectedOptions, setSelectedOptions] = useState(null);

    const daysOfTheWeek = [
        {
            value: "monday",
            label: "Monday",
            order: 0
        },
        {
            value: "tuesday",
            label: "Tuesday",
            order: 1
        },
        {
            value: "wednesday",
            label: "Wednesday",
            order: 2
        },
        {
            value: "thursday",
            label: "Thursday",
            order: 3
        },
        {
            value: "friday",
            label: "Friday",
            order: 4
        },
        {
            value: "saturday",
            label: "Saturday",
            order: 5
        },
        {
            value: "sunday",
            label: "Sunday",
            order: 6
        }
    ];

    const allDays = {
        value: "allDays",
        label: "Every Day",
        order: -1
    };
    const weekends = {
        value: "weekends",
        label: "Weekends (Fri, Sat)",
        order: 7
    };
    const weekdays = {
        value: "weekdays",
        label: "Weekdays (Sun, Mon, Tue, Wed, Thu)",
        order: 8
    };
    let options = daysOfTheWeek;
    if (includeAllDays) {
        options = [
            {label: "Groups", options: [allDays, weekends, weekdays]},
            {label: "Days of the week", options}
        ];
    }

    useEffect(() => {
        const selectedOptions = convertValuesToOptions(selectedValues);
        setSelectedOptions(selectedOptions);
    }, [selectedValues]);

    function convertValuesToOptions(values) {
        const selectedOptions = Object.keys(values).reduce((result, key) => {
            result.push(
                daysOfTheWeek.find(option => {
                    if (option.value === key) {
                        return true;
                    }
                    return false;
                })
            );
            return result;
        }, []);
        return selectedOptions;
    }

    function handleChange(selectedOptions, event) {
        if (event.option && event.option.value === "allDays") {
            selectedOptions = [allDays];
        } else if (event.option && event.option.value === "weekends") {
            selectedOptions = [weekends];
        } else if (event.option && event.option.value === "weekdays") {
            selectedOptions = [weekdays];
        } else {
            selectedOptions = selectedOptions.filter(selectedOption => {
                return (
                    selectedOption.value !== "allDays" &&
                    selectedOption.value !== "weekends" &&
                    selectedOption.value !== "weekdays"
                );
            });
        }
        selectedOptions.sort((a, b) => a.order - b.order);
        setSelectedOptions(selectedOptions);
        onSelectedOption(selectedOptions);
    }
    const selectClasses = classNames("react-select", {
        "is-invalid": error
    });
    return (
        <div>
            <Select
                isMulti
                closeMenuOnSelect={false}
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                isDisabled={isDisabled}
                isClearable={false}
                isSearchable={false}
                placeholder="Days of the week..."
                className={selectClasses}
                classNamePrefix="react-select"
            />
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
}
SelectLimitDays.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    selectedValues: PropTypes.shape({
        monday: PropTypes.bool,
        tuesday: PropTypes.bool,
        wednesday: PropTypes.bool,
        thursday: PropTypes.bool,
        friday: PropTypes.bool,
        saturday: PropTypes.bool,
        sunday: PropTypes.bool
    }),
    error: PropTypes.string,
    isDisabled: PropTypes.bool,
    includeAllDays: PropTypes.bool.isRequired
};

SelectLimitDays.defaultProps = {
    selectedValues: {},
    error: "",
    isDisabled: false
};

export default SelectLimitDays;
