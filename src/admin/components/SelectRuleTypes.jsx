import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectRuleTypes(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;
    const options = [
        {
            value: "floatingPeriod",
            label: "Floating Window of Days"
        },
        {
            value: "orphanPeriod",
            label: "Orphan Periods Between Bookings"
        },
        {
            value: "specificDates",
            label: "Date Range"
        },
        {
            value: "months",
            label: "Months"
        }
    ];
    const [selectedOption, setSelectedOption] = useState(null);

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
            placeholder="Rule Type..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectRuleTypes.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectRuleTypes.defaultProps = {
    isDisabled: false,
    selectedValue: 0
};
export default SelectRuleTypes;
