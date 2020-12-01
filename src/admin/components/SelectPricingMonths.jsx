import "../css/react-select.css";

import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import Select from "react-select";

function SelectPricingMonths(props) {
    const {selectedValues, onSelectedOption, error} = props;

    const [selectedOptions, setSelectedOptions] = useState(null);
    const options = [
        {
            value: "january",
            label: "January",
            order: 0
        },
        {
            value: "february",
            label: "February",
            order: 1
        },
        {
            value: "march",
            label: "March",
            order: 2
        },
        {
            value: "april",
            label: "April",
            order: 3
        },
        {
            value: "may",
            label: "May",
            order: 4
        },
        {
            value: "june",
            label: "June",
            order: 5
        },
        {
            value: "july",
            label: "July",
            order: 6
        },
        {
            value: "august",
            label: "August",
            order: 7
        },
        {
            value: "september",
            label: "September",
            order: 8
        },
        {
            value: "october",
            label: "October",
            order: 9
        },
        {
            value: "november",
            label: "November",
            order: 10
        },
        {
            value: "december",
            label: "December",
            order: 11
        }
    ];

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
        return selectedOptions;
    }

    function handleChange(selectedOptions, action) {
        if (action.action === "remove-value") {
            let monthsAsNumbers = [];
            if (selectedOptions) {
                monthsAsNumbers = selectedOptions.map(selectedOption => {
                    return selectedOption.order;
                });
            }
            const removedMonthAsNumber = action.removedValue.order;
            monthsAsNumbers.push(removedMonthAsNumber);
            monthsAsNumbers.sort((a, b) => {
                return a - b;
            });
            // Reorder the numbers so that 11, 12, 1, 2 are together
            if (
                monthsAsNumbers.length !== 12 &&
                monthsAsNumbers[0] === 0 && // 0 is January
                monthsAsNumbers[monthsAsNumbers.length - 1] === 11 // 11 is December
            ) {
                monthsAsNumbers.unshift(monthsAsNumbers.pop());
                while (monthsAsNumbers[monthsAsNumbers.length - 1] + 1 === monthsAsNumbers[0]) {
                    monthsAsNumbers.unshift(monthsAsNumbers.pop());
                }
            }
            // Find the where the removed month is
            const index = monthsAsNumbers.indexOf(removedMonthAsNumber);

            // Make sure it's not the first of last entry
            if (index !== 0 && index !== monthsAsNumbers.length - 1) {
                // Figure out which range is larger and remove the smaller one
                if (index < monthsAsNumbers.length - (index + 1)) {
                    // Top range is larger, remove bottom range
                    monthsAsNumbers = monthsAsNumbers.slice(0, index + 1);
                } else {
                    // Bottom range is larger, remove top range
                    monthsAsNumbers = monthsAsNumbers.slice(index);
                }
                // Remove the unwanted range
                selectedOptions = selectedOptions.filter(selectedOption => {
                    const optionMonthAsNumber = selectedOption.order;
                    const result = monthsAsNumbers.find(monthAsNumber => {
                        return monthAsNumber === optionMonthAsNumber;
                    });
                    return result === undefined;
                });
            }
        }
        selectedOptions.sort((a, b) => a.order - b.order);
        setSelectedOptions(selectedOptions);
        onSelectedOption(selectedOptions);
    }

    function handleDisableOption(option, selectedOptions) {
        if (selectedOptions && selectedOptions.length) {
            const isNeighboringMonth = selectedOptions.some(selectedOption => {
                let nextMonth = selectedOption.order + 1;
                if (nextMonth > 11) {
                    nextMonth = 0;
                }
                let previousMonth = selectedOption.order - 1;
                if (previousMonth < 0) {
                    previousMonth = 11;
                }
                return option.order === nextMonth || option.order === previousMonth;
            });
            return !isNeighboringMonth;
        }
        return false;
    }

    const selectClasses = classNames("react-select", {
        "is-invalid": error
    });

    return (
        <div>
            <Select
                isMulti
                closeMenuOnSelect={false}
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                isClearable={false}
                isSearchable={false}
                placeholder="Months..."
                className={selectClasses}
                classNamePrefix="react-select"
                isOptionDisabled={handleDisableOption}
            />
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
}

SelectPricingMonths.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    selectedValues: PropTypes.shape({
        january: PropTypes.bool,
        february: PropTypes.bool,
        march: PropTypes.bool,
        april: PropTypes.bool,
        may: PropTypes.bool,
        june: PropTypes.bool,
        july: PropTypes.bool,
        august: PropTypes.bool,
        september: PropTypes.bool,
        october: PropTypes.bool,
        november: PropTypes.bool,
        december: PropTypes.bool
    }),
    error: PropTypes.string
};

SelectPricingMonths.defaultProps = {
    selectedValues: {},
    error: ""
};

export default SelectPricingMonths;
