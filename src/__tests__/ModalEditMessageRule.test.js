/* eslint react/prop-types: 0 */
/* eslint react/destructuring-assignment: 0 */
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";

import {changeInput, clickButton, clickOnLabel} from "../testUtils";
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
        <div>
            {props.messages.default && (
                <div data-testid={`message-${props.label}`}>{props.messages.default}</div>
            )}
            {props.error && <div>{props.error}</div>}
            <input
                id={`id-${props.label}`}
                aria-label={`${props.label}`}
                type="text"
                onChange={e => {
                    props.onChange(e.target.value, "vi");
                }}
            />
        </div>
    )
}));

const SelectMock = props => (
    <div>
        {props.selectedValue && <div>{props.selectedValue}</div>}
        <div>{props.selectedValues && <p>{Object.values(props.selectedValues).join(",")}</p>}</div>
        {props.error && <div>{props.error}</div>}
        <input
            id={props.id}
            aria-label={`label for ${props.id}`}
            type="text"
            onChange={e => {
                props.onSelectedOption(e.target.data);
            }}
        />
    </div>
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

jest.mock("../admin/components/SelectLanguages", () => ({
    __esModule: true,
    default: SelectMock
}));

jest.mock("../admin/components/SelectLimitDays", () => ({
    __esModule: true,
    default: SelectMock
}));

jest.mock("../admin/components/SelectTime", () => ({
    __esModule: true,
    default: SelectMock
}));

jest.mock("../admin/components/SelectMessageTemplates", () => ({
    __esModule: true,
    default: props => (
        <div>
            {props.selectedValue && <div>{props.selectedValue}</div>}
            <input
                id={props.id}
                aria-label={`label for ${props.id}`}
                type="text"
                onChange={e => {
                    props.onSelectedTemplate(e.target.data);
                }}
            />
        </div>
    )
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
    sendMessageAfterLeavingReview: false,
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

const setup = (overrides, resolve = true) => {
    const props = {
        show: true,
        airbnbUserID: "airbnbUserID",
        listing: {},
        messageRule: baseMessageRule,

        onHide: jest.fn(),

        ...overrides
    };

    global.fetch = resolve
        ? jest.fn().mockResolvedValueOnce({
              ok: true,
              json: jest.fn().mockResolvedValue([])
          })
        : jest.fn().mockRejectedValue();

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

const waitForTitleRendered = (title = "Edit Message Rule") =>
    waitFor(() => expect(screen.queryByText(title)).toBeInTheDocument());

describe("ModalEditMessageRule", () => {
    test("should open the modal for the new one", async () => {
        setup();

        const title = screen.queryByText("Add New Message Rule");
        await waitFor(() => expect(title).toBeInTheDocument());
    });

    test("should clean up for existing one properly", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "any",
                message: "my message",
                messages: "my messages",
                lastMinuteMessage: "my last minute message",
                lastMinuteMessages: "my last minute messages",
                reviewMessage: "my review message",
                lastMinuteMessageEnabled: true,
                lastMinuteMessageIsTheSame: false
            }
        });

        await waitFor(() => expect(screen.queryByText("Edit Message Rule")).toBeInTheDocument());
    });

    test("should clean up for existing one properly with different data", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "inquiry",
                smsEnabled: true,
                message: "my message",
                lastMinuteMessage: "my last minute message",
                reviewMessage: "my review message",
                lastMinuteMessageEnabled: true,
                lastMinuteMessageIsTheSame: true
            }
        });

        await waitFor(() => expect(screen.queryByText("Edit Message Rule")).toBeInTheDocument());

        expect(screen.queryByText("Automatically pre-approve the guest")).toBeInTheDocument();
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

    describe("handleSelectedOption `languages`", () => {
        const mount = value =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    emailEnabled: false,
                    smsEnabled: false,
                    languagesEnabled: true,
                    lastMinuteMessageEnabled: true,
                    message: value,
                    messages: {
                        default: value
                    },
                    lastMinuteMessage: value,
                    lastMinuteMessages: {
                        default: value
                    }
                }
            });

        test("should change languages `handleSelectedOption` (value as string)", async () => {
            mount("Vietnamese");

            await waitForTitleRendered();

            expect(screen.queryByLabelText("Languages")).toBeInTheDocument();

            changeInput("Languages", [
                {
                    value: "default"
                }
            ]);

            await waitFor(() =>
                expect(
                    screen.queryByText("Vietnamese", {
                        selector: "p"
                    })
                ).toBeInTheDocument()
            );
        });

        test("should change languages `handleSelectedOption` (value as non-string)", async () => {
            mount();

            await waitForTitleRendered();

            expect(screen.queryByLabelText("Languages")).toBeInTheDocument();
            expect(screen.queryByLabelText("Review")).toBeInTheDocument();

            changeInput("Languages", [
                {
                    value: "default"
                }
            ]);

            await waitFor(() =>
                expect(screen.queryByTestId("message-Review")).not.toBeInTheDocument()
            );
        });
    });

    test("should change limitDays `handleSelectedOption`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                isLimited: true,
                limitDays: 10
            }
        });

        await waitFor(() => expect(screen.queryByText("Edit Message Rule")).toBeInTheDocument());

        expect(screen.queryByLabelText("Days of the week")).toBeInTheDocument();

        changeInput("Days of the week", [
            {
                value: "10 days"
            }
        ]);

        await waitFor(() => expect(screen.queryByText("true")).toBeInTheDocument());
    });

    test("should change delay `handleSelectedOption`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "checkinChanged"
            }
        });

        await waitForTitleRendered();

        expect(screen.queryByLabelText("Delay")).toBeInTheDocument();

        changeInput("Delay", {
            label: "Delay",
            value: "Delay value"
        });

        await waitFor(() => expect(screen.queryByText("Delay value")).toBeInTheDocument());
    });

    test("should toggle `smsEnabled`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                emailEnabled: true
            }
        });

        await waitFor(() =>
            expect(
                screen.queryByLabelText("Send as an email and not to the guest")
            ).toBeInTheDocument()
        );

        const text = "Email Address";

        expect(screen.queryByText(text)).toBeInTheDocument();
        clickOnLabel("Send as an SMS and not to the guest");
        expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    test("should toggle `emailEnabled`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                smsEnabled: true
            }
        });

        const ruleName = screen.queryByLabelText("Send as an email and not to the guest");

        await waitFor(() => expect(ruleName).toBeInTheDocument());

        const text = "Phone Number";

        expect(screen.queryByText(text)).toBeInTheDocument();
        clickOnLabel("Send as an email and not to the guest");
        expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    test("should toggle `reviewEnabled`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "checkout",
                days: 1,
                emailEnabled: false,
                smsEnabled: false
            }
        });

        const label = "Leave guest a 5 star review";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        const text = "Review";
        expect(screen.queryByLabelText(text)).toBeInTheDocument();
        clickOnLabel(label);
        expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    test("should toggle `sendMessageAfterLeavingReview`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "checkout",
                days: 1,
                emailEnabled: false,
                smsEnabled: false
            }
        });

        const label = "Send the guest a message after leaving a review";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        clickOnLabel(label);
    });

    test("should toggle `languagesEnabled`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                emailEnabled: false,
                smsEnabled: false,
                languagesEnabled: true
            }
        });

        const label = "Send a different message depending on the guest's preferred language";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        const text = "Languages";
        expect(screen.queryByLabelText(text)).toBeInTheDocument();
        clickOnLabel(label);
        expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    test("should toggle `disableMessageAfterReview`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "checkout",
                days: 1,
                emailEnabled: false,
                smsEnabled: false,
                disableMessageAfterReview: true,
                reviewEnabled: true
            }
        });

        const label = "Don't send this message if guest has left a review.";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        clickOnLabel(label);

        expect(screen.queryByLabelText(label).checked).toBeTruthy();
    });

    test("should toggle `preapprove`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "inquiry"
            }
        });

        const label = "Automatically pre-approve the guest";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        clickOnLabel(label);

        expect(screen.queryByLabelText(label).checked).toBeTruthy();
    });

    test("should toggle `accept`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "pending"
            }
        });

        const label = "Automatically accept booking requests";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        clickOnLabel(label);

        expect(screen.queryByLabelText(label).checked).toBeTruthy();
    });

    test("should toggle `disableIfLastMinute`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "booking"
            }
        });

        const label = "Don't send this message if a last-minute message is sent";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        clickOnLabel(label);

        expect(screen.queryByLabelText(label).checked).toBeTruthy();
    });

    test("should toggle `lastMinuteMessageEnabled`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "checkin",
                days: -1,
                emailEnabled: false,
                smsEnabled: false,
                eventFormatted: "baz"
            }
        });

        const label = "Enable last-minute booking baz message.";
        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        clickOnLabel(label);

        expect(screen.queryByLabelText(label).checked).toBeTruthy();
    });

    test("should change `email`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                emailEnabled: true
            }
        });

        const label = "Email Address";
        const newValue = "test1@gmail.com";

        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        changeInput(label, newValue);

        expect(screen.queryByLabelText(label).value).toBe(newValue);
    });

    test("should change rule title", async () => {
        setup();

        const label = "Rule Name";
        const newValue = "New rule";

        await waitFor(() => expect(screen.queryByLabelText(label)).toBeInTheDocument());

        changeInput(label, newValue);

        expect(screen.queryByLabelText(label).value).toBe(newValue);
    });

    test("should change reviewMessages `isReviewPossible = true`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                event: "checkout",
                days: 1,
                emailEnabled: false,
                smsEnabled: false
            }
        });

        await waitForTitleRendered();

        const label = "Leave guest a 5 star review";
        const newValue = "New review value";

        expect(screen.queryByLabelText(label)).toBeInTheDocument();

        changeInput(label);
        changeInput("Review", newValue);

        expect(screen.queryByLabelText(label).checked).toBeTruthy();
        expect(screen.queryByLabelText("Review").value).toBe(newValue);
    });

    test("should change template `handleTemplateChange`", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1"
            }
        });

        await waitForTitleRendered();

        expect(screen.queryByText("custom")).toBeInTheDocument();

        changeInput("Message Templates", {
            event: "any"
        });

        await waitFor(() => expect(screen.queryByText("17")).toBeInTheDocument());
    });

    test("should show require title field", async () => {
        setup({
            messageRule: {
                ...baseMessageRule,
                _id: "1",
                smsEnabled: false,
                reviewEnabled: false
            }
        });

        await waitForTitleRendered();

        clickButton("Save");

        await waitFor(() =>
            expect(screen.queryByText("Missing message rule title.")).toBeInTheDocument()
        );
    });

    describe("Validate `email`", () => {
        const mount = email =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    title: "Title",
                    emailEnabled: true,
                    email
                }
            });

        test("should show invalid emails", async () => {
            mount("test@gmail.com,test1");

            await waitForTitleRendered();

            clickButton("Save");

            await waitFor(() =>
                expect(
                    screen.queryByText(/Please enter a valid email address/i)
                ).toBeInTheDocument()
            );
        });
    });

    describe("Validate `sms`", () => {
        const mount = sms =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    title: "Title",
                    emailEnabled: false,
                    smsEnabled: true,
                    sms
                }
            });

        test("should show required sms", async () => {
            mount("");

            await waitForTitleRendered();

            clickButton("Save");

            await waitFor(() =>
                expect(screen.queryByText("Please enter a phone number.")).toBeInTheDocument()
            );
        });

        test("should show invalid number phone", async () => {
            mount("+84917233731");

            await waitForTitleRendered();

            clickButton("Save");

            await waitFor(() =>
                expect(
                    screen.queryByText(
                        "Please enter a valid United States or Canadian phone number."
                    )
                ).toBeInTheDocument()
            );
        });
    });

    describe("Validate `reviewMessages`", () => {
        const render = message =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    title: "Title",
                    emailEnabled: false,
                    reviewEnabled: true,
                    reviewMessages: {
                        default: message
                    }
                }
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
        ].forEach(([messageType, result]) => {
            test(`should show invalid "reviewMessages" field (contains "${messageType}")`, async () => {
                render(messageType);

                await waitForTitleRendered();

                clickButton("Save");

                await waitFor(() =>
                    expect(screen.queryByText(new RegExp(result), "i")).toBeInTheDocument()
                );
            });
        });
    });

    describe("Validate `lastMinuteMessages`", () => {
        const render = message =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    title: "Title",
                    event: "checkin",
                    days: -1,
                    emailEnabled: false,
                    reviewEnabled: false,
                    languagesEnabled: true,
                    lastMinuteMessageEnabled: true,
                    message: "my message",
                    lastMinuteMessage: "",
                    reviewMessage: "my review message",
                    lastMinuteMessages: {
                        en: message
                    }
                }
            });

        test('should show invalid "lastMinuteMessages" field', async () => {
            render("");

            await waitForTitleRendered();

            clickButton("Save");

            await waitFor(() =>
                expect(
                    screen.queryByText("You forgot to add text to the English last-minute message!")
                ).toBeInTheDocument()
            );
        });
    });

    describe("Validate `isLimited`", () => {
        const render = () =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    title: "Title",
                    event: "checkin",
                    days: -1,
                    emailEnabled: false,
                    reviewEnabled: false,
                    lastMinuteMessageEnabled: false,
                    isLimited: true,
                    limitDays: {}
                }
            });

        test('should show invalid "isLimited" field', async () => {
            render();

            await waitForTitleRendered();

            clickButton("Save");

            await waitFor(() =>
                expect(
                    screen.queryByText(
                        "Please select at least one day of the week that the check-in or check-out should fall on to send the message."
                    )
                ).toBeInTheDocument()
            );
        });
    });

    describe("`handleSubmit`", () => {
        const render = () =>
            setup({
                messageRule: {
                    ...baseMessageRule,
                    _id: "1",
                    title: "Title",
                    event: "checkin",
                    days: -1,
                    emailEnabled: true,
                    email: "test@gmail.com",
                    reviewEnabled: true,
                    lastMinuteMessageEnabled: true,
                    message: "my message",
                    lastMinuteMessage: "",
                    reviewMessage: "my review message",
                    lastMinuteMessages: {
                        default: "my last minute message"
                    }
                }
            });

        test("should submit successfully", async () => {
            const {props} = render();

            await waitForTitleRendered();

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({})
            });

            clickButton("Save");

            await waitFor(() => expect(props.onHide).toHaveBeenCalled());

            expect(global.fetch).toHaveBeenCalledWith(
                "/addMessageRule",
                expect.objectContaining({
                    body: JSON.stringify({
                        title: "Title",
                        time: 17,
                        days: -1,
                        event: "checkin",
                        reservationLength: 1,
                        messages: {
                            default: "my message"
                        },
                        lastMinuteMessageEnabled: true,
                        lastMinuteMessageIsTheSame: false,
                        lastMinuteMessages: {
                            default: "my last minute message"
                        },
                        reviewEnabled: true,
                        reviewMessages: {
                            default: "my review message"
                        },
                        sendMessageAfterLeavingReview: false,
                        disableMessageAfterReview: true,
                        emailEnabled: true,
                        email: "test@gmail.com",
                        smsEnabled: false,
                        sms: "",
                        preapprove: false,
                        languagesEnabled: false,
                        _id: "1",
                        lastMinuteMessage: "",
                        airbnbUserID: "airbnbUserID"
                    }),
                    method: "POST"
                })
            );
        });

        test("should fail to submit", async () => {
            render();

            await waitForTitleRendered();

            const error = "something went wrong";
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: jest.fn().mockResolvedValue({
                    error
                })
            });

            clickButton("Save");

            await waitFor(() => expect(screen.queryByText(error)).toBeInTheDocument());
        });

        test("should reject to submit", async () => {
            render();

            await waitForTitleRendered();

            global.fetch = jest.fn().mockRejectedValue({});

            clickButton("Save");

            await waitFor(() => expect(screen.queryByTestId("spinner")).toBeInTheDocument());
        });
    });
});
