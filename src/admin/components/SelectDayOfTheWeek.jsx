import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

function SelectDayOfTheWeek(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        {
            value: "monday",
            label: "On Monday"
        },
        {
            value: "tuesday",
            label: "On Tuesday"
        },
        {
            value: "wednesday",
            label: "On Wednesday"
        },
        {
            value: "thursday",
            label: "On Thursday"
        },
        {
            value: "friday",
            label: "On Friday"
        },
        {
            value: "saturday",
            label: "On Saturday"
        },
        {
            value: "sunday",
            label: "On Sunday"
        }
    ];

    useEffect(() => {
        const selectedOption = options.find(option => {
            return option.value === selectedValue;
        });
        setSelectedOption(selectedOption);
    }, [selectedValue]);

    function handleChange(selectedOption) {
        setSelectedOption(selectedOption);
        onSelectedOption(selectedOption);
    }

    return (
        <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            isDisabled={isDisabled}
            isClearable={false}
            isSearchable={false}
            placeholder="Day of the week..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectDayOfTheWeek.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectDayOfTheWeek.defaultProps = {
    isDisabled: false,
    selectedValue: "monday"
};

export default SelectDayOfTheWeek;
