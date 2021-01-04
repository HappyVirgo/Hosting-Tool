import {screen, fireEvent} from "@testing-library/react";

export const clickButton = (text = "Save", dataTestId = false) => {
    fireEvent.click(
        screen[dataTestId ? "getByTestId" : "getByText"](text, {
            selector: "button"
        })
    );
};

export const changeInput = (label, value) => {
    fireEvent.change(screen.queryByLabelText(label), {
        target: {
            value,
            data: value
        }
    });
};

export const clickOnLabel = label => {
    fireEvent.click(screen.queryByLabelText(label), {checked: true});
};

export const waiit = () => jest.requireActual("promise").resolve();
