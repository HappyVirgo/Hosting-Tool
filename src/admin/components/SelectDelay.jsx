import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectDelay(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState([
        {
            value: 0,
            label: "Within 5 Minutes"
        }
    ]);

    useEffect(() => {
        const options = [
            {
                value: 0,
                label: "Within 5 Minutes"
            }
        ];
        for (let j = 5; j < 20; j += 1) {
            let unit = "Minutes";
            if (j === 1) {
                unit = "Minute";
            }
            options.push({
                value: j,
                label: `${j} ${unit} After`
            });
        }
        for (let k = 2; k <= 12; k += 1) {
            options.push({
                value: k * 10,
                label: `${k * 10} Minutes After`
            });
        }
        setOptions(options);
    }, []);

    useEffect(() => {
        let selectedOption = options.find(option => {
            return option.value === selectedValue;
        });
        if (!selectedOption) {
            [selectedOption] = options;
        }
        setSelectedOption(selectedOption);
    }, [selectedValue, options]);

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
            placeholder="Delay..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectDelay.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectDelay.defaultProps = {
    selectedValue: 0
};

export default SelectDelay;
