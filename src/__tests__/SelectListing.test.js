import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectListing from "../admin/components/SelectListing";

const setup = bindings => {
    const props = {
        options: [
            {
                label: "Item 1",
                value: "item1"
            },
            {
                label: "Item 2",
                value: "item2"
            },
            {
                label: "Item 3",
                value: "item3"
            }
        ],
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectListing {...props} />);

    return {
        view,
        props
    };
};

test("should show placeholder when selected value do not provide", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Listings...")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectListing {...props} selectedValue="item2" />);
    expect(queryByText("Item 2")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option and remove selected option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Item 3"));
    fireEvent.click(queryByText("Item 3"));

    expect(queryByText("Item 3")).not.toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({label: "Item 3", value: "item3"});
});
