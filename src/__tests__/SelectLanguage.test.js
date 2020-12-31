import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import SelectLanguage from "@/admin/components/SelectLanguage";

const setup = bindings => {
    const props = {
        languageValues: {
            da: "Dansk",
            de: "Deutsch",
            en: "English",
            fake: "Fake",
        },
        isDisabled: false,
        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectLanguage {...props} />);

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

    expect(queryByText("English")).toBeInTheDocument();
    expect(props.onSelectedOption).toHaveBeenCalledWith({
      value: "en", label: "English",
  });
});

test('should only list language available', async () => {
    const { view } = setup();
    const { container } = view;
    const { queryByText, queryAllByText } = screen;

    fireEvent.keyDown(container.firstChild.firstChild, {key: "ArrowDown"});

    expect(queryAllByText("Dansk")[1]).toBeInTheDocument();
    expect(queryByText("Deutsch")).toBeInTheDocument();
    expect(queryByText("English")).toBeInTheDocument();
    expect(queryByText("Fake")).not.toBeInTheDocument();
});

test('should select first options by default', () => {
    setup();
    const { queryByText } = screen;

    expect(queryByText("Dansk")).toBeInTheDocument();
});
