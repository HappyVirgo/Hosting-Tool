import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectLimitEvent from "../admin/components/SelectLimitEvent";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectLimitEvent {...props} />);

    return {
        view,
        props
    };
};

test("should show `Guest Checks-Out` option by default when has no selected value", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Guest Checks-Out")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectLimitEvent {...props} selectedValue="checkin" />);
    expect(queryByText("Guest Checks-In")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new value", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Guest Checks-In"));
    fireEvent.click(queryByText("Guest Checks-In"));

    expect(queryByText("Guest Checks-In")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
        value: "checkin",
        label: "Guest Checks-In"
    });
});
