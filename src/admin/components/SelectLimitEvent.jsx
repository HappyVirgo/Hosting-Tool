import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

function SelectLimitEvent(props) {
    const {isDisabled, selectedValue, onSelectedOption} = props;
    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        {
            value: "checkin",
            label: "Guest Checks-In"
        },
        {
            value: "checkout",
            label: "Guest Checks-Out"
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
            placeholder="Event..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectLimitEvent.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isDisabled: PropTypes.bool.isRequired
};

SelectLimitEvent.defaultProps = {
    selectedValue: "checkout"
};
export default SelectLimitEvent;
