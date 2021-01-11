import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectLimitDays from "../admin/components/SelectLimitDays";

const setup = bindings => {
    const props = {
        selectedValues: {},
        isDisabled: false,
        includeAllDays: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectLimitDays {...props} />);

    return {
        view,
        props
    };
};

describe("Not include all days", () => {
    test("should call `onSelectedOption` props when select dates", async () => {
        const {view, props} = setup();
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("Wednesday"));
        fireEvent.click(queryByText("Wednesday"));

        await waitFor(() => queryByText("Monday"));
        fireEvent.click(queryByText("Monday"));

        fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

        expect(queryByText("Monday")).toBeInTheDocument();
        expect(queryByText("Wednesday")).toBeInTheDocument();
        expect(props.onSelectedOption).toHaveBeenCalledWith([
            {label: "Monday", value: "monday", order: 0},
            {label: "Wednesday", value: "wednesday", order: 2}
        ]);
    });

    test("should validate `selectedValues` whether it is date in week", () => {
        const {view, props} = setup();
        const {rerender} = view;
        const {queryByText} = screen;
        const selectedValues = {
            monday: true,
            tuesday: false,
            weekends: true
        };

        rerender(<SelectLimitDays {...props} selectedValues={selectedValues} />);

        expect(queryByText("Monday")).toBeInTheDocument();
        expect(queryByText("Tuesday")).toBeInTheDocument();
    });
});

describe("Include all days", () => {
    test("should call `onSelectedOption` props with only all days", async () => {
        const {view, props} = setup({
            includeAllDays: true
        });
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("Wednesday"));
        fireEvent.click(queryByText("Wednesday"));

        await waitFor(() => queryByText("Monday"));
        fireEvent.click(queryByText("Monday"));

        await waitFor(() => queryByText("Weekends (Fri, Sat)"));
        fireEvent.click(queryByText("Weekends (Fri, Sat)"));

        await waitFor(() => queryByText("Weekdays (Sun, Mon, Tue, Wed, Thu)"));
        fireEvent.click(queryByText("Weekdays (Sun, Mon, Tue, Wed, Thu)"));

        await waitFor(() => queryByText("Every Day"));
        fireEvent.click(queryByText("Every Day"));

        fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

        expect(queryByText("Monday")).not.toBeInTheDocument();
        expect(queryByText("Wednesday")).not.toBeInTheDocument();
        expect(queryByText("Every Day")).toBeInTheDocument();
        expect(props.onSelectedOption).toHaveBeenCalledWith([
            {
                value: "allDays",
                label: "Every Day",
                order: -1
            }
        ]);
    });
});
