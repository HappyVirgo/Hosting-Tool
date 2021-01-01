import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";

import {changeInput} from "../testUtils";
import ModalEditMessageRule from "../admin/components/ModalEditMessageRule";

jest.mock("../admin/providers/UserProvider", () => {
    const UserContext = jest.requireActual("react").createContext({
        user: {
            tags: []
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
            <label>{props.messages.default}</label>
            <label>{props.error}</label>
            <input
                data-testid="input-message"
                aria-label="Input message"
                type="text"
                value=""
                onChange={e => {
                    props.onChange(e.target.value);
                }}
            />
        </>
    )
}));

const SelectMock = props => (
    <>
        {props.selectedValue && <label>{props.selectedValue}</label>}
        <input
            id={props.id}
            aria-label={`label for ${props.id}`}
            type="text"
            onChange={e => {
                props.onSelectedOption(e.target.data);
            }}
        />
    </>
);

jest.mock("../admin/components/SelectDays", () => ({
    __esModule: true,
    default: SelectMock
}));

jest.mock("../admin/components/SelectEvent", () => ({
    __esModule: true,
    default: SelectMock
}));

jest.mock("../admin/components/SelectDelay", () => ({
    __esModule: true,
    default: SelectMock
}));

const baseMessageRule = {
    title: "",
    time: 17,
    days: -2,
    event: "checkout",
    reservationLength: 1,
    messages: {default: ""},
    lastMinuteMessageEnabled: false,
    lastMinuteMessageIsTheSame: false,
    lastMinuteMessages: {default: ""},
    reviewEnabled: true,
    reviewMessages: {default: ""},
    sendMessageAfterLeavingReview: true,
    disableMessageAfterReview: true,
    emailEnabled: true,
    email: "",
    smsEnabled: false,
    sms: "",
    delay: 0,
    preapprove: false,
    limitDays: {},
    limitEvent: "checkout",
    languagesEnabled: false
};

const setup = overrides => {
    const props = {
        show: true,
        airbnbUserID: "airbnbUserID",
        listing: {},
        messageRule: baseMessageRule,

        onHide: jest.fn(),

        ...overrides
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([])
    });

    const wrapper = render(
        <MemoryRouter>
            <ModalEditMessageRule {...props} />
        </MemoryRouter>
    );

    return {
        wrapper,
        props
    };
};

describe("ModalEditMessageRule", () => {
    test("should open the modal with new one", async () => {
        setup();

        const title = screen.queryByText("Add New Message Rule");
        await waitFor(() => expect(title).toBeInTheDocument());
    });

    test("should open the modal with existing one", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1"
            }
        });

        await waitFor(() => expect(screen.queryByText("Edit Message Rule")).toBeInTheDocument());
    });

    test("should change days/event/delay successfully", async () => {
        setup({
            messageRule: {
                ...baseMessageRule
            }
        });

        const title = screen.queryByText("Add New Message Rule");
        await waitFor(() => expect(title).toBeInTheDocument());

        expect(screen.queryByLabelText("Days")).toBeInTheDocument();
        expect(screen.queryByLabelText("Event")).toBeInTheDocument();
        expect(screen.queryByLabelText("Delay")).not.toBeInTheDocument();

        changeInput("Days", {
            label: "days",
            value: 100
        });
        expect(screen.queryByText("100")).toBeInTheDocument();

        changeInput("Event", {
            label: "event",
            value: "checkoutChanged"
        });

        await waitFor(() => expect(screen.queryByLabelText("Delay")).toBeInTheDocument());
    });
});
