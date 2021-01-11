import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";

import ModalAddAccount from "../admin/components/ModalAddAccount";

jest.mock("../admin/providers/UserProvider", () => {
    const UserContext = jest.requireActual("react").createContext({
        user: {},
        updateUser: jest.fn()
    });

    return {
        __esModule: true,
        UserContext,
        UserConsumer: UserContext.Consumer
    };
});

const setup = overrides => {
    const props = {
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<ModalAddAccount {...props} />);

    return {
        wrapper,
        props
    };
};

describe("ModalAddAccount", () => {
    [
        ["Airbnb", "Link Airbnb Account"],
        ["HomeAway", "Link VRBO Account"],
        ["August", "Link August Account"]
    ].forEach(([type, header]) => {
        test(`should show modal link ${type}`, () => {
            jest.useFakeTimers();

            setup({
                show: true,
                credentials: {
                    type
                }
            });

            jest.runAllTimers();

            expect(screen.queryByText(header)).toBeInTheDocument();
        });
    });

    test("should show error without selecting a channel", () => {
        setup({
            show: true,
            credentials: {
                type: ""
            }
        });

        fireEvent.click(screen.getByText("Next"));

        expect(screen.queryByText("Please select a channel.")).toBeInTheDocument();
    });

    [
        ["airbnb-checkbox", "Link Airbnb Account"],
        ["aribnb-logo-wrapper", "Link Airbnb Account"],
        ["homeaway-checkbox", "Link VRBO Account"],
        ["homeaway-logo-wrapper", "Link VRBO Account"]
    ].forEach(([selector, result]) => {
        test(`should display ${result} as click on ${
            /checkbox$/.test(selector) ? "checkbox" : "wrapper"
        }`, () => {
            setup({
                show: true,
                credentials: {
                    type: ""
                }
            });

            fireEvent.click(screen.queryByTestId(selector));
            fireEvent.click(screen.queryByText("Next"));

            expect(screen.queryByText(result)).toBeInTheDocument();
        });
    });
});
