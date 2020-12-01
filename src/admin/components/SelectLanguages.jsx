import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

import Languages from "../config/languages";

const styles = {
    multiValue: (base, state) => {
        return state.data.isFixed ? {...base, backgroundColor: "gray"} : base;
    },
    multiValueLabel: (base, state) => {
        return state.data.isFixed
            ? {...base, fontWeight: "bold", color: "white", paddingRight: 6}
            : base;
    },
    multiValueRemove: (base, state) => {
        return state.data.isFixed ? {...base, display: "none"} : base;
    }
};

function SelectLanguages(props) {
    const {isMulti, onSelectedOption, selectedValues, isDisabled} = props;

    const [selectedOptions, setSelectedOptions] = useState(null);
    const options = Languages;

    useEffect(() => {
        const selectedOptions = convertValuesToOptions(selectedValues);
        setSelectedOptions(selectedOptions);
    }, [selectedValues]);

    function convertValuesToOptions(values) {
        const selectedOptions = Object.keys(values).reduce((result, key) => {
            result.push(
                options.find(option => {
                    if (option.value === key) {
                        return true;
                    }
                    return false;
                })
            );
            return result;
        }, []);
        if (isMulti) {
            return selectedOptions;
        }
        return selectedOptions[0];
    }

    function handleChange(selectedOptions) {
        setSelectedOptions(selectedOptions);
        onSelectedOption(selectedOptions);
    }

    return (
        <div>
            <Select
                isMulti={isMulti}
                styles={styles}
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                isClearable={v => {
                    if (isMulti) {
                        return selectedOptions.some(v => !v.isFixed);
                    }
                }}
                isSearchable={false}
                placeholder={isMulti ? "Languages..." : "Language..."}
                className="react-select"
                classNamePrefix="react-select"
                isDisabled={isDisabled}
            />
        </div>
    );
}

SelectLanguages.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    selectedValues: PropTypes.shape(
        Languages.reduce((result, language) => {
            result[language.value] = PropTypes.string;
            return result;
        }, {})
    ),
    isMulti: PropTypes.bool,
    isDisabled: PropTypes.bool
};

SelectLanguages.defaultProps = {
    selectedValues: {},
    isMulti: true,
    isDisabled: false
};

export default SelectLanguages;
