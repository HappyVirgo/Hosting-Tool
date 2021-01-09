import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectPricingDays from "../admin/components/SelectPricingDays";

const setup = bindings => {
    const props = {
        selectedValue: "weekdays",
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectPricingDays {...props} />);

    return {
        view,
        props
    };
};

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    expect(queryByText("Only Weekdays")).toBeInTheDocument();

    rerender(<SelectPricingDays {...props} selectedValue="all" />);
    expect(queryByText("All Days")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Only Weekends"));
    fireEvent.click(queryByText("Only Weekends"));

    expect(queryByText("Only Weekends")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
        label: "Only Weekends",
        value: "weekends"
    });
});
