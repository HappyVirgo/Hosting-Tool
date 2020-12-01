import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

function SelectDay(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        {
            value: -14,
            label: "14 Days Before"
        },
        {
            value: -13,
            label: "13 Days Before"
        },
        {
            value: -12,
            label: "12 Days Before"
        },
        {
            value: -11,
            label: "11 Days Before"
        },
        {
            value: -10,
            label: "10 Days Before"
        },
        {
            value: -9,
            label: "9 Days Before"
        },
        {
            value: -8,
            label: "8 Days Before"
        },
        {
            value: -7,
            label: "7 Days Before"
        },
        {
            value: -6,
            label: "6 Days Before"
        },
        {
            value: -5,
            label: "5 Days Before"
        },
        {
            value: -4,
            label: "4 Days Before"
        },
        {
            value: -3,
            label: "3 Days Before"
        },
        {
            value: -2,
            label: "2 Days Before"
        },
        {
            value: -1,
            label: "1 Day Before"
        },
        {
            value: 0,
            label: "On the Day of"
        },
        {
            value: 1,
            label: "1 Day After"
        },
        {
            value: 2,
            label: "2 Days After"
        },
        {
            value: 3,
            label: "3 Days After"
        },
        {
            value: 4,
            label: "4 Days After"
        },
        {
            value: 5,
            label: "5 Days After"
        },
        {
            value: 6,
            label: "6 Days After"
        },
        {
            value: 7,
            label: "7 Days After"
        },
        {
            value: 8,
            label: "8 Days After"
        },
        {
            value: 9,
            label: "9 Days After"
        },
        {
            value: 10,
            label: "10 Days After"
        },
        {
            value: 11,
            label: "11 Days After"
        },
        {
            value: 12,
            label: "12 Days After"
        },
        {
            value: 13,
            label: "13 Days After"
        },
        {
            value: 14,
            label: "14 Days After"
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
            placeholder="Days..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectDay.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectDay.defaultProps = {
    selectedValue: 0
};

export default SelectDay;
