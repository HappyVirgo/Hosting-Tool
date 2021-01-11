import "react-day-picker/lib/style.css";

import {addDays, isSameDay} from "date-fns";
import PropTypes from "prop-types";
import React, {Component} from "react";
import DayPicker, {DateUtils} from "react-day-picker";

class DatePickerPricingRange extends Component {
    static getInitialState() {
        const startDate = new Date();
        const endDate = addDays(startDate, 7);
        return {
            startDate,
            endDate,
            enteredTo: endDate, // Keep track of the last day for mouseEnter.
            month: startDate,
            error: ""
        };
    }

    static isSelectingFirstDay(startDate, endDate, day) {
        const isBeforeFirstDay = startDate && DateUtils.isDayBefore(day, startDate);
        const isRangeSelected = startDate && endDate;
        return !startDate || isBeforeFirstDay || isRangeSelected;
    }

    constructor(props) {
        super(props);
        this.state = this.constructor.getInitialState();
        this.handleDayClick = this.handleDayClick.bind(this);
        this.handleDayMouseEnter = this.handleDayMouseEnter.bind(this);
    }

    UNSAFE_componentWillMount() {
        const {startDate, endDate, onSelectedDates} = this.props;
        if (startDate && endDate) {
            this.setState({
                startDate,
                endDate,
                enteredTo: endDate,
                month: startDate
            });
            onSelectedDates(startDate, endDate);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {startDate, endDate, error} = this.props;
        const nextStartDate = nextProps.startDate;
        const nextEndDate = nextProps.endDate;
        const nextError = nextProps.error;
        if (
            nextStartDate &&
            nextEndDate &&
            (!isSameDay(startDate, nextStartDate) || !isSameDay(endDate, nextEndDate))
        ) {
            this.setState({
                startDate: nextStartDate,
                endDate: nextEndDate,
                enteredTo: nextEndDate,
                month: nextStartDate,
                error: nextError
            });
            const {onSelectedDates} = this.props;
            onSelectedDates(nextStartDate, nextEndDate);
        }
        if (error !== nextError) {
            this.setState({
                error: nextError
            });
        }
    }

    handleDayClick(day) {
        const {startDate, endDate} = this.state;
        if (this.constructor.isSelectingFirstDay(startDate, endDate, day)) {
            this.setState({
                startDate: day,
                endDate: null,
                enteredTo: null,
                month: null
            });
        } else if (!DateUtils.isSameDay(startDate, day)) {
            // Don't let the user select the same start and end dates
            this.setState({
                endDate: day,
                enteredTo: day,
                month: null
            });
            const {onSelectedDates} = this.props;
            onSelectedDates(startDate, day);
        }
    }

    handleDayMouseEnter(day) {
        const {startDate, endDate} = this.state;
        if (!this.constructor.isSelectingFirstDay(startDate, endDate, day)) {
            this.setState({
                enteredTo: day
            });
        }
    }

    render() {
        const {startDate, enteredTo, month, error} = this.state;
        const modifiers = {start: startDate, end: enteredTo};
        const disabledDays = [{before: new Date()}, {before: startDate}];
        const selectedDays = [startDate, {from: startDate, to: enteredTo}];

        return (
            <div className="text-center">
                <DayPicker
                    className="Range"
                    initialMonth={month}
                    numberOfMonths={2}
                    selectedDays={selectedDays}
                    disabledDays={disabledDays}
                    modifiers={modifiers}
                    onDayClick={this.handleDayClick}
                    onDayMouseEnter={this.handleDayMouseEnter}
                />

                {error.specificDates && (
                    <div className="alert alert-danger">{error.specificDates}</div>
                )}
            </div>
        );
    }
}

DatePickerPricingRange.propTypes = {
    onSelectedDates: PropTypes.func.isRequired,
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    error: PropTypes.shape({
        specificDates: PropTypes.string
    })
};

DatePickerPricingRange.defaultProps = {
    startDate: null,
    endDate: null,
    error: {
        specificDates: ""
    }
};

export default DatePickerPricingRange;
