import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserContext } from "../admin/providers/UserProvider";

import ModalListingSettings from "../admin/components/ModalListingSettings";

const setup = (bindings, userContext) => {
    const props = {
        show: false,
        listing: {
            _id: "id_123",
            airbnbName: "bnb_123",
            airbnbUserID: "airbnbUserID_123",
            airbnbListingID: "airbnbListingID_123",
            nickname: "Nickname",
            calendarExportCode: "calendarExportCode_123",
            linkedListingID: null,
            listingEnabled: true,
            source: "source_listing_123",
        },
        onHide: jest.fn(),
        ...bindings,
    };

    const user = {
        accounts: [{}],
        badAccounts: [{}],
        listings: [{}],
        locks: [{}],
        listingGroups: [{}],
        tags: [{ name: "Tag 1" }, { name: "Tag 2" }, { name: "Tag 3" }],
    }

    const updateUser = jest.fn();

    const context = {
        user,
        updateUser,
        ...userContext,
    }

    const view = render(
        <UserContext.Provider value={context}>
            <ModalListingSettings {...props} />
        </UserContext.Provider>
    );

    return {
        view,
        props,
        context,
    };
};

beforeAll(() => jest.spyOn(global, 'fetch'))

test("should open the modal", () => {
  setup({
      show: true,
  });

  expect(screen.queryByText("Listing Settings")).toBeInTheDocument();
});

describe("handle form", () => {

    test('should submit sucessfully', async () => {
        const { context, props } = setup({
            show: true,
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({success: true}),
        })

        fireEvent.click(screen.getByRole("button", {name: "Save"}));

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith("/editListingSettings", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                airbnbUserID: "airbnbUserID_123",
                airbnbListingID: "airbnbListingID_123",
                linkedListingIDs: [],
                linkedLockIDs: [],
                airbnbName: "bnb_123",
                nickname: "Nickname",
                priceSource: "Amount",
                basePrice: 0,
                listingEnabled: true,
                calendarExportCode: "calendarExportCode_123",
            })
        });


        await waitFor(() => {
            expect(props.onHide).toHaveBeenCalledTimes(1);
            expect(context.updateUser).toHaveBeenCalledTimes(1);
        });
    });

    describe('validate form', () => {

        const setupPausePricingTool = () => {
            const params = setup({
                show: true,
            });

            fireEvent.click(screen.getByRole("checkbox", {name: "Pause pricing tool"}));

            return params;
        }

        test('should input min price when pricing are enabled', () => {

            setupPausePricingTool();

            fireEvent.click(screen.getByRole("button", {name: "Save"}));

            expect(global.fetch).toHaveBeenCalledTimes(0);
            expect(screen.queryByText("Please add a minimum price.")).toBeInTheDocument();
        });

        test('should validate base price when pricing are enabled', () => {

            setupPausePricingTool();

            fireEvent.change(screen.getByRole("spinbutton", {name: "Minimum Price"}), {target: {value: 10}});
            fireEvent.change(screen.queryByPlaceholderText("Base Price..."), {target: {value: ""}});

            fireEvent.click(screen.getByRole("button", {name: "Save"}));

            expect(global.fetch).toHaveBeenCalledTimes(0);
            expect(screen.queryByText("Please add a base price.")).toBeInTheDocument();
        });

        test('should validate base price higher than minimum price', () => {

            setupPausePricingTool();

            fireEvent.change(screen.getByRole("spinbutton", {name: "Minimum Price"}), {target: {value: 10}});
            fireEvent.change(screen.queryByPlaceholderText("Base Price..."), {target: {value: 5}});

            fireEvent.click(screen.getByRole("button", {name: "Save"}));

            expect(global.fetch).toHaveBeenCalledTimes(0);
            expect(screen.queryByText("Please add a base price that is higher than your minimum price.")).toBeInTheDocument();
        });

    });

});

describe("linkedListings", () => {
    const setupLinkedListings = () => {
        const user = {
            accounts: [{}],
            badAccounts: [{}],
            listings: [{
                _id: "listing_id_01",
                linkedListingID: "id_123",
                source: "source_listing_01",
                nickname: "nickname_01",
            },
            {
                _id: "listing_id_02",
                source: "source_listing_02",
                nickname: "nickname_02",
            },
            {
                _id: "listing_id_03",
                linkedListingID: "id_123",
                source: "source_listing_03",
                airbnbName: "airbnbName_03",
            },
            {
                _id: "listing_id_04",
                source: "source_listing_04",
                airbnbName: "airbnbName_04",
            }],
            locks: [{}],
            listingGroups: [{}],
            tags: [{ name: "Tag 1" }, { name: "Tag 2" }, { name: "Tag 3" }],
        }
        const params = setup({
            show: true,
        }, {
            user,
        });

        return params;
    }

    test("should build linked listing and listing options", () => {
        setupLinkedListings();

        expect(screen.queryByText("nickname_01")).toBeInTheDocument();
        expect(screen.queryByText("airbnbName_03")).toBeInTheDocument();
    });

    test('should add linked listing when select listing options', async () => {
        setupLinkedListings();

        const listingSelect = screen.queryByText("Listings...").parentElement.parentElement.parentElement;

        fireEvent.keyDown(listingSelect, {key: "ArrowDown"});

        await waitFor(() => screen.queryByText("airbnbName_04"));
        fireEvent.click(screen.queryByText("airbnbName_04"));

        expect(screen.queryByText("airbnbName_04")).toBeInTheDocument();
    });

    test('should remove linked listing', async () => {
        setupLinkedListings();

        const removeLikedLinkButton = screen.queryByText("nickname_01").parentElement.parentElement.querySelector("button");
        fireEvent.click(removeLikedLinkButton);

        expect(screen.queryByText("nickname_01")).not.toBeInTheDocument();
        expect(screen.queryByText("airbnbName_03")).toBeInTheDocument();
    });

});

describe('linkedLocks', () => {
    const setupLockedListings = () => {
        const user = {
            accounts: [{}],
            badAccounts: [{}],
            locks: [{
                _id: "lock_id_01",
                listingID: "id_123",
                source: "source_lock_01",
                name: "name_01",
            },
            {
                _id: "lock_id_02",
                source: "source_lock_02",
                name: "name_02",
            },
            {
                _id: "lock_id_03",
                listingID: "id_123",
                source: "source_lock_03",
                name: "name_03",
            },
            {
                _id: "lock_id_04",
                source: "source_lock_04",
                name: "name_04",
            }],
            listings: [{}],
            listingGroups: [{}],
            tags: [{ name: "Tag 1" }, { name: "Tag 2" }, { name: "Tag 3" }],
        }
        const params = setup({
            show: true,
        }, {
            user,
        });

        return params;
    }

    test("should build linked lock and lock options", () => {
        setupLockedListings();

        expect(screen.queryByText("name_01")).toBeInTheDocument();
        expect(screen.queryByText("name_03")).toBeInTheDocument();
    });

    test('should add linked lock when select listing options', async () => {
        setupLockedListings();

        const lockOptionSelect = screen.queryByText("Locks...").parentElement.parentElement.parentElement;

        fireEvent.keyDown(lockOptionSelect, {key: "ArrowDown"});

        await waitFor(() => screen.queryByText("name_02"));
        fireEvent.click(screen.queryByText("name_02"));

        expect(screen.queryByText("name_02")).toBeInTheDocument();
    });

    test('should remove linked lock', async () => {
        setupLockedListings();

        const removeLinkedLockButton = screen.queryByText("name_01").parentElement.parentElement.querySelector("button");
        fireEvent.click(removeLinkedLockButton);

        expect(screen.queryByText("name_01")).not.toBeInTheDocument();
        expect(screen.queryByText("name_03")).toBeInTheDocument();
    });
});

describe('isLinkedListing', () => {
    const setupLinkedListing = (listing) => {

        const user = {
            accounts: [{}],
            badAccounts: [{}],
            listings: [{
                _id: "listing_id_01",
                source: "source_listing_01",
                airbnbName: "airbnbName_01",
                ...listing,
            }],
            locks: [{}],
            listingGroups: [{}],
            tags: [{ name: "Tag 1" }, { name: "Tag 2" }, { name: "Tag 3" }],
        }

        const params = setup({
            listing: {
                _id: "id_123",
                airbnbName: "airbnbName_123",
                airbnbUserID: "airbnbUserID_123",
                airbnbListingID: "airbnbListingID_123",
                nickname: "Nickname",
                calendarExportCode: "calendarExportCode_123",
                linkedListingID: "listing_id_01",
                listingEnabled: true,
                source: "source_listing_123",
            },
            show: true,
        }, {
            user,
        });

        return params;
    }

    test('should show airbnbName in listing props', () => {
        setupLinkedListing();

        expect(screen.queryByText("airbnbName_01")).toBeInTheDocument();
    });

    test('should show nickname in listing props', () => {
        setupLinkedListing({
            nickname: "nickname_123",
        });

        expect(screen.queryByText("nickname_123")).toBeInTheDocument();
    });
});

describe('selectPriceSource', () => {
    test('should change price source', async () => {
        const {view: {baseElement}} = setup({
            show: true
        });

        const priceSourceSelectElement = screen.queryByText("Set Amount").parentElement.parentElement.parentElement;
        fireEvent.keyDown(priceSourceSelectElement, {key: "ArrowDown"});
        await waitFor(() => screen.queryByText("Airbnb Smart Prices"));
        fireEvent.click(screen.queryByText("Airbnb Smart Prices"));

        expect(screen.queryByText("Airbnb Smart Prices")).toBeInTheDocument();
    });
});

jest.mock("crypto", () => ({
    randomBytes: () => Promise.resolve("byte_01"),
}));

describe('calendarExportCode', () => {
    const setupCalendarExportCode = (calendarExportCode = "") => {
        const params = setup({
            show: true,
            listing: {
                _id: "id_123",
                airbnbName: "bnb_123",
                airbnbUserID: "airbnbUserID_123",
                airbnbListingID: "airbnbListingID_123",
                nickname: "Nickname",
                calendarExportCode,
                linkedListingID: null,
                listingEnabled: true,
                source: "source_listing_123",
            },
        });
        return params;
    };

    test('should generate new calendar export code when toggle on Export Calendar', async () => {

        setupCalendarExportCode();

        fireEvent.click(screen.getByRole("checkbox", {name: "Export Calendar"}));

        await Promise.resolve();

        expect(screen.getByDisplayValue("https://hosttools.com/ical/byte_01")).toBeInTheDocument();
    });

    test('should generate new calendar export code when click button generate new url', async () => {

        setupCalendarExportCode("exportCalendarCode_123");

        expect(screen.getByDisplayValue("https://hosttools.com/ical/exportCalendarCode_123")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", {name: "New URL"}));

        await Promise.resolve();

        expect(screen.getByDisplayValue("https://hosttools.com/ical/byte_01")).toBeInTheDocument();
    });
});

jest.mock("is-url", () => (url) => url === "url_calendar_valid" ? true : false);

describe('CalendarURL', () => {
    test('should add calendar url success', () => {
        setup({
            show: true,
        });

        screen.debug(screen.getByRole("textbox", {name: "Import Calendars"}));

        fireEvent.change(screen.getByRole("textbox", {name: "Import Calendars"}), {target: {value: "url_calendar_valid"}});

        fireEvent.click(screen.getByRole("button", {name: "Add"}));

        expect(screen.queryByText("url_calendar_valid")).toBeInTheDocument();
    });

    test('should not add invalid calendar url', () => {
        setup({
            show: true,
        });

        fireEvent.change(screen.getByRole("textbox", {name: "Import Calendars"}), {target: {value: "url_calendar_invalid"}});

        fireEvent.click(screen.getByRole("button", {name: "Add"}));

        expect(screen.queryByText("url_calendar_invalid")).not.toBeInTheDocument();
        expect(screen.queryByText("Please enter a valid iCal link.")).toBeInTheDocument();
    });

    test('should not add existing calendar url', () => {
        setup({
            show: true,
        });

        fireEvent.change(screen.getByRole("textbox", {name: "Import Calendars"}), {target: {value: "url_calendar_valid"}});

        fireEvent.click(screen.getByRole("button", {name: "Add"}));

        expect(screen.queryByText("url_calendar_valid")).toBeInTheDocument();

        fireEvent.change(screen.getByRole("textbox", {name: "Import Calendars"}), {target: {value: "url_calendar_valid"}});

        fireEvent.click(screen.getByRole("button", {name: "Add"}));
        expect(screen.queryByText("The iCal link already exists.")).toBeInTheDocument();
    });

    test('should delete calendar url successfuly', () => {
        setup({
            show: true,
        });

        fireEvent.change(screen.getByRole("textbox", {name: "Import Calendars"}), {target: {value: "url_calendar_valid"}});

        fireEvent.click(screen.getByRole("button", {name: "Add"}));

        expect(screen.queryByText("url_calendar_valid")).toBeInTheDocument();

        const buttonDeleteCalUrl = screen.queryByText("url_calendar_valid").nextSibling;
        fireEvent.click(buttonDeleteCalUrl);

        expect(screen.queryByText("url_calendar_valid")).not.toBeInTheDocument();
    });
});

