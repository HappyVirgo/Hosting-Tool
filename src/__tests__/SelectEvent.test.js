import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectEvent from "../admin/components/SelectEvent";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectEvent {...props} />);

    return {
        view,
        props
    };
};

test("should show `Check-In` option by default when has no selected value", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Check-In")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectEvent {...props} selectedValue="timedout" />);
    expect(queryByText("Pre-approval Expired")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new value", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Number of Guests Changed"));
    fireEvent.click(queryByText("Number of Guests Changed"));

    expect(queryByText("Number of Guests Changed")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
        value: "numberOfGuestsChanged",
        label: "Number of Guests Changed"
    });
});
