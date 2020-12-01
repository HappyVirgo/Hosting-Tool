import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectEvent(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        {
            value: "checkin",
            label: "Check-In"
        },
        {
            value: "checkout",
            label: "Check-Out"
        },
        {
            value: "occupied",
            label: "When Occupied"
        },
        {
            value: "inquiry",
            label: "Booking Inquiry"
        },
        {
            value: "timedout",
            label: "Pre-approval Expired"
        },
        {
            value: "pending",
            label: "Booking Request"
        },
        {
            value: "booking",
            label: "Booking Confirmation"
        },
        {
            value: "doorUnlocked",
            label: "Door Was Unlocked"
        },
        {
            value: "checkinChanged",
            label: "Check-In Changed"
        },
        {
            value: "checkoutChanged",
            label: "Check-Out Changed"
        },
        {
            value: "numberOfGuestsChanged",
            label: "Number of Guests Changed"
        },
        {
            value: "cancelled",
            label: "Booking Cancelled"
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

SelectEvent.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectEvent.defaultProps = {
    isDisabled: false,
    selectedValue: "checkin"
};

export default SelectEvent;
