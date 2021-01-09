import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select, {components} from "react-select";

import airbnbIcon from "../img/airbnb-icon.svg";
import homeawayIcon from "../img/homeaway-icon.svg";

function SelectListing(props) {
    const {selectedValue, options, onSelectedOption, isDisabled} = props;

    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (!selectedOption || selectedOption.value !== selectedValue) {
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
            placeholder="Listings..."
            components={{Option}}
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

const Option = ({children, ...props}) => {
    let icon = airbnbIcon;
    const {data} = props;
    if (data.source === "HomeAway") {
        icon = homeawayIcon;
    }
    return (
        <components.Option {...props}>
            <img alt="" src={icon} className="icon buttonHeight mg-r-5" />
            <div className="text-truncate">{children}</div>
        </components.Option>
    );
};

Option.propTypes = {
    children: PropTypes.string.isRequired,
    data: PropTypes.shape({
        source: PropTypes.string
    }).isRequired
};

SelectListing.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

SelectListing.defaultProps = {
    isDisabled: false,
    selectedValue: ""
};

export default SelectListing;
