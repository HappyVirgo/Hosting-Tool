import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitForElementToBeRemoved,
    waitFor
} from "@testing-library/react";
import {format, addDays, subDays, startOfDay} from "date-fns";

import MultiCalendarListing from "../admin/components/MultiCalendarListing";
import {clickButton} from "../testUtils";

const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const setup = overrides => {
    const props = {
        listing: {
            _id: "1",
            airbnbTimeZone: browserTz,
            reservations: []
        },
        selectedListingID: "",
        prices: [
            priceMaker({
                date: subDays(new Date(), 3)
            }),
            priceMaker({
                date: new Date()
            }),
            priceMaker({
                date: addDays(new Date(), 3)
            })
        ],

        onShowSelectedReservation: jest.fn(),
        onSelectedDates: jest.fn(),
        onRefresh: jest.fn(),

        ...overrides
    };

    const wrapper = render(<MultiCalendarListing {...props} />);

    return {
        wrapper,
        props
    };
};

describe("MultiCalendarListing", () => {
    test("should render given prices", () => {
        setup();

        expect(screen.queryAllByRole("presentation").length).toBe(2);
    });

    test("should render default props", () => {
        setup({
            listing: {
                _id: "1",
                airbnbTimeZone: browserTz,
                reservations: []
            },
            selectedListingID: "",
            prices: []
        });

        expect(screen.queryAllByRole("presentation").length).toBe(368);
    });

    test("should render a past date", () => {
        setup({
            prices: [
                priceMaker({
                    date: subDays(new Date(), 1)
                })
            ]
        });

        expect(screen.queryAllByRole("presentation").length).toBe(1);
    });

    test("should update as selectedListingID changed", async () => {
        const {wrapper, props} = setup();

        fireEvent.click(screen.queryAllByRole("presentation")[0]);
        fireEvent.click(screen.queryAllByRole("presentation")[1]);

        wrapper.rerender(<MultiCalendarListing {...props} selectedListingID="2" />);

        await waitFor(() => expect(screen.queryByText("Save")).toBeInTheDocument());
    });

    test("should click on calendar to show the modal", () => {
        setup();

        fireEvent.click(screen.queryAllByRole("presentation")[0]);
        fireEvent.click(screen.queryAllByRole("presentation")[1]);

        expect(screen.queryByText("Cancel")).toBeInTheDocument();
    });

    test("should keypress on calendar to show the modal", () => {
        setup();

        const key = {
            key: "enter",
            keyCode: 13
        };

        fireEvent.keyPress(screen.queryAllByRole("presentation")[0], key);
        fireEvent.keyPress(screen.queryAllByRole("presentation")[1], key);

        expect(screen.queryByText("Cancel")).toBeInTheDocument();
    });

    test("should mouseenter on calendar", () => {
        setup();

        expect(screen.queryAllByRole("presentation").length).toBe(2);

        fireEvent.click(screen.queryAllByRole("presentation")[0]);
        fireEvent.mouseOver(screen.queryAllByRole("presentation")[1]);

        expect(screen.queryAllByRole("presentation")[1].className).toContain("bg-selected");
    });

    test("should focus on calendar", () => {
        setup();

        expect(screen.queryAllByRole("presentation").length).toBe(2);

        fireEvent.click(screen.queryAllByRole("presentation")[0]);
        fireEvent.focus(screen.queryAllByRole("presentation")[1]);

        expect(screen.queryAllByRole("presentation")[1].className).toContain("bg-selected");
    });

    test("should mouseleave on calendar", () => {
        setup();

        expect(screen.queryAllByRole("presentation").length).toBe(2);

        fireEvent.click(screen.queryAllByRole("presentation")[0]);
        fireEvent.mouseOver(screen.queryAllByRole("presentation")[1]);

        expect(screen.queryAllByRole("presentation")[1].className).toContain("bg-selected");
        fireEvent.mouseLeave(screen.queryAllByRole("presentation")[1]);

        expect(screen.queryAllByRole("presentation")[1].className).not.toContain("bg-selected");
    });

    test("should hide the modal", async () => {
        setup();

        fireEvent.click(screen.queryAllByRole("presentation")[0]);
        fireEvent.click(screen.queryAllByRole("presentation")[1]);

        expect(screen.queryByText("Cancel")).toBeInTheDocument();

        clickButton("Cancel");

        await waitForElementToBeRemoved(screen.queryByText("Cancel"));
    });

    test("should render a reservation with 'Airbnb' source which ends in the future", () => {
        setup({
            listing: {
                _id: "1",
                airbnbTimeZone: browserTz,
                reservations: [
                    {
                        startDate: new Date(),
                        endDate: addDays(new Date(), 7),
                        status: "accepted",
                        source: "Airbnb",
                        custom: {
                            firstName: "Hao",
                            lastName: "Tran"
                        }
                    }
                ]
            }
        });

        expect(screen.queryAllByRole("presentation").length).toBe(3);
        expect(screen.queryByText("Hao Tran")).toBeInTheDocument();
        expect(screen.queryByAltText("Airbnb")).toBeInTheDocument();
    });

    test("should render a reservation with 'HomeAway' source which ends in the future", () => {
        setup({
            listing: {
                _id: "1",
                airbnbTimeZone: browserTz,
                reservations: [
                    {
                        startDate: new Date(),
                        endDate: addDays(new Date(), 7),
                        status: "accepted",
                        source: "HomeAway",
                        custom: {
                            firstName: "Hao",
                            lastName: "Tran"
                        }
                    }
                ]
            }
        });

        expect(screen.queryAllByRole("presentation").length).toBe(3);
        expect(screen.queryByText("Hao Tran")).toBeInTheDocument();
        expect(screen.queryByAltText("HomeAway")).toBeInTheDocument();
    });

    test("should render a reservation which ends in the past", () => {
        setup({
            listing: {
                _id: "1",
                airbnbTimeZone: browserTz,
                reservations: [
                    {
                        _id: "10",
                        startDate: subDays(startOfDay(new Date()), 3),
                        endDate: subDays(startOfDay(new Date()), 1),
                        status: "accepted"
                    },
                    {
                        _id: "11",
                        startDate: subDays(startOfDay(new Date()), 2),
                        endDate: startOfDay(new Date()),
                        status: "accepted"
                    }
                ]
            }
        });

        expect(screen.queryAllByRole("presentation").length).toBe(4);
    });

    test("should click on a reservation", () => {
        const {props} = setup({
            listing: {
                _id: "1",
                airbnbTimeZone: browserTz,
                reservations: [
                    {
                        _id: "11",
                        startDate: subDays(startOfDay(new Date()), 2),
                        endDate: startOfDay(new Date()),
                        status: "accepted"
                    }
                ]
            }
        });

        fireEvent.click(screen.queryAllByRole("presentation")[2]);

        expect(props.onShowSelectedReservation).toHaveBeenCalled();
    });

    test("should keypress on a reservation", () => {
        const {props} = setup({
            listing: {
                _id: "1",
                airbnbTimeZone: browserTz,
                reservations: [
                    {
                        _id: "11",
                        startDate: subDays(startOfDay(new Date()), 2),
                        endDate: startOfDay(new Date()),
                        status: "accepted"
                    }
                ]
            }
        });

        const key = {
            key: "enter",
            keyCode: 13
        };
        fireEvent.keyPress(screen.queryAllByRole("presentation")[2], key);

        expect(props.onShowSelectedReservation).toHaveBeenCalled();
    });
});

function priceMaker({date, localDate = date, airbnbDate = date, channel = "Airbnb", ...others}) {
    return {
        date,
        localDate,
        airbnbDate: format(airbnbDate, "yyyy-MM-dd"),
        ...others
    };
}
