import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import {UserContext} from "@/admin/providers/UserProvider";
import Header from "@/admin/components/Header";

const setup = overrides => {
    const history = createMemoryHistory()
    const value = {
        user : {
            isFiller: true,
            _id: 1,
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
            ...overrides
        }
    };

    const wrapper = render(
        <UserContext.Provider value={value}>
            <Router history={history}>
                <Header />
            </Router>
        </UserContext.Provider>
    );

    return {
        wrapper,
        props
    };
};

describe("NavPricing", () => {
    test("should render if there are several listings", async () => {
        setup();
        screen.debug();
    });
});
