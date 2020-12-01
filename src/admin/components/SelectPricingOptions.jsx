import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectPricingOptions(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState({
        value: "fixedPrice",
        label: "Set Price"
    });
    const options = [
        {
            value: "fixedPrice",
            label: "Set Price"
        },
        {
            value: "minPrice",
            label: "Set Minimum Price"
        },
        {
            value: "maxPrice",
            label: "Set Maximum Price"
        },
        {
            value: "increaseByPrice",
            label: "Increase by Amount"
        },
        {
            value: "decreaseByPrice",
            label: "Decrease by Amount"
        },
        {
            value: "increaseByPercentage",
            label: "Increase by Percentage"
        },
        {
            value: "decreaseByPercentage",
            label: "Decrease by Percentage"
        },
        {
            value: "graduallyIncreaseByPrice",
            label: "Gradually Increase by Amount"
        },
        {
            value: "graduallyDecreaseByPrice",
            label: "Gradually Decrease by Amount"
        },
        {
            value: "graduallyDecreaseByPriceReverse",
            label: "Gradually Decrease by Amount Reverse"
        },
        {
            value: "graduallyIncreaseByPercentage",
            label: "Gradually Increase by Percentage"
        },
        {
            value: "graduallyDecreaseByPercentage",
            label: "Gradually Decrease by Percentage"
        },
        {
            value: "graduallyDecreaseByPercentageReverse",
            label: "Gradually Decrease by Percentage Reverse"
        },
        {
            value: "minNights",
            label: "Set Minimum Nights"
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

SelectPricingOptions.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

SelectPricingOptions.defaultProps = {
    isDisabled: false
};
export default SelectPricingOptions;
