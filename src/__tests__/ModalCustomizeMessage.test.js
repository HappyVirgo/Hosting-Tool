import React from "react";
import {render, screen, fireEvent, waitForElementToBeRemoved} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";

import ModalCustomizeMessage from "../admin/components/ModalCustomizeMessage";

jest.mock("../admin/providers/UserProvider", () => {
    const UserContext = jest.requireActual("react").createContext({
        user: {
            tags: [
                {
                    name: "baz"
                }
            ]
        },
        updateUser: jest.fn()
    });

    return {
        __esModule: true,
        UserContext,
        UserConsumer: UserContext.Consumer
    };
});

jest.mock("../admin/components/TextareaWithTags", () => ({
    __esModule: true,
    default: props => (
        <>
            <div>{props.messages.default}</div>
            <input
                data-testid="input-message"
                aria-label="Input message"
                type="text"
                value=""
                onChange={e => {
                    props.onChange(e.target.value);
                }}
            />
            <label>{props.error}</label>
        </>
    )
}));

const setup = overrides => {
    const props = {
        show: false,
        messageRuleMessage: "my message",
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(
        <MemoryRouter>
            <ModalCustomizeMessage {...props} />
        </MemoryRouter>
    );

    return {
        wrapper,
        props
    };
};

describe("ModalCustomizeMessage", () => {
    test("should open the modal", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(
            <MemoryRouter>
                <ModalCustomizeMessage {...props} show />
            </MemoryRouter>
        );

        expect(screen.queryByText("Customize Message")).toBeInTheDocument();
    });

    test("should change the message successfully", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(
            <MemoryRouter>
                <ModalCustomizeMessage {...props} show />
            </MemoryRouter>
        );

        const newMessage = "new message";
        fireEvent.change(screen.queryByLabelText("Input message"), {
            target: {value: newMessage}
        });

        expect(screen.queryByText(newMessage)).toBeInTheDocument();
    });

    test("should submit the message successfully", async () => {
        const {wrapper, props} = setup();

        wrapper.rerender(
            <MemoryRouter>
                <ModalCustomizeMessage {...props} show />
            </MemoryRouter>
        );

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        fireEvent.click(screen.queryByText("Save"));

        const spinner = screen.queryByTestId("spinner");
        expect(spinner).toBeInTheDocument();

        await waitForElementToBeRemoved(spinner);
        expect(props.onHide).toHaveBeenCalled();

        expect(global.fetch).toHaveBeenCalledWith(
            "/customizeMessage",
            expect.objectContaining({
                body: JSON.stringify({
                    message: props.messageRuleMessage,
                    messageRuleMessage: props.messageRuleMessage,
                    messageRuleID: "",
                    airbnbUserID: "",
                    airbnbListingID: "",
                    airbnbConfirmationCode: ""
                }),
                method: "POST"
            })
        );
    });

    test("should fail to submit the message", async () => {
        const {wrapper, props} = setup();

        wrapper.rerender(
            <MemoryRouter>
                <ModalCustomizeMessage {...props} show />
            </MemoryRouter>
        );

        global.fetch = jest.fn().mockRejectedValue("500");

        fireEvent.click(screen.queryByText("Save"));

        const spinner = screen.queryByTestId("spinner");
        expect(spinner).toBeInTheDocument();

        await waitForElementToBeRemoved(spinner);
    });

    test("should reset things", async () => {
        const {wrapper, props} = setup();

        wrapper.rerender(
            <MemoryRouter>
                <ModalCustomizeMessage {...props} show />
            </MemoryRouter>
        );

        const newMessage = "new message";
        fireEvent.change(screen.queryByLabelText("Input message"), {
            target: {value: newMessage}
        });

        fireEvent.click(screen.queryByText("Reset"));

        expect(screen.queryByText(props.messageRuleMessage)).toBeInTheDocument();
    });

    test("should doesn't allow to sumit empty thing", async () => {
        setup({
            show: true,
            messageRuleMessage: ""
        });

        fireEvent.click(screen.queryByText("Save"));

        expect(screen.queryByText("You can't send a blank message.")).toBeInTheDocument();
    });
});
