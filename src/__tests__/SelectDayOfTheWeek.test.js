import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectDayOfTheWeek from "../admin/components/SelectDayOfTheWeek";

const setup = bindings => {
    const props = {
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectDayOfTheWeek {...props} />);

    return {
        view,
        props
    };
};

test("should show `On Monday` option by default when has no selected value", async () => {
    setup();
    const {queryByText} = screen;

    expect(queryByText("On Monday")).toBeInTheDocument();
});

test("should change option when selected value change", () => {
    const {view, props} = setup();
    const {rerender} = view;
    const {queryByText} = screen;

    rerender(<SelectDayOfTheWeek {...props} selectedValue="tuesday" />);
    expect(queryByText("On Tuesday")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when select new day", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("On Tuesday"));
    fireEvent.click(queryByText("On Tuesday"));

    expect(queryByText("On Tuesday")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
        label: "On Tuesday",
        value: "tuesday"
    });
});
