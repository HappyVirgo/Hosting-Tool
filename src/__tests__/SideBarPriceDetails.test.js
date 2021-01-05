import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SideBarPriceDetails from "../admin/components/SideBarPriceDetails";

jest.mock("date-fns-tz", () => ({
    __esModule: true,
    zonedTimeToUtc: date => {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    }
}));

const setup = overrides => {
    const props = {
        listing: {
            _id: "213"
        },
        selectedDates: {
            startDate: new Date("12/29/2020"),
            endDate: new Date("12/30/2020")
        },
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<SideBarPriceDetails {...props} />);

    return {
        wrapper,
        props
    };
};

const doClickSave = () => {
    fireEvent.click(
        screen.getByText("Save", {
            selector: "button"
        })
    );
};

const doClickCancel = () => {
    fireEvent.click(
        screen.getByText("Close", {
            selector: "button"
        })
    );
};

describe("SideBarPriceDetails", () => {
    test("should show correct ", () => {
        setup();

        expect(screen.queryByText("Dec 29th - 30th")).toBeInTheDocument();
        expect(screen.queryByText("Available")).toBeInTheDocument();
    });

    const appliedRules = [
        {
            title: "Airbnb Smart Price",
            _id: "1",
            changedPrice: true,
            currencySymbol: "$",
            price: "106",
            equation: "$106"
        },
        {
            title: "Airbnb Minimum Listing Price",
            _id: "2",
            changedPrice: true,
            currencySymbol: "$",
            price: "106",
            equation: "if $100 > $106 then $100 = $106"
        },
        {
            title: "Airbnb Maximum Listing Price",
            _id: "3",
            changedPrice: true,
            currencySymbol: "$",
            price: "106",
            equation: "if $193 < $106 then $193 = $106"
        },
        {
            title: "+$10 (Su, Mo, Tu, We, Th, Fr, Sa)",
            _id: "4",
            changedPrice: true,
            currencySymbol: "$",
            price: "116",
            equation: "$106 + $10 = $116"
        },
        {
            title: "Minimum Listing Price (from Listing Settings)",
            _id: "5",
            changedPrice: true,
            currencySymbol: "$",
            price: "116",
            equation: "if $1 > $116 then $1 = $116"
        }
    ];

    appliedRules.map((rule, idx) => {
        test("should show correct applied rule", () => {
            setup({
                selectedDates: {
                    startDate: new Date("12/29/2020"),
                    endDate: new Date("12/30/2020"),
                    appliedRules: [rule]
                }
            });

            expect(screen.queryByText(rule.title)).toBeInTheDocument();
        });
    });

    test("should work well while toggling checkbox", () => {
        setup();
        expect(screen.queryByText("Available")).toBeInTheDocument();
        fireEvent.click(screen.queryByTestId("blocked-checkbox"));
        expect(screen.queryByText("Block")).toBeInTheDocument();
        fireEvent.click(screen.queryByTestId("blocked-checkbox"));
        expect(screen.queryByText("Available")).toBeInTheDocument();
    });

    test("should submit successfully", async () => {
        const {props} = setup();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        fireEvent.click(screen.queryByTestId("blocked-checkbox"));

        expect(screen.getByLabelText("Block")).toBeInTheDocument();

        doClickSave();

        await jest.requireActual("promise").resolve();

        expect(global.fetch).toHaveBeenCalledWith(
            "/setAvailabilityRange",
            expect.objectContaining({
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    listingID: props.listing._id,
                    blocked: true,
                    dateRange: {
                        startDate: props.selectedDates.startDate,
                        endDate: props.selectedDates.endDate
                    }
                }),
                method: "POST"
            })
        );
        expect(props.onHide).toHaveBeenCalled();
    });

    test("should fail to submit", async () => {
        setup();

        const message = "something went wrong";

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue(message)
        });

        doClickSave();

        await waitFor(() => screen.queryByText(message));

        expect(screen.queryByText(message)).toBeInTheDocument();
    });

    test("should cancel to submit", () => {
        const {props} = setup({
            selectedDates: {
                blocked: true,
                startDate: new Date("12/29/2020"),
                endDate: new Date("12/30/2020")
            }
        });

        doClickCancel();

        expect(props.onHide).toHaveBeenCalled();
    });
});
