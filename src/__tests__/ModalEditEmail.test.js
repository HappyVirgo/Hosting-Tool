import React from "react";
import {render, screen, waitForElementToBeRemoved, waitFor} from "@testing-library/react";

import {waiit, changeInput, clickButton} from "../testUtils";
import ModalEditEmail from "../admin/components/ModalEditEmail";

const setup = overrides => {
    const props = {
        show: true,
        editEmail: {
            email: "test@gmail.com"
        },
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<ModalEditEmail {...props} />);

    return {
        wrapper,
        props
    };
};

describe("ModalEditEmail", () => {
    test("should show the modal info", () => {
        setup();

        expect(screen.queryByText("Edit Email")).toBeInTheDocument();
    });

    test("should show error as change to invalid email", () => {
        setup();

        changeInput("Email", "baz");
        clickButton();

        expect(screen.queryByText("Please enter a valid email address.")).toBeInTheDocument();
    });

    test("should show error as change to empty email", () => {
        setup();

        changeInput("Email", "");
        clickButton();

        expect(screen.queryByText("Please enter an email address.")).toBeInTheDocument();
    });

    test("should submit successfully (type email)", async () => {
        const {props} = setup();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        changeInput("Email", "test@gmail.com");
        clickButton();

        await waiit();

        expect(global.fetch).toHaveBeenCalledWith(
            "/editAccountEmail",
            expect.objectContaining({
                body: JSON.stringify({
                    email: "test@gmail.com"
                }),
                method: "POST"
            })
        );
        expect(props.onHide).toHaveBeenCalled();
    });

    test("should submit successfully (type user)", async () => {
        const {props} = setup({
            editEmail: {
                email: "test@gmail.com",
                type: "user"
            }
        });

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        changeInput("Email", "test@gmail.com");
        clickButton();

        await waiit();

        expect(global.fetch).toHaveBeenCalledWith(
            "/editUserEmail",
            expect.objectContaining({
                body: JSON.stringify({
                    email: "test@gmail.com",
                    type: "user"
                }),
                method: "POST"
            })
        );
        expect(props.onHide).toHaveBeenCalled();
    });

    test("should fail to submit", async () => {
        setup({
            editEmail: {
                email: "test@gmail.com",
                type: "user"
            }
        });

        const message = "something went wrong";
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockReturnValue({
                error: message
            })
        });

        changeInput("Email", "test@gmail.com");
        clickButton();

        await waitFor(() => screen.queryByText(message));

        expect(screen.queryByText(message)).toBeInTheDocument();
    });

    test("should fail to submit (500 error)", async () => {
        setup();

        global.fetch = jest.fn().mockRejectedValue(500);

        changeInput("Email", "test@gmail.com");
        clickButton("Save");

        const spinner = screen.queryByTestId("spinner");
        expect(spinner).toBeInTheDocument();

        await waitForElementToBeRemoved(spinner);
    });
});
