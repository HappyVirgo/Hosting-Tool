import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectPricingDays(props) {
    const {isDisabled, selectedValue, onSelectedOption} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        {
            value: "weekends",
            label: "Only Weekends"
        },
        {
            value: "weekdays",
            label: "Only Weekdays"
        },
        {
            value: "all",
            label: "All Days"
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
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}
SelectPricingDays.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

SelectPricingDays.defaultProps = {
    isDisabled: false
};
export default SelectPricingDays;
