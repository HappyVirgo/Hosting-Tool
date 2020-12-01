import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

import CountryRegionData from "../../../node_modules/country-region-data/data.json";

function SelectCountry(props) {
    const {onSelectedOption, selectedValue, isDisabled} = props;

    const options = CountryRegionData.map(country => {
        return {
            value: country.countryShortCode,
            label: country.countryName
        };
    });

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
            placeholder="Countries"
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectCountry.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectCountry.defaultProps = {
    selectedValue: "US"
};

export default SelectCountry;
