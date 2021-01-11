import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

import SelectMessageTags from "../admin/components/SelectMessageTags";

jest.mock("react-router-dom", () => ({
    withRouter: Component => Component
}));

jest.mock("../admin/providers/UserProvider", () => ({
    UserConsumer: ({children}) => {
        const user = {
            accounts: [{}],
            badAccounts: [{}],
            listings: [{}],
            listingGroups: [{}],
            tags: [{name: "Tag 1"}, {name: "Tag 2"}, {name: "Tag 3"}]
        };
        const updateUser = jest.fn();
        const Component = () => <>{children({user, updateUser})}</>;
        Component.displayName = "UserConsumer";
        return <Component />;
    }
}));

const setup = bindings => {
    const props = {
        isDisabled: false,
        event: "checkin",

        onSelectedOption: jest.fn(),
        ...bindings
    };

    const view = render(<SelectMessageTags {...props} />);

    return {
        view,
        props
    };
};

describe("updateOptions", () => {
    test("should add user tags when event are not all value", async () => {
        const {view} = setup();
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

        expect(queryByText("Tag 1")).toBeInTheDocument();
        expect(queryByText("Tag 2")).toBeInTheDocument();
        expect(queryByText("Tag 3")).toBeInTheDocument();
    });

    [
        "checkin",
        "checkout",
        "occupied",
        "booking",
        "checkinChanged",
        "checkoutChanged",
        "numberOfGuestsChanged",
        "cancelled",
        "all"
    ].forEach(event => {
        test(`should add more option when event are ${event}`, () => {
            const {view} = setup({
                event
            });
            const {container} = view;
            const {queryByText} = screen;

            fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

            expect(queryByText("Guest Last Name")).toBeInTheDocument();
            expect(queryByText("Confirmation Code")).toBeInTheDocument();
            expect(queryByText("Guest Phone Number")).toBeInTheDocument();
            expect(queryByText("Guest Phone Number")).toBeInTheDocument();
            expect(queryByText("Guest's Phone Number Custom Length")).toBeInTheDocument();
            expect(queryByText("Guest's Lock Code (Last 4 of Phone Number)")).toBeInTheDocument();
        });
    });

    ["checkinChanged", "all"].forEach(event => {
        test(`should add more option when event are ${event}`, () => {
            const {view} = setup({
                event
            });
            const {container} = view;
            const {queryByText} = screen;

            fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

            expect(queryByText("Previous Check-In Date")).toBeInTheDocument();
        });
    });

    ["checkoutChanged", "all"].forEach(event => {
        test(`should add more option when event are ${event}`, () => {
            const {view} = setup({
                event
            });
            const {container} = view;
            const {queryByText} = screen;

            fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

            expect(queryByText("Previous Check-Out Date")).toBeInTheDocument();
        });
    });

    ["checkinChanged", "checkinChanged", "all"].forEach(event => {
        test(`should add more option when event are ${event}`, () => {
            const {view} = setup({
                event
            });
            const {container} = view;
            const {queryByText} = screen;

            fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

            expect(queryByText("Previous Number of Nights")).toBeInTheDocument();
        });
    });

    ["numberOfGuestsChanged", "all"].forEach(event => {
        test(`should add more option when event are ${event}`, () => {
            const {view} = setup({
                event
            });
            const {container} = view;
            const {queryByText} = screen;

            fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

            expect(queryByText("Previous Number of Guests")).toBeInTheDocument();
        });
    });
});

test("should call `onSelectedOption` props when select new option", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Listing ID"));
    fireEvent.click(queryByText("Listing ID"));

    expect(props.onSelectedOption).toHaveBeenCalledWith({
        label: "Listing ID",
        value: "{{Listing ID}}"
    });
});
