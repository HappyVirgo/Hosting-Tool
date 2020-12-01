import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select, {components} from "react-select";

import augustIcon from "../img/august-icon.svg";

function SelectLock(props) {
    const {selectedValue, options, onSelectedOption, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (!selectedOption || !selectedOption.value || selectedOption.value !== selectedValue) {
            const selectedOption = options.find(option => {
                return option.value === selectedValue;
            });
            setSelectedOption(selectedOption);
        }
    }, [selectedValue]);

    function handleChange(selectedOption) {
        setSelectedOption(false);
        onSelectedOption(selectedOption);
    }

    return (
        <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            isDisabled={isDisabled}
            isClearable={false}
            isSearchable
            placeholder="Locks..."
            components={{Option}}
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

const Option = ({children, ...props}) => {
    const icon = augustIcon;
    return (
        <components.Option {...props}>
            <img src={icon} className="icon buttonHeight mg-r-5" />
            <div className="text-truncate">{children}</div>
        </components.Option>
    );
};

SelectLock.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

SelectLock.defaultProps = {
    isDisabled: false,
    selectedValue: ""
};

export default SelectLock;
