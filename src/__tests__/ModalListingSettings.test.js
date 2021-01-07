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

        fireEvent.keyDown(screen.queryByText("Listings...").parentElement.parentElement.parentElement, {key: "ArrowDown"});

        await waitFor(() => screen.queryByText("airbnbName_04"));
        fireEvent.click(screen.queryByText("airbnbName_04"));

        expect(screen.queryByText("airbnbName_04")).toBeInTheDocument();
    });

    test('should remove linked listing when select listing options', async () => {
        setupLinkedListings();

        const removeButton = screen.queryByText("nickname_01").parentElement.parentElement.querySelector("button");
        fireEvent.click(removeButton);

        expect(screen.queryByText("nickname_01")).not.toBeInTheDocument();
        expect(screen.queryByText("airbnbName_03")).toBeInTheDocument();
    });

});
