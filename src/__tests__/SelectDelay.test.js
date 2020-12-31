import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import SelectDelay from "@/admin/components/SelectDelay";

const setup = bindings => {
    const props = {
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectDelay {...props} />);

    return {
        view,
        props
    };
};

test("should show `Within 5 Minutes` option by default when has no selected value", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Within 5 Minutes")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectDelay {...props} selectedValue={120} />);
    expect(queryByText("120 Minutes After")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new value", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("20 Minutes After"));
    fireEvent.click(queryByText("20 Minutes After"));

    expect(queryByText("20 Minutes After")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
      value: 20,
      label: "20 Minutes After"
  });
});
