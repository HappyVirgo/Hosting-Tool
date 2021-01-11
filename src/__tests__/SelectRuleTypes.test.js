import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectRuleTypes from "../admin/components/SelectRuleTypes";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectRuleTypes {...props} />);

    return {
        view,
        props
    };
};

test("should placeholder by default", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Rule Type...")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectRuleTypes {...props} selectedValue="orphanPeriod" />);
    expect(queryByText("Orphan Periods Between Bookings")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Months"));
    fireEvent.click(queryByText("Months"));

    expect(queryByText("Months")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({label: "Months", value: "months"});
});
