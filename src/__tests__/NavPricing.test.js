import React from "react";
import {render, screen, fireEvent, waitFor, cleanup} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import NavPricing from "@/admin/components/NavPricing";

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
            ...overrides
        }
    };

    const wrapper = render(
        <BrowserRouter>
            <NavPricing {...props} />
        </BrowserRouter>
    );

    return {
        wrapper,
        props
    };
};

const doClickShow = () => {
    fireEvent.click(screen.getByText("Pricing"));
};

describe("NavPricing", () => {
    test("should render if there are several listings", async () => {
        setup();
        doClickShow();
        await waitFor(() => screen.getByText("happy1"));
        expect(screen.getByText("happy1")).toBeInTheDocument();
        expect(screen.getByText("happy2")).toBeInTheDocument();
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
        expect(screen.getByText("Pricing")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: "Pricing"
            })
        ).toHaveAttribute("href", "/pricing/happy3-airbnbUserID/happy3-airbnbListingID");
    });
    test("should show airbnbName without nickname", async () => {
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
        await waitFor(() => screen.getByText("Happy 1 Airbnb"));
        expect(screen.getByText("Happy 1 Airbnb")).toBeInTheDocument();
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
        expect(screen.getByText("happy2")).toBeInTheDocument();
    });
    const links = [
        {text: "happy1", location: "/pricing/happy1-airbnbUserID/happy1-airbnbListingID"},
        {text: "happy2", location: "/pricing/happy2-airbnbUserID/happy2-airbnbListingID"}
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
        const {props} = setup({
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
                },
                {
                    listingEnabled: true,
                    airbnbName: "Sad Airbnb",
                    nickname: "sad",
                    airbnbUserID: "sad-airbnbUserID",
                    airbnbListingID: "sad-airbnbListingID"
                }
            ]
        });
        doClickShow();
        await waitFor(() => screen.getByText(/listings/i));
        expect(screen.getByRole("searchbox")).toBeInTheDocument();
        const input = screen.getByPlaceholderText("Filter...");
        fireEvent.change(input, {target: {value: "happy"}});
        expect(input.value).toBe("happy");
        const listings = props.user.listings.filter(
            listing => listing.nickname.search(input.value) !== -1
        );
        cleanup();
        setup({
            listings
        });
        doClickShow();
        await waitFor(() => screen.getByText(/happy1/i));
        expect(screen.getByText(/happy1/i)).toBeInTheDocument();
        expect(screen.queryByText(/sad/i)).not.toBeInTheDocument();
    });
});
