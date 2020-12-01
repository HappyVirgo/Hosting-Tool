import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

import Languages from "../config/languages";

function SelectLanguage(props) {
    const {languageValues, onSelectedOption} = props;

    const [selectedOption, setSelectedOption] = useState({value: "default", label: "Default"});
    const [options, setOptions] = useState([]);

    // useEffect(() => {
    //     const option = {value: "default", label: "Default"};
    //     const options = buildOptions(option, languageValues);
    //     setOptions(options);
    //     setSelectedOption(option);
    // }, []);

    useEffect(() => {
        const options = buildOptions(selectedOption, languageValues);
        const selectedOptionStillExists = options.some(language => {
            return selectedOption.value === language.value;
        });
        if (!selectedOptionStillExists) {
            setOptions(options);
            setSelectedOption(options[0]);
        } else {
            setOptions(options);
            setSelectedOption(selectedOption);
        }
    }, [languageValues]);

    function buildOptions(selectedOption, languageValues) {
        const options = Languages.filter(language => {
            return Object.keys(languageValues).indexOf(language.value) !== -1;
        });
        return options;
    }

    function handleChange(selectedOption) {
        setSelectedOption(selectedOption);
        onSelectedOption(selectedOption);
    }
    return (
        <div>
            <Select
                defaultValue={options[0]}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isClearable={false}
                isSearchable={false}
                className="react-select"
                classNamePrefix="react-select"
            />
        </div>
    );
}

SelectLanguage.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    languageValues: PropTypes.shape(
        Languages.reduce((result, language) => {
            result[language.value] = PropTypes.string;
            return result;
        }, {})
    ).isRequired
};

export default SelectLanguage;
