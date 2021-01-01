import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import SelectPriceSource from "../admin/components/SelectPriceSource";

const setup = bindings => {
    const props = {
        includeChannels: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectPriceSource {...props} />);

    return {
        view,
        props
    };
};

test("should select first option by default", () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("Set Amount")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectPriceSource {...props} selectedValue="Airbnb Smart Prices" />);
    expect(queryByText("Airbnb Smart Prices")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Airbnb Smart Prices"));
    fireEvent.click(queryByText("Airbnb Smart Prices"));

    expect(queryByText("Airbnb Smart Prices")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({label: "Airbnb Smart Prices", value: "Airbnb Smart Prices"});
});

test("should add more options when `includeChannels` is truly", async () => {
    const {view} = setup({
        includeChannels: true,
    });
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

    expect(queryByText("Airbnb")).toBeInTheDocument();
    expect(queryByText("VRBO")).toBeInTheDocument();
});
