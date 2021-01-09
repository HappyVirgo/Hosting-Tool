import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import SelectTime from "../admin/components/SelectTime";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectTime {...props} />);

    return {
        view,
        props
    };
};

test("should select `At 5PM` by default", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("At 5PM")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectTime {...props} selectedValue={7} />);
    expect(queryByText("At 7AM")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("At 12PM"));
    fireEvent.click(queryByText("At 12PM"));

    expect(queryByText("At 12PM")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({label: "At 12PM", value: 12});
});
