import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {format} from "date-fns";
import {useHistory, MemoryRouter} from "react-router-dom";

import MultiCalendar from "../admin/components/MultiCalendar";
import {clickButton} from "../testUtils";

jest.mock("../admin/providers/UserProvider", () => {
    const UserContext = jest.requireActual("react").createContext({
        user: {
            listings: [
                {
                    _id: "1",
                    listingEnabled: true,
                    reservations: [],
                    source: "HomeAway",
                    nickname: "Listing #1"
                },
                {
                    _id: "2",
                    listingEnabled: true,
                    reservations: [],
                    source: "HomeAway",
                    linkedListingID: "1",
                    nickname: "Listing #2"
                }
            ]
        },
        errors: {},
        updateUser: jest.fn()
    });

    return {
        UserContext,
        UserConsumer: UserContext.Consumer
    };
});

jest.mock("../admin/components/CalendarUtils", () => {
    const {format} = require("date-fns");
    return {
        getAllPrices: () =>
            Promise.resolve({
                1: [
                    {
                        date: format(new Date(), "yyyy-MM-dd")
                    }
                ]
            })
    };
});

jest.mock("../admin/components/ModalListingSettings", () => props => (
    <div>
        {props.show && (
            <div>
                <h2>Listing Settings</h2>
                <div aria-label={props.listing.nickname}>{props.listing.nickname}</div>
                <button type="button" data-testid="hide-modal" onClick={props.onHide}>
                    Close
                </button>
            </div>
        )}
    </div>
));

jest.mock("../admin/components/MultiCalendarListing", () => props => {
    const {format} = require("date-fns");

    return (
        <>
            {props.prices && (
                <ul>
                    {props.prices.map(item => (
                        <li key={item.date}>{format(item.date, "yyyy-MM-dd")}</li>
                    ))}
                </ul>
            )}
            {props.selectedListingID && (
                <div aria-label={`selected id ${props.selectedListingID}`} />
            )}
            <button
                type="button"
                data-testid="show-selected-reservation-has-source"
                onClick={() =>
                    props.onShowSelectedReservation({
                        _id: "1",
                        source: "Airbnb"
                    })
                }
            />
            <button
                type="button"
                data-testid="show-selected-reservation-has-no-source"
                onClick={() =>
                    props.onShowSelectedReservation({
                        _id: "10",
                        airbnbFirstName: "Hao",
                        airbnbLastName: "Tran",
                        airbnbPhone: "+84917233731",
                        airbnbPreferredLocale: "vi"
                    })
                }
            />
            <button
                type="button"
                data-testid="select-dates"
                onClick={() =>
                    props.onSelectedDates({
                        listingID: "1"
                    })
                }
            />
            <button type="button" data-testid="refresh" onClick={props.onRefresh} />
        </>
    );
});

jest.mock("react-router-dom", () => {
    const push = jest.fn();
    return {
        ...jest.requireActual("react-router-dom"),
        useHistory: () => ({
            push
        })
    };
});

const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const setup = overrides => {
    const props = {
        listing: {
            _id: "1",
            airbnbTimeZone: browserTz,
            reservations: []
        },
        selectedListingID: "",
        prices: [],

        onShowSelectedReservation: jest.fn(),
        onSelectedDates: jest.fn(),
        onRefresh: jest.fn(),

        ...overrides
    };

    const wrapper = render(
        <MemoryRouter>
            <MultiCalendar {...props} />
        </MemoryRouter>
    );

    return {
        wrapper,
        props
    };
};

describe("MultiCalendar", () => {
    test("should render given props", async () => {
        setup();

        await waitFor(() => screen.queryByText(format(new Date(), "yyyy-MM-dd")));

        expect(screen.queryByText("1 Listing")).toBeInTheDocument();
        expect(screen.queryByText("Listing #1")).toBeInTheDocument();

        expect(screen.queryByText("Listing #2")).not.toBeInTheDocument();
    });

    test("should click on a listing to open listing modal", async () => {
        setup();

        await waitFor(() => screen.queryByText(format(new Date(), "yyyy-MM-dd")));

        fireEvent.click(screen.queryByText("Listing #1"));

        await waitFor(() => screen.queryByText("Listing Settings"));
        expect(screen.queryByLabelText("Listing #1")).toBeInTheDocument();
    });

    test("should close the modal", async () => {
        setup();

        await waitFor(() => screen.queryByText(format(new Date(), "yyyy-MM-dd")));

        fireEvent.click(screen.queryByText("Listing #1"));

        await waitFor(() => screen.queryByText("Close"));

        clickButton("Close");

        expect(screen.queryByLabelText("Listing #1")).not.toBeInTheDocument();
    });

    test("should select dates", async () => {
        setup();

        await waitFor(() => screen.queryByText(format(new Date(), "yyyy-MM-dd")));

        clickButton("select-dates", true);

        expect(screen.queryByLabelText("selected id 1")).toBeInTheDocument();
    });

    test("should show selected reservation with a source", async () => {
        setup();

        await waitFor(() => screen.queryByText(format(new Date(), "yyyy-MM-dd")));

        clickButton("show-selected-reservation-has-source", true);

        const history = useHistory();

        expect(history.push).toHaveBeenCalledWith("/inbox/1");
    });

    test("should show selected reservation with no source to open modal", async () => {
        setup();

        await waitFor(() => screen.queryByText(format(new Date(), "yyyy-MM-dd")));

        clickButton("show-selected-reservation-has-no-source", true);

        await waitFor(() => expect(screen.queryByText("Reservation Details")).toBeInTheDocument());
    });
});
