import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectPriceSource(props) {
    const {onSelectedOption, selectedValue, isDisabled, includeChannels} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const defaultOptions = [
        {
            value: "Amount",
            label: "Set Amount"
        },
        {
            value: "Airbnb Smart Prices",
            label: "Airbnb Smart Prices"
        }
    ];
    const [options, setOptions] = useState(defaultOptions);

    useEffect(() => {
        let newOptions = defaultOptions;
        if (includeChannels) {
            newOptions = [
                ...newOptions,
                ...[
                    {
                        value: "Airbnb",
                        label: "Airbnb"
                    },
                    {
                        value: "VRBO",
                        label: "VRBO"
                    }
                ]
            ];
        }
        let selectedOption = newOptions.find(option => {
            return option.value === selectedValue;
        });
        if (!selectedOption) {
            [selectedOption] = newOptions;
        }
        setOptions(newOptions);
        setSelectedOption(selectedOption);
    }, [selectedValue, includeChannels]);

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
            placeholder="Base Price..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectPriceSource.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    includeChannels: PropTypes.bool
};

SelectPriceSource.defaultProps = {
    isDisabled: false,
    selectedValue: "checkin",
    includeChannels: false
};

export default SelectPriceSource;
