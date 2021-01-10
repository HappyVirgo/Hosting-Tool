import React from "react";
import {render, screen} from "@testing-library/react";
import {addDays, format} from "date-fns";

import {clickOnLabel, mouseEnterOnLabel} from "../testUtils";
import DatePickerPricingRange from "../admin/components/DatePickerPricingRange";

const setup = overrides => {
    const props = {
        onSelectedDates: jest.fn(),

        ...overrides
    };

    const wrapper = render(<DatePickerPricingRange {...props} />);

    return {
        wrapper,
        props
    };
};

const formatter = date => format(date, "eee MMM dd yyyy");

describe("DatePickerPricingRange", () => {
    test("should render calendar with default values", () => {
        setup();

        const today = formatter(new Date());
        const more7Days = formatter(addDays(new Date(), 7));

        expect(screen.queryByLabelText(today)).toBeInTheDocument();
        expect(screen.queryByLabelText(more7Days)).toBeInTheDocument();
    });

    test("should render with specific props", () => {
        const startDate = new Date();
        const endDate = addDays(new Date(), 7);

        setup({
            startDate,
            endDate
        });

        const today = formatter(startDate);
        const more7Days = formatter(endDate);

        expect(screen.queryByLabelText(today)).toBeInTheDocument();
        expect(screen.queryByLabelText(more7Days)).toBeInTheDocument();
    });

    test("should update new props properly", () => {
        const {wrapper, props} = setup();

        const startDate = addDays(new Date(), 1);
        const endDate = addDays(new Date(), 8);

        wrapper.rerender(
            <DatePickerPricingRange {...props} startDate={startDate} endDate={endDate} />
        );

        expect(props.onSelectedDates).toHaveBeenCalledWith(startDate, endDate);
    });

    test("should show error", () => {
        const {wrapper, props} = setup();

        const error = {
            specificDates: "something went wrong"
        };

        wrapper.rerender(<DatePickerPricingRange {...props} error={error} />);

        expect(screen.queryByText(error.specificDates)).toBeInTheDocument();
    });

    test("should click on date successfully", () => {
        setup();

        const today = formatter(new Date());
        const tomorrow = formatter(addDays(new Date(), 1));
        const more2Days = formatter(addDays(new Date(), 2));

        expect(screen.queryByLabelText(today)).toHaveAttribute("aria-disabled", "false");

        clickOnLabel(tomorrow);

        expect(screen.queryByLabelText(today)).toHaveAttribute("aria-disabled", "true");

        clickOnLabel(more2Days);

        expect(screen.queryByLabelText(more2Days)).toHaveAttribute("aria-selected", "true");
    });

    test("should hover on date successfully", () => {
        setup();

        const tomorrow = formatter(addDays(new Date(), 1));
        const more2Days = formatter(addDays(new Date(), 2));

        clickOnLabel(tomorrow);
        mouseEnterOnLabel(more2Days);

        expect(screen.queryByLabelText(more2Days)).toHaveAttribute("aria-selected", "true");
    });
});
