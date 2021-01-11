import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectPricingMonths from "../admin/components/SelectPricingMonths";

const setup = bindings => {
    const props = {
        onSelectedOption: jest.fn(),
        selectedValues: {},
        ...bindings
    };

    const view = render(<SelectPricingMonths {...props} />);

    return {
        view,
        props
    };
};

test("should validate selected value", () => {
    const {view} = setup({
        selectedValues: {
            january: true,
            february: true,
            event: true
        }
    });

    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

    expect(queryByText("January")).toBeInTheDocument();
    expect(queryByText("February")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("January"));
    fireEvent.click(queryByText("January"));

    await waitFor(() => queryByText("February"));
    fireEvent.click(queryByText("February"));
    fireEvent.keyDown(container.firstChild.firstChild, {key: "Escapse"});

    expect(props.onSelectedOption).toHaveBeenCalledWith([
        {label: "January", order: 0, value: "january"},
        {label: "February", order: 1, value: "february"}
    ]);
});

test("should disable months are not neighboring to selected month", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("January"));
    fireEvent.click(queryByText("January"));

    await waitFor(() => queryByText("December"));
    fireEvent.click(queryByText("December"));

    await waitFor(() => queryByText("October"));
    fireEvent.click(queryByText("October"));

    await waitFor(() => queryByText("April"));
    fireEvent.click(queryByText("April"));

    fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

    expect(props.onSelectedOption).toHaveBeenCalledWith([
        {label: "January", order: 0, value: "january"},
        {label: "December", order: 11, value: "december"}
    ]);
});

describe("Remove redundant range", () => {
    test("should remove top range because it is smaller bottom", async () => {
        const {view, props} = setup();
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("January"));
        fireEvent.click(queryByText("January"));

        await waitFor(() => queryByText("February"));
        fireEvent.click(queryByText("February"));

        await waitFor(() => queryByText("December"));
        fireEvent.click(queryByText("December"));

        await waitFor(() => queryByText("November"));
        fireEvent.click(queryByText("November"));

        await waitFor(() => queryByText("October"));
        fireEvent.click(queryByText("October"));

        await waitFor(() => queryByText("September"));
        fireEvent.click(queryByText("September"));

        fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

        const removeIconElement = container.querySelectorAll(".react-select__multi-value__remove");
        // remove november
        fireEvent.click(removeIconElement[4]);

        expect(queryByText("January")).toBeInTheDocument();
        expect(queryByText("February")).toBeInTheDocument();
        expect(queryByText("December")).toBeInTheDocument();
        expect(queryByText("November")).not.toBeInTheDocument();
        expect(queryByText("October")).not.toBeInTheDocument();
        expect(queryByText("September")).not.toBeInTheDocument();
    });

    test("should remove bottom range because it is smaller top", async () => {
        const {view, props} = setup();
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("January"));
        fireEvent.click(queryByText("January"));

        await waitFor(() => queryByText("February"));
        fireEvent.click(queryByText("February"));

        await waitFor(() => queryByText("December"));
        fireEvent.click(queryByText("December"));

        await waitFor(() => queryByText("November"));
        fireEvent.click(queryByText("November"));

        await waitFor(() => queryByText("October"));
        fireEvent.click(queryByText("October"));

        await waitFor(() => queryByText("September"));
        fireEvent.click(queryByText("September"));

        fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

        const removeIconElement = container.querySelectorAll(".react-select__multi-value__remove");
        // remove december
        fireEvent.click(removeIconElement[5]);

        expect(queryByText("January")).not.toBeInTheDocument();
        expect(queryByText("February")).not.toBeInTheDocument();
        expect(queryByText("December")).not.toBeInTheDocument();
        expect(queryByText("November")).toBeInTheDocument();
        expect(queryByText("October")).toBeInTheDocument();
        expect(queryByText("September")).toBeInTheDocument();
    });

    test("should not remove any range when removed month is first entry", async () => {
        const {view, props} = setup();
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("January"));
        fireEvent.click(queryByText("January"));

        await waitFor(() => queryByText("February"));
        fireEvent.click(queryByText("February"));

        await waitFor(() => queryByText("December"));
        fireEvent.click(queryByText("December"));

        await waitFor(() => queryByText("November"));
        fireEvent.click(queryByText("November"));

        await waitFor(() => queryByText("October"));
        fireEvent.click(queryByText("October"));

        await waitFor(() => queryByText("September"));
        fireEvent.click(queryByText("September"));

        fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

        const removeIconElement = container.querySelectorAll(".react-select__multi-value__remove");
        // remove September
        fireEvent.click(removeIconElement[2]);

        expect(queryByText("January")).toBeInTheDocument();
        expect(queryByText("February")).toBeInTheDocument();
        expect(queryByText("December")).toBeInTheDocument();
        expect(queryByText("November")).toBeInTheDocument();
        expect(queryByText("October")).toBeInTheDocument();
        expect(queryByText("September")).not.toBeInTheDocument();
    });

    test("should not remove any range when removed month is last entry", async () => {
        const {view, props} = setup();
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("January"));
        fireEvent.click(queryByText("January"));

        await waitFor(() => queryByText("February"));
        fireEvent.click(queryByText("February"));

        await waitFor(() => queryByText("December"));
        fireEvent.click(queryByText("December"));

        await waitFor(() => queryByText("November"));
        fireEvent.click(queryByText("November"));

        await waitFor(() => queryByText("October"));
        fireEvent.click(queryByText("October"));

        await waitFor(() => queryByText("September"));
        fireEvent.click(queryByText("September"));

        fireEvent.keyDown(container.firstChild.firstChild, {key: "Escape"});

        const removeIconElement = container.querySelectorAll(".react-select__multi-value__remove");
        // remove February
        fireEvent.click(removeIconElement[1]);

        expect(queryByText("January")).toBeInTheDocument();
        expect(queryByText("February")).not.toBeInTheDocument();
        expect(queryByText("December")).toBeInTheDocument();
        expect(queryByText("November")).toBeInTheDocument();
        expect(queryByText("October")).toBeInTheDocument();
        expect(queryByText("September")).toBeInTheDocument();
    });
});

test("should show error", () => {
    setup({
        error: "Error message 01"
    });
    const {queryByText} = screen;

    expect(queryByText("Error message 01")).toBeInTheDocument();
});
