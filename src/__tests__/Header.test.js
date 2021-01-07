import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
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
        },
        updateUser: jest.fn(),
    });

    return {
        __esModule: true,
        UserContext,
        UserConsumer: UserContext.Consumer,
    };
});
const setup = overrides => {
    const history = createMemoryHistory()
    global.HelpCrunch = jest.fn();
    const wrapper = render(
            <Router history={history}>
                <Header />
            </Router>
    );

    return {
        wrapper,
    };
};

describe("NavPricing", () => {
    test("should render if there are several listings", async () => {
        setup();
        screen.debug();
    });
});
