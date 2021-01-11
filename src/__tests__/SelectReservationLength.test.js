import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectReservationLength from "../admin/components/SelectReservationLength";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectReservationLength {...props} />);

    return {
        view,
        props
    };
};

test("should show `Any Length` option by default", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Any Length")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectReservationLength {...props} selectedValue={30} />);
    expect(queryByText("30 Nights or More")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("30 Nights or Less"));
    fireEvent.click(queryByText("30 Nights or Less"));

    expect(queryByText("30 Nights or Less")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({label: "30 Nights or Less", value: -30});
});
