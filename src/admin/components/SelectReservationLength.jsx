import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectReservationLength(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;
    const options = [];
    for (let i = -30; i <= 30; i += 1) {
        if (i === 1) {
            options.push({
                value: i,
                label: "Any Length"
            });
        } else if (i === -1) {
            options.push({
                value: i,
                label: "1 Night"
            });
        } else if (i !== 0) {
            let suffix = "More";
            if (i < 0) {
                suffix = "Less";
            }
            options.push({
                value: i,
                label: `${Math.abs(i)} Nights or ${suffix}`
            });
        }
    }
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
            placeholder="Reservation Length..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectReservationLength.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectReservationLength.defaultProps = {
    selectedValue: 1
};

export default SelectReservationLength;
