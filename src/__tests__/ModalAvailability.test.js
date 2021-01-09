import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import ModalAvailability from "../admin/components/ModalAvailability";

jest.mock("date-fns-tz", () => ({
    __esModule: true,
    zonedTimeToUtc: date => {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    }
}));

const setup = overrides => {
    const props = {
        show: true,
        listing: {
            airbnbTimeZone: "America/Los_Angeles"
        },
        selectedDates: {
            startDate: new Date("12/29/2020"),
            endDate: new Date("12/30/2020")
        },
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<ModalAvailability {...props} />);

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

describe("ModalAvailability", () => {
    test("should show the correct modal info with same months", () => {
        setup();

        expect(screen.queryByText("Dec 29th - 30th")).toBeInTheDocument();
        expect(screen.queryByText("Available")).toBeInTheDocument();
    });

    test("should show the correct modal info with different months", () => {
        setup({
            selectedDates: {
                startDate: new Date("11/29/2020"),
                endDate: new Date("12/30/2020")
            }
        });

        expect(screen.queryByText("Nov 29th - Dec 30th")).toBeInTheDocument();
    });

    test("should disable to submit", () => {
        const {props} = setup({
            selectedDates: {
                blocked: true,
                startDate: new Date("12/29/2020"),
                endDate: new Date("12/30/2020")
            }
        });

        doClickSave();

        expect(props.onHide).toHaveBeenCalled();
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
                body: JSON.stringify({
                    blocked: true,
                    dateRange: {
                        startDate: "29-12-2020",
                        endDate: "30-12-2020"
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
});
