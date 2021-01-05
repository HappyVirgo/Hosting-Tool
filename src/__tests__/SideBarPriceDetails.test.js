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
            airbnbTimeZone: "America/Los_Angeles",
            _id: "213",
        },
        selectedDates: {
            startDate: new Date("12/29/2020"),
            endDate: new Date("12/30/2020"),
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
