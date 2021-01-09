import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import SelectDays from "../admin/components/SelectDays";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectDays {...props} />);

    return {
        view,
        props
    };
};

test("should show `On the Day of` option by default when has no selected value", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("On the Day of")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectDays {...props} selectedValue={14} />);
    expect(queryByText("14 Days After")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new value", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("13 Days Before"));
    fireEvent.click(queryByText("13 Days Before"));

    expect(queryByText("13 Days Before")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
      value: -13,
      label: "13 Days Before"
  });
});
