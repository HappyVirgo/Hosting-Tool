import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectPricingOptions from "../admin/components/SelectPricingOptions";

const setup = bindings => {
    const props = {
        selectedValue: "value",
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectPricingOptions {...props} />);

    return {
        view,
        props
    };
};

test("should show `Set Price` option by default", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Set Price")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectPricingOptions {...props} selectedValue="minPrice" />);
    expect(queryByText("Set Minimum Price")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Decrease by Amount"));
    fireEvent.click(queryByText("Decrease by Amount"));

    expect(queryByText("Decrease by Amount")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
        label: "Decrease by Amount",
        value: "decreaseByPrice"
    });
});
