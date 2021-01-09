import "../../../node_modules/rc-slider/assets/index.css";

import PropTypes from "prop-types";
import {Range} from "rc-slider";
import React, {Component} from "react";

export default class SliderFloatingPeriod extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        range: PropTypes.arrayOf(PropTypes.number)
    };

    static defaultProps = {
        range: [0, 30]
    };

    constructor(props) {
        super(props);
        this.state = {
            range: [0, 30]
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeStartDay = this.handleChangeStartDay.bind(this);
        this.handleChangeEndDay = this.handleChangeEndDay.bind(this);
    }

    UNSAFE_componentWillMount() {
        const {range} = this.props;
        if (range[1] > 365) {
            range[1] = 365;
        }
        this.setState({range});
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {range} = this.state;
        const nextRange = nextProps.range;
        if (
            (nextRange[0] === 0 || nextRange[0]) &&
            (nextRange[1] === 0 || nextRange[1]) &&
            (range[0] !== nextRange[0] || range[1] !== nextRange[1])
        ) {
            if (nextRange[1] > 365) {
                nextRange[1] = 365;
            }
            this.setState({range: nextRange});
            const {onChange} = this.props;
            onChange(nextRange);
        }
    }

    handleChange = range => {
        const {onChange} = this.props;
        const startDay = range[0];
        const endDay = range[1];
        if (startDay === 0 && startDay === endDay) {
            range[1] = 1;
        }
        onChange(range);
    };

    handleChangeStartDay = startDay => {
        startDay = parseInt(startDay, 10);
        if (isNaN(startDay) || startDay < 0) {
            startDay = 0;
        }
        if (startDay > 364) {
            startDay = 364;
        }
        const {range} = this.state;
        const endDay = range[1];
        if (endDay < startDay) {
            range[1] = startDay + 1;
        }
        range[0] = startDay;
        this.handleChange(range);
    };

    handleChangeEndDay = endDay => {
        endDay = parseInt(endDay, 10);
        if (isNaN(endDay) || endDay < 1) {
            endDay = 1;
        }
        if (endDay > 365) {
            endDay = 365;
        }
        const {range} = this.state;
        const startDay = range[0];
        if (startDay >= endDay) {
            range[0] = endDay - 1;
        }
        range[1] = endDay;
        this.handleChange(range);
    };

    render() {
        const {range} = this.state;
        const startDay = range[0];
        const endDay = range[1];
        return (
            <div className="row no-gutters">
                <div className="col-1">
                    <input
                        className="form-control text-center pd-l-5 pd-r-5"
                        type="number"
                        value={startDay}
                        onChange={event => {
                            this.handleChangeStartDay(event.target.value);
                        }}
                    />
                </div>
                <div className="col-10 d-flex align-items-center">
                    <Range
                        className="mg-r-15 mg-l-15"
                        min={0}
                        max={365}
                        value={range}
                        defaultValue={range}
                        onChange={range => {
                            this.handleChange(range);
                        }}
                    />
                </div>
                <div className="col-1">
                    <input
                        className="form-control text-center pd-l-5 pd-r-5"
                        type="number"
                        value={endDay}
                        onChange={event => {
                            this.handleChangeEndDay(event.target.value);
                        }}
                    />
                </div>

                <div className="col-12">
                    <div className="d-flex justify-content-between">
                        <div className="az-content-label tx-11 tx-medium tx-gray-600 mt-2">
                            {startDay === 0 && "Starting now"}
                            {startDay === 1 && `Starting in ${startDay} day`}
                            {startDay !== 0 && startDay !== 1 && `Starting in ${startDay} days`}
                        </div>
                        <div className="az-content-label tx-11 tx-medium tx-gray-600 mt-2">
                            {endDay === 1 && `Ending in ${endDay} day`}
                            {endDay !== 1 && `Ending in ${endDay} days`}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
