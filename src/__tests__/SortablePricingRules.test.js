import React from "react";
import {render, screen, waitFor} from "@testing-library/react";

import {clickButton} from "../testUtils";
import SortablePricingRules from "../admin/components/SortablePricingRules";

jest.mock("react-sortable-hoc", () => ({
    ...jest.requireActual("react-sortable-hoc"),
    SortableElement: Component => {
        return props => {
            return <Component {...props} />;
        };
    },

    SortableContainer: Component => {
        return props => {
            return (
                <div>
                    <Component {...props} />
                    <button
                        aria-label="Trigger sort"
                        type="button"
                        data-testid="trigger-sort-end"
                        onClick={() => {
                            props.onSortEnd({
                                oldIndex: 0,
                                newIndex: 1
                            });
                        }}
                    />
                </div>
            );
        };
    }
}));

const setup = overrides => {
    const props = {
        pricingRules: [
            {
                _id: "1",
                title: "Normal rule",
                isFiller: false
            },
            {
                _id: "2",
                title: "Paused rule",
                paused: true
            }
        ],
        airbnbUserID: "airbnbUserID",
        airbnbListingID: "airbnbListingID",

        onDeletePricingRule: jest.fn(),
        onEditPricingRule: jest.fn(),
        onPausePricingRule: jest.fn(),
        onReorderPricing: jest.fn(),

        ...overrides
    };

    const wrapper = render(<SortablePricingRules {...props} />);

    return {
        wrapper,
        props
    };
};

describe("SortablePricingRules", () => {
    test("should render all kind of rules", () => {
        setup();

        expect(screen.queryByText("Normal rule")).toBeInTheDocument();
        expect(
            screen.queryByText("Actions", {
                selector: "button"
            })
        ).toBeInTheDocument();

        expect(screen.queryByText("Paused rule")).toBeInTheDocument();
        expect(
            screen.queryByText("Paused", {
                selector: "button"
            })
        ).toBeInTheDocument();
    });

    test("should render no rules", () => {
        setup({
            pricingRules: []
        });

        expect(screen.queryByText("No pricing rules have been added")).toBeInTheDocument();
    });

    [
        ["Edit", "onEditPricingRule"],
        ["Pause", "onPausePricingRule"],
        ["Delete", "onDeletePricingRule"]
    ].forEach(([btnName, callback]) =>
        test(`should work as click on "${btnName}" for normal rule`, async () => {
            const {props} = setup();

            clickButton("Actions");

            await waitFor(() =>
                screen.queryByRole("button", {
                    name: btnName
                })
            );

            clickButton(btnName);

            expect(props[callback]).toHaveBeenCalled();
        })
    );

    [
        ["Edit", "onEditPricingRule"],
        ["Enable", "onPausePricingRule"],
        ["Delete", "onDeletePricingRule"]
    ].forEach(([btnName, callback]) =>
        test(`should work as click on "${btnName}" for paused rule`, async () => {
            const {props} = setup();

            clickButton("Paused");

            await waitFor(() =>
                screen.queryByRole("button", {
                    name: btnName
                })
            );

            clickButton(btnName);

            expect(props[callback]).toHaveBeenCalled();
        })
    );

    test("should submit successfully", async () => {
        const {props} = setup();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        clickButton("trigger-sort-end", true);

        await waitFor(() => expect(props.onReorderPricing).toHaveBeenCalled());

        expect(global.fetch).toHaveBeenCalledWith(
            "/reorderPricing",
            expect.objectContaining({
                body: JSON.stringify({
                    pricingOrder: ["2", "1"],
                    airbnbUserID: props.airbnbUserID,
                    airbnbListingID: props.airbnbListingID
                }),
                method: "POST"
            })
        );
    });

    test("should fail to submit", async () => {
        setup();

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({})
        });

        jest.spyOn(console, "error");
        clickButton("trigger-sort-end", true);

        await waitFor(() => expect(console.error).toHaveBeenCalled());
    });

    test("should reject to submit", async () => {
        setup();

        global.fetch = jest.fn().mockRejectedValue();

        jest.spyOn(console, "error");
        clickButton("trigger-sort-end", true);

        await waitFor(() => expect(console.error).toHaveBeenCalled());
    });
});
