/* eslint react/prop-types: 0 */
/* eslint react/destructuring-assignment: 0 */
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";

import {changeInput, clickButton, clickOnLabel} from "../testUtils";
import ModalListingGroup from "../admin/components/ModalListingGroup";

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

const SelectMock = props => (
    <div>
        <div>{props.options && <p>{props.options.map(elem => elem.source).join(", ")}</p>}</div>
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

jest.mock("../admin/components/SelectListing", () => ({
    __esModule: true,
    default: SelectMock
}));

const setup = overrides => {
    const props = {
        show: false,
        airbnbUserID: "airbnbUserID",
        listings: [],

        updateUser: jest.fn(),
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<ModalListingGroup {...props} />);

    return {
        wrapper,
        props
    };
};

describe("ModalListingGroup", () => {
    test("should open the modal with no `listingGroup`", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(<ModalListingGroup {...props} show />);

        expect(screen.queryByText("Listing Settings")).toBeInTheDocument();
        expect(screen.queryByText("Listing Group Name")).toBeInTheDocument();
        expect(screen.queryByText("Add Listing")).toBeInTheDocument();
        expect(screen.queryByText("No listings have been added to this group")).toBeInTheDocument();
    });

    test("should open the modal with having `listingGroup` contains a listing", () => {
        process.env.IS_BETA = true;
        const {wrapper, props} = setup({
            listings: [
                {
                    _id: "1"
                }
            ],
            listingGroup: {
                accessCode: "accessCode",
                listings: [
                    {
                        _id: "1"
                    }
                ]
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        expect(screen.queryByText("Listing Settings")).toBeInTheDocument();
        expect(screen.queryByText("Listing Group Name")).toBeInTheDocument();
        expect(screen.queryByText("Add Listing")).toBeInTheDocument();
        expect(
            screen.queryByText("No listings have been added to this group")
        ).not.toBeInTheDocument();

        process.env.IS_BETA = false;
    });

    test("should open the modal with having `linkedListingID`", () => {
        const {wrapper, props} = setup({
            listings: [
                {
                    _id: "1",
                    linkedListingID: "100"
                }
            ],
            listingGroup: {
                listings: []
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        expect(screen.queryByText("Listing Settings")).toBeInTheDocument();
        expect(screen.queryByText("Listing Group Name")).toBeInTheDocument();
        expect(screen.queryByText("Add Listing")).toBeInTheDocument();
        expect(screen.queryByText("No listings have been added to this group")).toBeInTheDocument();
    });

    [
        {
            listings: [
                {
                    _id: "1",
                    nickname: "a",
                    source: "sourceA"
                },
                {
                    _id: "2",
                    nickname: "b",
                    source: "sourceB"
                }
            ],
            result: "sourceA, sourceB"
        },
        {
            listings: [
                {
                    _id: "2",
                    nickname: "b",
                    source: "sourceB"
                },
                {
                    _id: "1",
                    nickname: "a",
                    source: "sourceA"
                }
            ],
            result: "sourceA, sourceB"
        },
        {
            listings: [
                {
                    _id: "2",
                    nickname: "",
                    source: "sourceB"
                },
                {
                    _id: "1",
                    nickname: "",
                    source: "sourceA"
                }
            ],
            result: "sourceB, sourceA"
        },
        {
            listings: [
                {
                    _id: "2",
                    nickname: "a",
                    source: "sourceA"
                },
                {
                    _id: "1",
                    nickname: "a",
                    source: "sourceA"
                }
            ],
            result: "sourceA, sourceA"
        }
    ].forEach(({listings, result}) => {
        test(`should sort properly with result "${result}"`, () => {
            const {wrapper, props} = setup({
                listings,
                listingGroup: {
                    listings: [
                        {
                            _id: "3"
                        }
                    ]
                }
            });

            wrapper.rerender(<ModalListingGroup {...props} show />);

            expect(screen.queryByText("Listing Settings")).toBeInTheDocument();
            expect(screen.queryByText("Listing Group Name")).toBeInTheDocument();
            expect(screen.queryByText("Add Listing")).toBeInTheDocument();
            expect(
                screen.queryByText("No listings have been added to this group")
            ).not.toBeInTheDocument();
            expect(screen.queryByText(result)).toBeInTheDocument();
        });
    });

    test("should handle add listing `handleSelectedOption`", () => {
        const {wrapper, props} = setup({
            listings: [
                {
                    _id: "1",
                    airbnbName: "a",
                    nickname: "nicknameA",
                    source: "sourceA"
                }
            ],
            listingGroup: {
                listings: [
                    {
                        _id: "2",
                        airbnbName: "b",
                        nickname: "nicknameB",
                        source: "HomeAway"
                    }
                ]
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        const label = "label for listings";
        changeInput(label, {
            value: "1"
        });

        expect(screen.queryByText("nicknameA")).toBeInTheDocument();
        expect(screen.queryByText("nicknameB")).toBeInTheDocument();

        expect(screen.queryByAltText("HomeAway")).toBeInTheDocument();
        expect(screen.queryByAltText("HomeAway").src).toBe("http://localhost/homeaway-icon.svg");
    });

    test("should change group name", () => {
        setup({
            show: true,
            listings: [],
            listingGroup: {
                listings: []
            }
        });

        const label = "Listing Group Name";
        changeInput(label, "Group name");

        expect(screen.queryByLabelText(label).value).toBe("Group name");
    });

    test("should toggle `accessCode` successfully", () => {
        setup({
            show: true,
            listings: [],
            listingGroup: {
                accessCode: ""
            }
        });

        const label = "Enable Public Turnover URL";

        clickOnLabel(label);

        waitFor(() => expect(screen.queryByLabelText(label).checked).toBeTruthy());
    });

    test("should change `accessCode` having no value", () => {
        setup({
            show: true,
            listings: [],
            listingGroup: {
                accessCode: null
            }
        });

        const label = "Enable Public Turnover URL";

        clickOnLabel(label);

        waitFor(() => expect(screen.queryByLabelText(label).checked).toBeFalsy());
    });

    test("should remove a listing `handleDeleteListing`", () => {
        const {wrapper, props} = setup({
            listings: [
                {
                    _id: "1",
                    airbnbName: "a",
                    nickname: "nicknameA",
                    source: "sourceA"
                }
            ],
            listingGroup: {
                listings: [
                    {
                        _id: "2",
                        airbnbName: "b",
                        nickname: "nicknameB",
                        source: "sourceB"
                    }
                ]
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        expect(
            screen.queryByText("No listings have been added to this group")
        ).not.toBeInTheDocument();

        clickButton("remove-listing-2", true);

        expect(screen.queryByText("No listings have been added to this group")).toBeInTheDocument();
    });

    test("should validate group name", () => {
        setup({
            show: true,
            listings: [],
            listingGroup: {}
        });

        clickButton("Save");

        expect(screen.queryByText("Please add a group name.")).toBeInTheDocument();
    });

    test("should submit successfully", () => {
        const {wrapper, props} = setup({
            listings: [],
            listingGroup: {
                listings: [
                    {
                        _id: "2",
                        airbnbName: "b",
                        nickname: "nicknameB",
                        source: "sourceB"
                    }
                ],
                accessCode: "accessCode",
                name: "Group name"
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        clickButton("Save");

        waitFor(() => expect(props.onHide).toHaveBeenCalled());
        expect(global.fetch).toHaveBeenCalledWith(
            "/addListingGroup",
            expect.objectContaining({
                body: JSON.stringify({
                    listingIDs: ["2"],
                    name: "Group name",
                    accessCode: "accessCode"
                }),
                method: "POST"
            })
        );
    });

    test("should fail to submit", () => {
        const {wrapper, props} = setup({
            listings: [],
            listingGroup: {
                listings: [
                    {
                        _id: "2",
                        airbnbName: "b",
                        nickname: "nicknameB",
                        source: "sourceB"
                    }
                ],
                accessCode: "accessCode",
                name: "Group name"
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({})
        });

        jest.spyOn(console, "error");

        clickButton("Save");

        waitFor(() => expect(console.error).toHaveBeenCalled());
    });

    test("should reject to submit", () => {
        const {wrapper, props} = setup({
            listings: [],
            listingGroup: {
                listings: [
                    {
                        _id: "2",
                        airbnbName: "b",
                        nickname: "nicknameB",
                        source: "sourceB"
                    }
                ],
                accessCode: "accessCode",
                name: "Group name"
            }
        });

        wrapper.rerender(<ModalListingGroup {...props} show />);

        global.fetch = jest.fn().mockRejectedValue();

        jest.spyOn(console, "error");

        clickButton("Save");

        waitFor(() => expect(console.error).toHaveBeenCalled());
    });

    test("should hide the modal", () => {
        const {props} = setup({
            show: true,
            listings: [],
            listingGroup: {}
        });

        clickButton("Close");

        expect(props.onHide).toHaveBeenCalled();
    });
});
