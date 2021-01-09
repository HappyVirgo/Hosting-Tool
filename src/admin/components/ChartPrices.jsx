import "../css/react-select.css";

import classNames from "classnames";
import {addDays, format, isAfter, isBefore, isSameDay, isSameMonth, subYears} from "date-fns";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Line} from "react-chartjs-2";
import {utcToZonedTime} from "date-fns-tz";

import {listingType, pricesType} from "../types";

class ChartPrices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prices: [],
            zoom: "year",
            minPrice: "---",
            maxPrice: "---",
            occupancy14Days: "---",
            occupancy30Days: "---"
        };
        this.handleZoomChange = this.handleZoomChange.bind(this);
    }

    UNSAFE_componentWillMount() {
        const newPrices = [];
        for (let i = 0; i < 365; i += 1) {
            newPrices.push({
                occupied: true,
                date: addDays(new Date(), i),
                Airbnb: {
                    price: 0
                },
                HomeAway: {
                    price: 0
                }
            });
        }
        this.setState({
            prices: newPrices
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {prices, listing, channel} = this.props;
        const nextPrices = nextProps.prices.map(price => {
            let {date, localDate} = price;
            if (typeof date === "string") {
                date = new Date(date);
                localDate = utcToZonedTime(date, listing.airbnbTimeZone);
            }
            return {...price, ...{date, localDate}};
        });
        if (JSON.stringify(prices) !== JSON.stringify(nextPrices)) {
            const today = utcToZonedTime(new Date(), listing.airbnbTimeZone);
            const fourteenDays = 14;
            const thirtyDays = 30;
            const fourteenDaysFromToday = addDays(today, 14);
            const availability14Day = nextPrices.filter((price, index) => {
                if (isBefore(price.date, today)) {
                    return false;
                }
                if (isBefore(price.date, fourteenDaysFromToday)) {
                    return !price.occupied;
                }
                return false;
            }).length;
            const thirtyDaysFromToday = addDays(today, thirtyDays);
            const availability30Day = nextPrices.filter((price, index) => {
                if (isBefore(price.date, today)) {
                    return false;
                }
                if (isBefore(price.date, thirtyDaysFromToday)) {
                    return !price.occupied;
                }
                return false;
            }).length;
            const minPrice =
                nextPrices[nextPrices.length - 1].currencySymbol +
                nextPrices.reduce((min, p) => {
                    if (isBefore(p.date, today)) {
                        return min;
                    }
                    if (p[channel] && p[channel].currentPrice < min) {
                        return p[channel].currentPrice;
                    }
                    return min;
                }, 10000000000000000000000);
            const maxPrice =
                nextPrices[nextPrices.length - 1].currencySymbol +
                nextPrices.reduce((max, p) => {
                    if (isBefore(p.date, today)) {
                        return max;
                    }
                    if (p[channel] && p[channel].currentPrice > max) {
                        return p[channel].currentPrice;
                    }
                    return max;
                }, 0);
            const occupancy14Days = `${(100 * (1 - availability14Day / fourteenDays)).toFixed(2)}%`;
            const occupancy30Days = `${(100 * (1 - availability30Day / thirtyDays)).toFixed(2)}%`;
            this.setState({
                prices: nextPrices,
                minPrice,
                maxPrice,
                occupancy14Days,
                occupancy30Days
            });
        }
    }

    handleZoomChange = zoom => {
        this.setState({zoom});
    };

    render() {
        const {zoom, minPrice, maxPrice, occupancy14Days, occupancy30Days} = this.state;
        const {currentDate, channel, channels} = this.props;
        const {prices} = this.state;
        const isFillerData = !prices[prices.length - 1].airbnbDate;

        if (prices.length === 0) {
            return false;
        }
        const {currencySymbol} = prices[prices.length - 1];
        const monthClasses = classNames("btn btn-xs btn-outline-dark", {
            active: zoom === "month"
        });
        const yearClasses = classNames("btn btn-xs btn-outline-dark", {
            active: zoom === "year"
        });
        let gridUnit = "month";
        if (zoom === "month") {
            // prices = prices.filter(price => {
            //     return isSameMonth(currentDate, parseISO(price.airbnbDate));
            // });
            gridUnit = "day";
        }
        const data = canvas => {
            const ctx = canvas.getContext("2d");
            const homeAwayGradient = ctx.createLinearGradient(0, 280, 0, 0);
            homeAwayGradient.addColorStop(0.3, "rgba(42, 110, 187, 0)");
            homeAwayGradient.addColorStop(1, "rgba(42, 110, 187, 0.3)");
            const currentAirbnbPricesGradient = ctx.createLinearGradient(0, 280, 0, 0);
            currentAirbnbPricesGradient.addColorStop(0.3, "rgba(255, 208, 209, 0)");
            currentAirbnbPricesGradient.addColorStop(1, "rgba(255, 208, 209, 0.3)");
            const currentHomeAwayPricesGradient = ctx.createLinearGradient(0, 280, 0, 0);
            currentHomeAwayPricesGradient.addColorStop(0.3, "rgba(202, 221, 243, 0)");
            currentHomeAwayPricesGradient.addColorStop(1, "rgba(202, 221, 243, 0.3)");
            const airbnbGradient = ctx.createLinearGradient(0, 280, 0, 0);
            airbnbGradient.addColorStop(0.3, "rgba(255, 90, 95, 0)");
            airbnbGradient.addColorStop(1, "rgba(255, 90, 95, 0.3)");
            const lastYearGradient = ctx.createLinearGradient(0, 280, 0, 0);
            lastYearGradient.addColorStop(0.3, "rgba(206, 212, 218, 0)");
            lastYearGradient.addColorStop(1, "rgba(206, 212, 218, 0.3)");

            let airbnbPrices = prices.reduce((result, price) => {
                const {localDate} = price;
                if (zoom === "month") {
                    if (!isSameMonth(currentDate, localDate)) {
                        return result;
                    }
                } else if (isBefore(localDate, currentDate) || isSameDay(currentDate, localDate)) {
                    return result;
                }
                if (!price.blocked && price.Airbnb) {
                    result.push(price.Airbnb.price);
                    return result;
                }
                result.push(0);
                return result;
            }, []);
            airbnbPrices = airbnbPrices.slice(0, 365);

            let homeAwayPrices = prices.reduce((result, price) => {
                const {localDate} = price;
                if (zoom === "month") {
                    if (!isSameMonth(currentDate, localDate)) {
                        return result;
                    }
                } else if (isBefore(localDate, currentDate) || isSameDay(currentDate, localDate)) {
                    return result;
                }
                if (!price.blocked && price.HomeAway) {
                    result.push(price.HomeAway.price);
                    return result;
                }
                result.push(0);
                return result;
            }, []);
            homeAwayPrices = homeAwayPrices.slice(0, 365);

            let lastYearAdjustedPrices = prices.reduce((result, price) => {
                const {localDate} = price;
                if (zoom === "month") {
                    if (!isSameMonth(subYears(currentDate, 1), localDate)) {
                        return result;
                    }
                } else if (isAfter(localDate, currentDate)) {
                    return result;
                }
                if (price.blocked && price[channel]) {
                    result.push(price[channel].currentPrice);
                    return result;
                }
                result.push(0);
                return result;
            }, []);
            lastYearAdjustedPrices = lastYearAdjustedPrices.slice(0, 365);

            let currentHomeAwayPrices = prices.reduce((result, price) => {
                const {localDate} = price;
                if (zoom === "month") {
                    if (!isSameMonth(currentDate, localDate)) {
                        return result;
                    }
                } else if (isBefore(localDate, currentDate) || isSameDay(currentDate, localDate)) {
                    return result;
                }
                if (
                    !price.blocked &&
                    price.HomeAway &&
                    price.HomeAway.currentPrice &&
                    price.HomeAway.currentPrice !== price.HomeAway.price
                ) {
                    result.push(price.HomeAway.currentPrice);
                    return result;
                }
                result.push(0);
                return result;
            }, []);
            currentHomeAwayPrices = currentHomeAwayPrices.slice(0, 365);

            let currentAirbnbPrices = prices.reduce((result, price) => {
                const {localDate} = price;
                if (zoom === "month") {
                    if (!isSameMonth(currentDate, localDate)) {
                        return result;
                    }
                } else if (isBefore(localDate, currentDate) || isSameDay(currentDate, localDate)) {
                    return result;
                }
                if (
                    !price.blocked &&
                    price.Airbnb &&
                    price.Airbnb.currentPrice &&
                    price.Airbnb.currentPrice !== price.Airbnb.price
                ) {
                    result.push(price.Airbnb.currentPrice);
                    return result;
                }
                result.push(0);
                return result;
            }, []);
            currentAirbnbPrices = currentAirbnbPrices.slice(0, 365);

            let labels = prices.reduce((result, price) => {
                const {localDate} = price;
                if (zoom === "month") {
                    if (!isSameMonth(currentDate, localDate)) {
                        return result;
                    }
                } else if (isBefore(localDate, currentDate) || isSameDay(currentDate, localDate)) {
                    return result;
                }
                result.push(localDate);
                return result;
            }, []);
            labels = labels.slice(0, 365);

            const result = {
                labels,
                // labels: [
                //     "Jan",
                //     "Feb",
                //     "Mar",
                //     "Apr",
                //     "May",
                //     "Jun",
                //     "July",
                //     "Aug",
                //     "Sep",
                //     "Oct",
                //     "Nov",
                //     "Dec"
                // ],
                datasets: []
            };
            if (!isFillerData) {
                if (channels.includes("Airbnb")) {
                    result.datasets.unshift({
                        label: "Airbnb's Current Price",
                        data: currentAirbnbPrices,
                        borderColor: "#ffd0d1",
                        borderWidth: 1,
                        backgroundColor: currentAirbnbPricesGradient,
                        steppedLine: "middle"
                    });
                    result.datasets.unshift({
                        label: "Airbnb Price",
                        data: airbnbPrices,
                        borderColor: "#FF5A5F",
                        borderWidth: channel === "Airbnb" ? 2 : 1,
                        backgroundColor: channel === "Airbnb" ? airbnbGradient : "transparent",
                        steppedLine: "middle",
                        order: channel === "Airbnb" ? 1 : 2
                    });
                }
                if (channels.includes("HomeAway")) {
                    result.datasets.unshift({
                        label: "VRBO's Current Price",
                        data: currentHomeAwayPrices,
                        borderColor: "#caddf3",
                        borderWidth: 1,
                        backgroundColor: currentHomeAwayPricesGradient,
                        steppedLine: "middle"
                    });
                    result.datasets.unshift({
                        label: "VRBO Price",
                        data: homeAwayPrices,
                        borderColor: "#2A6EBB",
                        borderWidth: channel === "HomeAway" ? 2 : 1,
                        backgroundColor: channel === "HomeAway" ? homeAwayGradient : "transparent",
                        steppedLine: "middle",
                        order: channel === "HomeAway" ? 1 : 2
                    });
                }
                let channelName = "VRBO's";
                if (channel === "Airbnb") {
                    channelName = "Airbnb's";
                }
                result.datasets.unshift({
                    label: `${channelName} Price Last Year `,
                    data: lastYearAdjustedPrices,
                    borderColor: "#ced4da",
                    borderWidth: 1,
                    backgroundColor: lastYearGradient,
                    steppedLine: "middle"
                });
            } else {
                result.datasets.unshift({
                    label: "Current Price",
                    data: currentAirbnbPrices,
                    borderColor: "#00a857",
                    borderWidth: 1,
                    backgroundColor: currentAirbnbPricesGradient,
                    steppedLine: "middle"
                });
            }
            return result;
        };

        const options = {
            legend: {
                display: false,
                labels: {
                    display: false
                }
            },
            tooltips: {
                mode: "index",
                intersect: false,
                filter(tooltipItem) {
                    return tooltipItem.value !== "0";
                },
                callbacks: {
                    title(tooltipItem, data) {
                        if (tooltipItem.length) {
                            const date = new Date(tooltipItem[0].label);
                            return format(date, "eee, MMMM do yyyy");
                        }
                        return false;
                    },
                    label(tooltipItem, data) {
                        return ` ${currencySymbol}${tooltipItem.value} ${
                            data.datasets[tooltipItem.datasetIndex].label
                        } `;
                    }
                }
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            fontStyle: "bold",
                            // mirror: true,
                            beginAtZero: true,
                            fontSize: 10,
                            // max: 80,
                            // display: false,
                            padding: -30,
                            callback(value, index, values) {
                                if (isFillerData) {
                                    return "";
                                }
                                return ` ${currencySymbol}${value} `;
                            }
                        },
                        gridLines: {
                            // drawTicks: false,
                            tickMarkLength: 40,
                            drawBorder: false
                            // offsetGridLines: true
                        }
                    }
                ],
                xAxes: [
                    {
                        type: "time",
                        time: {
                            unit: gridUnit,
                            displayFormats: {
                                month: "MMM"
                            }
                        },
                        position: "top",
                        ticks: {
                            // beginAtZero: true,
                            // fontSize: 11,
                            // padding: 20,
                            // display: false
                            // callback(value, index, values) {
                            //     if (index && index !== values.length - 1) {
                            //         return value;
                            //     }
                            //     return "";
                            // }
                        },
                        gridLines: {
                            display: false,
                            // drawTicks: false,
                            drawBorder: false
                            // padding: 20
                        },
                        afterFit: axis => {
                            axis.paddingRight = 0;
                        }
                    }
                ]
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        };
        return (
            <div className="card mb-3">
                <div className="card-header d-flex justify-content-between">
                    <div className="pricing-overview">
                        <div className="media">
                            <div className="media-body">
                                <label>Min Price</label>
                                <h4>{minPrice}</h4>
                                <span>PER NIGHT</span>
                            </div>
                        </div>
                        <div className="media">
                            <div className="media-body">
                                <label>Max Price</label>
                                <h4>{maxPrice}</h4>
                                <span>PER NIGHT</span>
                            </div>
                        </div>
                        <div className="media">
                            <div className="media-body">
                                <label>14 Days</label>
                                <h4>{occupancy14Days}</h4>
                                <span>OCCUPANCY</span>
                            </div>
                        </div>
                        <div className="media">
                            <div className="media-body">
                                <label>30 Days</label>
                                <h4>{occupancy30Days}</h4>
                                <span>OCCUPANCY</span>
                            </div>
                        </div>
                    </div>
                    <div className="btn-group align-self-start">
                        <button
                            type="button"
                            className={monthClasses}
                            onClick={() => {
                                this.handleZoomChange("month");
                            }}
                        >
                            Month
                        </button>
                        <button
                            type="button"
                            className={yearClasses}
                            onClick={() => {
                                this.handleZoomChange("year");
                            }}
                        >
                            Year
                        </button>
                    </div>
                </div>
                <div className="card-body pl-0 pr-0 pt-0 pd-b-10">
                    <Line key={`${zoom}Chart`} height={50} data={data} options={options} />
                </div>
            </div>
        );
    }
}

ChartPrices.propTypes = {
    prices: pricesType.isRequired,
    currentDate: PropTypes.instanceOf(Date).isRequired,
    channel: PropTypes.string.isRequired,
    channels: PropTypes.arrayOf(PropTypes.string).isRequired,
    listing: listingType.isRequired
};

export default ChartPrices;
