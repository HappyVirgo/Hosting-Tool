import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import SelectLanguages from "@/admin/components/SelectLanguages";

const setup = bindings => {
    const props = {
        selectedValues: {},
        isDisabled: false,
        isMulti: true,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectLanguages {...props} />);

    return {
        view,
        props
    };
};

test("should call `onSelectedOption` props when select new language", async () => {
    const { view, props } = setup();
    const { container } = view;
    const { queryByText } = screen;

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("English"));
    fireEvent.click(queryByText("English"));

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Deutsch"));
    fireEvent.click(queryByText("Deutsch"));

    expect(queryByText("English")).toBeInTheDocument();
    expect(queryByText("Deutsch")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith([
        {label: "English", value: "en"},
        {label: "Deutsch", value: "de"}
    ]);
});

test('should only select option available', async () => {
    const selectedValues = {
        da: "Dansk",
        de: "Deutsch",
        en: "English",
        fake: "Fake",
    }

    setup({
        selectedValues,
    });
    const { queryByText } = screen;

    expect(queryByText("Dansk")).toBeInTheDocument();
    expect(queryByText("Deutsch")).toBeInTheDocument();
    expect(queryByText("English")).toBeInTheDocument();
    expect(queryByText("Fake")).not.toBeInTheDocument();
});

test('should select first option when it is not multi',async () => {
    const { view, props } = setup({
        isMulti: false,
    });
    const { container } = view;
    const { queryByText } = screen;

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("English"));
    fireEvent.click(queryByText("English"));

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Deutsch"));
    fireEvent.click(queryByText("Deutsch"));

    expect(queryByText("English")).not.toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({label: "Deutsch", value: "de"});
});
