import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import NavMessaging from "@/admin/components/NavMessaging";

const setup = overrides => {
    const props = {
        user: {
            listings: [
                {
                    listingEnabled: true,
                    airbnbName: "Happy 1 Airbnb",
                    nickname: "happy1",
                    airbnbUserID: "happy1-airbnbUserID",
                    airbnbListingID: "happy1-airbnbListingID"
                },
                {
                    listingEnabled: true,
                    airbnbName: "Happy 2 Airbnb",
                    nickname: "happy2",
                    airbnbUserID: "happy2-airbnbUserID",
                    airbnbListingID: "happy2-airbnbListingID"
                }
            ],
            listingGroups: [
                {
                    _id: "1",
                    name: "ListingGroup 1",
                    uniqueMessageRulesCount: 3
                },
                {
                    _id: "2",
                    name: "ListingGroup 2",
                    uniqueMessageRulesCount: 3
                }
            ],
            globalMessageRulesCount: 2,
            ...overrides
        }
    };

    const wrapper = render(
        <BrowserRouter>
            <NavMessaging {...props} />
        </BrowserRouter>
    );

    return {
        wrapper,
        props
    };
};

const doClickShow = () => {
    fireEvent.click(screen.getByText("Messaging"));
};

describe("NavMessaging", () => {
    test("should render if there are several listings", async () => {
        setup();
        doClickShow();
        await waitFor(() => screen.getByText("happy1"));
        expect(screen.getByText("happy1")).toBeInTheDocument();
        expect(screen.getByText("happy2")).toBeInTheDocument();
    });
    test("should render correctly without nickName", async () => {
        setup({
            listings: [
                {
                    listingEnabled: true,
                    airbnbName: "Happy 1 Airbnb",
                    airbnbUserID: "happy1-airbnbUserID",
                    airbnbListingID: "happy1-airbnbListingID"
                },
                {
                    listingEnabled: true,
                    airbnbName: "Happy 2 Airbnb",
                    airbnbUserID: "happy2-airbnbUserID",
                    airbnbListingID: "happy2-airbnbListingID"
                }
            ]
        });
        doClickShow();
        await waitFor(() => screen.getByText("Happy 2 Airbnb"));
        expect(screen.getByText("Happy 2 Airbnb")).toBeInTheDocument();
    });
    test("shouldn't show if listingEnabled is false", async () => {
        setup({
            listings: [
                {
                    listingEnabled: false,
                    airbnbName: "Happy 1 Airbnb",
                    nickname: "happy1",
                    airbnbUserID: "happy1-airbnbUserID",
                    airbnbListingID: "happy1-airbnbListingID"
                },
                {
                    listingEnabled: true,
                    airbnbName: "Happy 2 Airbnb",
                    nickname: "happy2",
                    airbnbUserID: "happy2-airbnbUserID",
                    airbnbListingID: "happy2-airbnbListingID"
                },
                {
                    listingEnabled: true,
                    airbnbName: "Happy 3 Airbnb",
                    nickname: "happy3",
                    airbnbUserID: "happy3-airbnbUserID",
                    airbnbListingID: "happy3-airbnbListingID"
                }
            ]
        });
        doClickShow();
        await waitFor(() => screen.getByText("happy2"));
        expect(screen.queryByText("happy1")).not.toBeInTheDocument();
        expect(screen.queryByText("happy2")).toBeInTheDocument();
    });
    test("should render if there is only one listing", async () => {
        setup({
            listings: [
                {
                    listingEnabled: true,
                    airbnbName: "Happy 3 Airbnb",
                    nickname: "happy3",
                    airbnbUserID: "happy3-airbnbUserID",
                    airbnbListingID: "happy3-airbnbListingID"
                }
            ]
        });
        expect(screen.getByText("Messaging")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: "Messaging"
            })
        ).toHaveAttribute("href", "/messaging/happy3-airbnbUserID/happy3-airbnbListingID");
    });
    const links = [
        {text: "happy1", location: "/messaging/happy1-airbnbUserID/happy1-airbnbListingID"},
        {text: "happy2", location: "/messaging/happy2-airbnbUserID/happy2-airbnbListingID"}
    ];
    test.each(links)("Check if Nav Bar have %s link.", async link => {
        setup();
        doClickShow();
        await waitFor(() =>
            screen.getByRole("link", {
                name: link.text
            })
        );
        const linkDom = screen.getByRole("link", {
            name: link.text
        });
        expect(linkDom).toHaveAttribute("href", link.location);
    });
    test("check if search filter works well", async () => {
        const {props} = setup();
        doClickShow();
        await waitFor(() => screen.getByText(/happy1/i));
        expect(screen.getByRole("searchbox")).toBeInTheDocument();
        const input = screen.getByPlaceholderText("Filter...");
        fireEvent.change(input, {target: {value: "happy1"}});
        expect(input.value).toBe("happy1");
        const listings = props.user.listings.filter(listing => listing.nickname === input.value);
        setup({
            listings
        });
        expect(
            screen.getByRole("link", {
                name: "Messaging"
            })
        ).toHaveAttribute("href", "/messaging/happy1-airbnbUserID/happy1-airbnbListingID");
    });
});
