import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";

import {changeInput, clickButton} from "../testUtils";
import ModalTag from "../admin/components/ModalTag";

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
            <div>{props.error}</div>
            <input
                aria-label={props.label}
                type="text"
                value=""
                onChange={e => {
                    props.onChange(e.target.value);
                }}
            />
        </>
    )
}));

const setup = overrides => {
    const props = {
        show: false,
        tag: {
            name: "Tag A Name",
            text: "Tag A Text"
        },

        onChange: jest.fn(),
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(
        <MemoryRouter>
            <ModalTag {...props} />
        </MemoryRouter>
    );

    return {
        wrapper,
        props
    };
};

const rerender = (wrapper, props) =>
    wrapper.rerender(
        <MemoryRouter>
            <ModalTag {...props} show />
        </MemoryRouter>
    );

describe("ModalTag", () => {
    test("should open the modal without warnings", () => {
        const {wrapper, props} = setup();

        rerender(wrapper, props);

        expect(screen.queryByText("Custom Message Tag")).toBeInTheDocument();
        expect(screen.queryByText("Tag A Text")).toBeInTheDocument();
        expect(screen.queryByLabelText("Name").value).toBe("Tag A Name");
        expect(screen.queryByText("Warning: ")).not.toBeInTheDocument();
    });

    [
        [
            "{{Previous Check-In Date}}",
            "The {{Previous Check-In Date}} tag will not populate unless you use the 'Check-In Changed' event."
        ],
        [
            "{{Previous Number of Nights}}",
            "The {{Previous Number of Nights}} tag will not populate unless you use the 'Check-In Changed' or 'Check-Out Changed' events."
        ],
        [
            "{{Previous Check-Out Date}}",
            "The {{Previous Check-Out Date}} tag will not populate unless you use the 'Check-Out Changed' event."
        ],
        [
            "{{Previous Number of Guests}}",
            "The {{Previous Number of Guests}} tag will not populate unless you use the 'Number of Guests Changed' event."
        ]
    ].forEach(([text, warning]) => {
        test(`should open the modal with "${text}" warning`, () => {
            const {wrapper, props} = setup({
                tag: {
                    name: "Tag A Name",
                    text
                }
            });

            rerender(wrapper, props);

            expect(screen.queryByLabelText("Name").value).toBe("Tag A Name");
            expect(screen.queryByText(warning)).toBeInTheDocument();
        });
    });

    test("should change tag name", () => {
        const {wrapper, props} = setup();

        rerender(wrapper, props);

        const tagName = "New Tag Name";

        changeInput("Name", tagName);

        expect(screen.queryByLabelText("Name").value).toBe(tagName);
    });

    test("should change tag text", () => {
        const {wrapper, props} = setup();

        rerender(wrapper, props);

        const newMessage = "new message";

        changeInput("Tag Text", newMessage);

        expect(screen.queryByText(newMessage)).toBeInTheDocument();
    });

    test("should validate name", () => {
        const {wrapper, props} = setup({
            tag: {
                name: "",
                text: "Tag Text"
            }
        });

        rerender(wrapper, props);

        clickButton("Save");

        expect(screen.queryByText("Please add a tag name.")).toBeInTheDocument();
    });

    test("should validate text", () => {
        const {wrapper, props} = setup({
            tag: {
                name: "Tag Name",
                text: ""
            }
        });

        rerender(wrapper, props);

        clickButton("Save");

        expect(screen.queryByText("Please add some tag text.")).toBeInTheDocument();
    });

    test("should submit successfully", async () => {
        const {wrapper, props} = setup({
            tag: {
                _id: "1",
                name: "Tag Name",
                text: "Tag Text"
            }
        });

        rerender(wrapper, props);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        clickButton("Save");

        await waitFor(() => expect(props.onHide).toHaveBeenCalled());

        expect(global.fetch).toHaveBeenCalledWith(
            "/addTag",
            expect.objectContaining({
                body: JSON.stringify({
                    name: props.tag.name,
                    text: props.tag.text,
                    _id: "1"
                }),
                method: "POST"
            })
        );
    });

    test("should fail to submit", async () => {
        const {wrapper, props} = setup();

        rerender(wrapper, props);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({})
        });
        jest.spyOn(console, "log");

        clickButton("Save");

        await waitFor(() => expect(console.log).toHaveBeenCalled());
    });

    test("should reject to submit", async () => {
        const {wrapper, props} = setup();

        rerender(wrapper, props);

        global.fetch = jest.fn().mockRejectedValue("500");
        jest.spyOn(console, "log");

        clickButton("Save");

        await waitFor(() => expect(console.log).toHaveBeenCalled());
    });
});
