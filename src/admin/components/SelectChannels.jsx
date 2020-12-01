import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

function SelectChannels(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        {
            value: "all",
            label: "All"
        },
        {
            value: "Airbnb",
            label: "Airbnb"
        },
        {
            value: "HomeAway",
            label: "VRBO"
        }
    ];

    useEffect(() => {
        let value = selectedValue;
        if (!value) {
            value = "all";
        }
        const selectedOption = options.find(option => {
            return option.value === value;
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
            placeholder="Channels..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectChannels.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

SelectChannels.defaultProps = {
    isDisabled: false
};

export default SelectChannels;
