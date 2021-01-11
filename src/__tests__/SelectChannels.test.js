import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectChannels from "../admin/components/SelectChannels";

const setup = bindings => {
    const props = {
        selectedValue: "all",
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectChannels {...props} />);

    return {
        view,
        props
    };
};

test("should show `all` option when selected value falsy", async () => {
    setup({selectedValue: 0});
    const {queryByText} = screen;

    expect(queryByText("All")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    expect(queryByText("All")).toBeInTheDocument();

    rerender(<SelectChannels {...props} selectedValue="HomeAway" />);
    expect(queryByText("VRBO")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    expect(queryByText("All")).toBeInTheDocument();

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Airbnb"));
    fireEvent.click(queryByText("Airbnb"));

    expect(queryByText("Airbnb")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
        label: "Airbnb",
        value: "Airbnb"
    });
});
