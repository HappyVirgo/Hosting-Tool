import React from "react";
import {render, screen} from "@testing-library/react";
import {utcToZonedTime} from "date-fns-tz";
import {isSameDay} from "date-fns";

import {clickButton} from "../testUtils";
import ChartPrices from "../admin/components/ChartPrices";

const setup = overrides => {
    const props = {
        listing: {
            airbnbTimeZone: "Asia/Saigon"
        },
        channel: "Airbnb",
        channels: [],
        currentDate: new Date("2021-1-01"),
        prices: [],

        ...overrides
    };

    const wrapper = render(<ChartPrices {...props} />);

    return {
        wrapper,
        props
    };
};

jest.mock("react-chartjs-2", () => ({
    __esModule: true,
    Line: ({height, data, options}) => {
        const canvas = global.document.createElement("canvas");
        const {callbacks} = options.tooltips;
        const dataValues = data(canvas);

        const tooltipTitle = callbacks.title([
            {
                label: "2020-1-20"
            }
        ]);

        const tooltipLabel = callbacks.label(
            {
                value: "20",
                datasetIndex: 0
            },
            {
                datasets: [
                    {
                        label: "tooltip label"
                    }
                ]
            }
        );

        const {format: formatter} = require("date-fns");

        return (
            <div data-testid="line-chart" style={{height}}>
                <ul data-testid="x-axis">
                    {dataValues.labels.map(elem =>
                        elem ? <li key={elem}>{formatter(elem, "yyyy-M-dd")}</li> : null
                    )}
                </ul>

                <ul data-testid="y-axis">
                    {dataValues.datasets.map(elem => (
                        <li key={elem.label}>
                            {elem.label}
                            <ul>
                                {elem.data.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                <div data-testid="tooltip">
                    {tooltipTitle}
                    {tooltipLabel}
                </div>
            </div>
        );
    }
}));

jest.mock("date-fns-tz");

describe("ChartPrices", () => {
    beforeEach(() => {
        // set today as 2021-1-01
        utcToZonedTime.mockImplementation(date =>
            date instanceof Date && isSameDay(date, new Date())
                ? new Date("2021-1-01")
                : new Date(date)
        );
    });

    describe("render", () => {
        const commonExpectations = () => {
            expect(screen.queryByTestId("line-chart")).toBeInTheDocument();

            expect(screen.queryByText("14 Days")).toBeInTheDocument();
            expect(screen.queryByText("92.86%")).toBeInTheDocument();

            expect(screen.queryByText("30 Days")).toBeInTheDocument();
            expect(screen.queryByText("96.67%")).toBeInTheDocument();

            expect(screen.queryByText("2021-1-02")).toBeInTheDocument();
        };

        test("should render chart with 1 valid price", () => {
            const {wrapper, props} = setup();

            wrapper.rerender(
                <ChartPrices
                    {...props}
                    prices={[
                        priceMaker({
                            date: "2021-1-02",
                            price: 20
                        })
                    ]}
                />
            );

            commonExpectations();
            expect(screen.queryByText("2021-1-02")).toBeInTheDocument();
        });

        test("should render chart with prices contains 1 past price", () => {
            const {wrapper, props} = setup();

            wrapper.rerender(
                <ChartPrices
                    {...props}
                    prices={[
                        priceMaker({
                            date: "2020-12-24",
                            price: 10
                        }),
                        priceMaker({
                            date: "2021-1-02",
                            price: 20
                        })
                    ]}
                />
            );

            commonExpectations();
        });

        test("should render chart with prices contains 1 future price", () => {
            const {wrapper, props} = setup();

            wrapper.rerender(
                <ChartPrices
                    {...props}
                    prices={[
                        priceMaker({
                            date: "2021-1-02",
                            price: 10
                        }),
                        priceMaker({
                            date: "2021-3-01",
                            price: 30,
                            currentPrice: 20
                        })
                    ]}
                />
            );

            commonExpectations();

            expect(screen.queryByText("2021-3-01")).toBeInTheDocument();
        });

        test("should render chart with 2 channels", () => {
            const {wrapper, props} = setup();

            wrapper.rerender(
                <ChartPrices
                    {...props}
                    prices={[
                        priceMaker({
                            date: "2020-12-24",
                            price: 10
                        }),
                        priceMaker({
                            date: "2021-1-02",
                            price: 20,
                            currentPrice: 30,
                            airbnbDate: "2021-1-03"
                        })
                    ]}
                    channels={["Airbnb", "HomeAway"]}
                    q
                />
            );

            commonExpectations();

            expect(screen.queryByText("Airbnb's Price Last Year")).toBeInTheDocument();
            expect(screen.queryByText("VRBO Price")).toBeInTheDocument();
            expect(screen.queryByText("VRBO's Current Price")).toBeInTheDocument();
            expect(screen.queryByText("Airbnb Price")).toBeInTheDocument();
            expect(screen.queryByText("Airbnb's Current Price")).toBeInTheDocument();

            expect(
                screen.queryByText("20", {
                    selector: "li"
                })
            ).toBeInTheDocument();
            expect(
                screen.queryByText("30", {
                    selector: "li"
                })
            ).toBeInTheDocument();
        });

        test("should render chart prices for HomeAway", () => {
            const {wrapper, props} = setup();

            wrapper.rerender(
                <ChartPrices
                    {...props}
                    prices={[
                        priceMaker({
                            date: "2021-1-02",
                            price: 20,
                            channel: "HomeAway"
                        }),
                        priceMaker({
                            date: "2021-1-03",
                            price: 30,
                            currentPrice: 20,
                            channel: "HomeAway"
                        })
                    ]}
                />
            );
        });
    });

    test("should change zoom to month successfully", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(
            <ChartPrices
                {...props}
                prices={[
                    priceMaker({
                        date: "2020-12-24",
                        price: 10
                    }),
                    priceMaker({
                        date: "2021-1-02",
                        price: 20
                    }),
                    priceMaker({
                        date: "2021-1-03",
                        price: 30
                    })
                ]}
            />
        );

        const label = "Month";
        clickButton("Month");

        expect(screen.queryByText("85.71%")).toBeInTheDocument();
        expect(screen.queryByText("93.33%")).toBeInTheDocument();

        expect(screen.queryByText(label).className).toContain("active");
    });

    test("should change zoom to year successfully", () => {
        const {wrapper, props} = setup({
            currentDate: new Date("2021-1-01")
        });

        wrapper.rerender(
            <ChartPrices
                {...props}
                prices={[
                    priceMaker({
                        date: "2021-1-02",
                        price: 20
                    })
                ]}
            />
        );

        const label = "Year";
        clickButton(label);

        expect(screen.queryByText(label).className).toContain("active");
    });
});

function priceMaker({
    date,
    localDate = date,
    price,
    currentPrice = price,
    channel = "Airbnb",
    ...others
}) {
    return {
        date,
        localDate,
        currencySymbol: "$",
        [channel]: {
            appliedRules: [],
            currentPrice,
            currentPriceFormatted: `$${currentPrice}`,
            price,
            priceFormatted: `$${price}`
        },
        ...others
    };
}
