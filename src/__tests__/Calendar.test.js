import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {format, utcToZonedTime} from "date-fns-tz";

import Calendar from "../admin/components/Calendar";

const setup = overrides => {
    const props = {
        listing: {
            airbnbTimeZone: "Asia/Bangkok"
        },
        channel: "Airbnb",
        channels: [],

        prevMonth: jest.fn(),
        nextMonth: jest.fn(),
        changeChannel: jest.fn(),
        onSelectedDates: jest.fn(),
        onSelectedReservation: jest.fn(),

        ...overrides
    };

    const wrapper = render(<Calendar {...props} />);

    return {
        wrapper,
        props
    };
};

jest.mock("date-fns-tz");

jest.mock("date-fns", () => ({
    __esModule: true,
    ...jest.requireActual("date-fns"),
    startOfWeek: () => new Date("2021-1-01"),
    endOfWeek: () => new Date("2021-2-15"),
    eachDayOfInterval: ({start}) => [start]
}));

describe("Calendar", () => {
    beforeEach(() => {
        format.mockImplementation(jest.requireActual("date-fns-tz").format);
    });

    test("should render calendar with events in range [start, end]", () => {
        utcToZonedTime.mockImplementation(date => (date instanceof Date ? date : new Date(date)));

        setup({
            currentDate: new Date("2021-01-05"),
            channel: "Airbnb",
            prices: genPrices(2)
        });

        expect(screen.queryByText("January 2021")).toBeInTheDocument();
    });

    describe("Event", () => {
        beforeEach(() => {
            utcToZonedTime.mockImplementation(date =>
                date instanceof Date ? new Date("2021-1-01") : new Date(date)
            );
        });

        const mount = () =>
            setup({
                currentDate: new Date("2021-1-05"),
                channel: "Airbnb",
                prices: genPrices(1)
            });

        test("should trigger click", () => {
            const {props} = mount();

            const anEvent = screen.queryByText("$27", {
                selector: "h5"
            });

            expect(anEvent).toBeInTheDocument();

            fireEvent.click(anEvent);

            expect(props.onSelectedDates).toHaveBeenCalled();
        });

        test("should trigger mouseover event", () => {
            const {props} = mount();

            const anEvent = screen.queryByText("$27", {
                selector: "h5"
            });

            expect(anEvent).toBeInTheDocument();

            fireEvent.click(anEvent);
            fireEvent.mouseOver(anEvent);

            expect(props.onSelectedDates).toHaveBeenCalled();
        });

        test("should trigger focus event", () => {
            mount();

            const anEvent = screen.queryByText("$27", {
                selector: "h5"
            });
            expect(anEvent).toBeInTheDocument();

            fireEvent.focus(anEvent);
        });

        test("should trigger keyPress event", () => {
            mount();

            const anEvent = screen.queryByText("$27", {
                selector: "h5"
            });

            expect(anEvent).toBeInTheDocument();

            fireEvent.focus(anEvent);
            fireEvent.keyPress(anEvent, {
                key: "enter",
                keyCode: 13
            });
        });

        test("should trigger mouse leave event", () => {
            mount();

            const anEvent = screen.queryByText("$27", {
                selector: "h5"
            });

            expect(anEvent).toBeInTheDocument();

            fireEvent.click(anEvent);
            fireEvent.mouseLeave(anEvent);
        });
    });

    test("should trigger prev month event", () => {
        utcToZonedTime.mockImplementation(date =>
            date instanceof Date ? new Date("2021-2-01") : new Date(date)
        );

        const {props} = setup({
            currentDate: new Date("2021-1-05"),
            channel: "Airbnb",
            prices: genPrices(1)
        });

        const btnPrevMonth = screen.queryByTestId("prev-month");

        expect(btnPrevMonth).toBeInTheDocument();

        fireEvent.click(btnPrevMonth);

        expect(props.prevMonth).toHaveBeenCalled();
    });

    test("should trigger next month event", () => {
        utcToZonedTime.mockImplementation(date =>
            date instanceof Date ? new Date("2021-1-01") : new Date(date)
        );

        const {props} = setup({
            currentDate: new Date("2021-1-05"),
            channel: "Airbnb",
            prices: genPrices(1)
        });

        const btnNextMonth = screen.queryByTestId("next-month");

        expect(btnNextMonth).toBeInTheDocument();

        fireEvent.click(btnNextMonth);

        expect(props.nextMonth).toHaveBeenCalled();
    });

    [
        ["Airbnb", "Airbnb"],
        ["VRBO", "HomeAway"]
    ].forEach(([btnText, value]) => {
        test(`should change channel to "${btnText}"`, () => {
            utcToZonedTime.mockImplementation(date =>
                date instanceof Date ? new Date("2021-1-01") : new Date(date)
            );

            const {props} = setup({
                currentDate: new Date("2021-1-05"),
                channel: "Airbnb",
                channels: ["Airbnb", "HomeAway"],
                prices: genPrices(1)
            });

            const button = screen.queryByText(btnText, {
                selector: "button"
            });

            expect(button).toBeInTheDocument();

            fireEvent.click(button);

            expect(props.changeChannel).toHaveBeenCalledWith(value);
        });
    });

    describe("reservation", () => {
        beforeEach(() => {
            utcToZonedTime.mockImplementation(date =>
                date instanceof Date ? new Date("2021-1-01") : new Date(date)
            );
        });

        const mount = bindings =>
            setup({
                currentDate: new Date("2021-1-05"),
                channel: "Airbnb",
                prices: genPrices(1, idx => ({
                    blocked: false,
                    occupied: false,
                    reservation: {
                        _id: idx,
                        custom: {
                            firstName: `Hao #${idx}`
                        }
                    },
                    isStart: true,
                    isEnd: false,

                    ...bindings
                }))
            });

        test("should render reservation (isStart = true)", () => {
            mount();

            expect(screen.queryByText("Hao #20")).toBeInTheDocument();
        });

        test("should render reservation (isStart = false)", () => {
            mount({
                isStart: false,
                available: false
            });

            expect(screen.queryByText("Hao #20")).not.toBeInTheDocument();
        });

        test("should trigger callback as click on a reservation", () => {
            const {props} = mount();

            const label = "Hao #20";

            fireEvent.click(screen.queryByText(label));

            expect(props.onSelectedReservation).toHaveBeenCalledWith({
                _id: 20,
                custom: {firstName: label}
            });
        });

        test("should trigger callback as keypress on a reservation", () => {
            const {props} = mount();

            const label = "Hao #20";
            const aReservation = screen.queryByText(label);

            fireEvent.focus(aReservation);
            fireEvent.keyPress(aReservation, {
                key: "enter",
                keyCode: 13
            });

            expect(props.onSelectedReservation).toHaveBeenCalledWith({
                _id: 20,
                custom: {firstName: label}
            });
        });
    });
});

function genPrices(from = 1, overrides) {
    return [
        ...Array.from({length: 29 - from}).map((_, idx) => ({
            date: `2021-1-${`0${idx + from}`.slice(-2)}`,
            blocked: false,
            occupied: false,
            reservation: false,
            Airbnb: {
                appliedRules: [],
                currentPrice: idx,
                currentPriceFormatted: `$${idx}`,
                price: idx,
                priceFormatted: `$${idx}`
            },
            ...(typeof overrides === "function" ? overrides(idx) : overrides)
        })),

        ...Array.from({length: 15}).map((_, idx) => ({
            date: `2021-2-${`0${1 + idx}`.slice(-2)}`,
            blocked: false,
            occupied: false,
            reservation: false,
            Airbnb: {
                appliedRules: [],
                currentPrice: idx,
                currentPriceFormatted: `$${idx}`,
                price: idx,
                priceFormatted: `$${idx}`
            },
            ...(typeof overrides === "function" ? overrides(idx) : overrides)
        }))
    ];
}
