import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

function SelectTime(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState(null);

    useEffect(() => {
        if (isDisabled) {
            const selectedOption = {
                value: "-1",
                text: "Instantly"
            };
            const options = [selectedOption];
            setSelectedOption(selectedOption);
            setOptions(options);
        } else {
            const options = [];
            let i = 0;
            while (i < 24) {
                let period = "AM";
                if (i > 11) {
                    period = "PM";
                }
                let timeNumber = i;
                if (i === 0) {
                    timeNumber = 12;
                } else if (i > 12) {
                    timeNumber = i - 12;
                }
                options.push({
                    value: i,
                    label: `At ${timeNumber}${period}`
                });
                i += 1;
            }
            const selectedOption = options.find(option => {
                return option.value === selectedValue;
            });
            setOptions(options);
            setSelectedOption(selectedOption);
        }
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
            placeholder="Time..."
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectTime.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectTime.defaultProps = {
    isDisabled: false,
    selectedValue: 17
};

export default SelectTime;
