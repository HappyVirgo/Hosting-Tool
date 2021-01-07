import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Router} from "react-router-dom";
import Header from "@/admin/components/Header";

jest.mock("@/admin/providers/UserProvider", () => {
    const UserContext = jest.requireActual("react").createContext({
        user: {
            isFiller: false,
            _id: "1",
            firstName: "Tomas",
            lastName: "Krones",
            username: "Tom",
            subscriptionStatus: "active",
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
                    name: "ListingGroup 1",
                    uniqueMessageRulesCount: 3
                },
                {
                    _id: "2",
                    name: "ListingGroup 2",
                    uniqueMessageRulesCount: 3
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
const setup = () => {
    const history = createMemoryHistory();
    global.HelpCrunch = jest.fn();
    const wrapper = render(
        <Router history={history}>
            <Header />
        </Router>
    );

    return {
        wrapper
    };
};

describe("NavPricing", () => {
    test("should render correctly while first rendering", async () => {
        setup();
        expect(
            screen.getByRole("link", {
                name: /calendar/i
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: /pricing/i
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: /inbox/i
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: /messaging/i
            })
        ).toBeInTheDocument();
        const logoDom = screen.getByTestId(/site-logo/i);
        expect(logoDom).toHaveAttribute("href", "/");
    });

    const links = [
        {text: "Calendar", link: "/"},
        {text: "Inbox", link: "/inbox"}
    ];
    test.each(links)("Check if Nav Bar have %s link.", link => {
        setup();
        const linkDom = screen.getByRole("link", {
            name: link.text
        });
        expect(linkDom).toHaveAttribute("href", link.link);
    });
    test("avatar should work correctly", async () => {
        setup();
        const avatarDom = screen.getByRole("img", {
            name: /tomas krones avatar/i
        });
        expect(avatarDom).toBeInTheDocument();
        fireEvent.click(avatarDom);
        await waitFor(() => screen.getByText(/settings/i));
        expect(screen.getByText(/settings/i)).toBeInTheDocument();
        expect(screen.getByText(/settings/i)).toHaveAttribute("href", "/settings");
        expect(screen.getByText(/billing/i)).toHaveAttribute("href", "/billing");
        expect(screen.getByText(/f.a.q/i)).toHaveAttribute("href", "/faq");
        const linkAccountDom = screen.getByText(/link account/i);
        fireEvent.click(linkAccountDom);
        await waitFor(() => screen.getByRole("button", {name: /next/i}));
        expect(screen.getByRole("button", {name: /next/i})).toBeInTheDocument();
    });
});
