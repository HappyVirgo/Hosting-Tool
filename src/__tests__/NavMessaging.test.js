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
                    nickName: "happy1",
                    airbnbUserID: "1",
                    airbnbListingID: "123"
                },
                {
                    listingEnabled: true,
                    airbnbName: "Happy 2 Airbnb",
                    nickName: "happy2",
                    airbnbUserID: "2",
                    airbnbListingID: "234"
                }
            ],
            listingGroups: [
                {
                    _id: "1",
                    name: "111",
                    uniqueMessageRulesCount: 3
                },
                {
                    _id: "2",
                    name: "222",
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
        await waitFor(() => screen.getByText("Happy 1 Airbnb"));
        await waitFor(() => screen.getByText("Happy 2 Airbnb"));
        expect(screen.getByText("Happy 1 Airbnb")).toBeInTheDocument();
        expect(screen.getByText("Happy 2 Airbnb")).toBeInTheDocument();
    });
    test("should render if there is only one listing", async () => {
        setup({
            listings: [
                {
                    listingEnabled: true,
                    airbnbName: "Happy 3 Airbnb",
                    nickName: "happy3",
                    airbnbUserID: "3",
                    airbnbListingID: "134"
                }
            ]
        });
        expect(screen.getByText("Messaging")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: "Messaging"
            })
        ).toHaveAttribute("href", "/messaging/3/134");
    });
    const links = [
        {text: "Happy 1 Airbnb", location: "/messaging/1/123"},
        {text: "Happy 2 Airbnb", location: "/messaging/2/234"}
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
});
