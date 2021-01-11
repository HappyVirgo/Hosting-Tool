/* eslint react/prop-types: 0 */
/* eslint react/destructuring-assignment: 0 */
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";

import {changeInput, clickButton} from "../testUtils";
import ModalReservationDetails from "../admin/components/ModalReservationDetails";

const SelectMock = props => (
    <div>
        <div>{props.selectedValues && <p>{Object.keys(props.selectedValues).join(", ")}</p>}</div>
        <input
            id={props.id}
            aria-label={`label for ${props.id}`}
            type="text"
            onChange={e => {
                props.onSelectedOption(e.target.data);
            }}
        />
    </div>
);

jest.mock("../admin/components/SelectLanguages", () => ({
    __esModule: true,
    default: SelectMock
}));

const setup = overrides => {
    const props = {
        show: true,
        reservation: {
            // source: "Airbnb",
            email: "test@gmail.com",
            airbnbFirstName: "Hao",
            airbnbLastName: "Tran",
            airbnbPhone: "+84917233731",
            airbnbPreferredLocale: "vi"
        },

        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<ModalReservationDetails {...props} />);

    return {
        wrapper,
        props
    };
};

describe("ModalReservationDetails", () => {
    test("should open the modal", () => {
        setup();

        expect(screen.queryByText("Reservation Details")).toBeInTheDocument();
        expect(screen.queryByLabelText("First Name").value).toBe("Hao");
        expect(screen.queryByLabelText("Last Name").value).toBe("Tran");
        expect(screen.queryByLabelText("Phone").value).toBe("+84917233731");
        expect(screen.queryByText("vi")).toBeInTheDocument();
    });

    [
        ["First Name", "Huynh"],
        ["Last Name", "Nguyen"],
        ["Phone", "+84914"],
        ["Language", "en"]
    ].forEach(([field, value]) => {
        test(`should change the ${field}`, async () => {
            setup();

            const label = field;
            changeInput(label, value);

            await waitFor(() => expect(screen.queryByLabelText(field).value).toBe(value));
        });
    });

    test("should submit successfully", async () => {
        const {props} = setup();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({})
        });

        clickButton("Save");

        await waitFor(() => expect(props.onHide).toHaveBeenCalled());

        expect(global.fetch).toHaveBeenCalledWith(
            "/setReservationDetails",
            expect.objectContaining({
                body: JSON.stringify({
                    reservationDetails: {
                        firstName: props.reservation.airbnbFirstName,
                        lastName: props.reservation.airbnbLastName,
                        phone: props.reservation.airbnbPhone,
                        preferredLocale: props.reservation.airbnbPreferredLocale
                    }
                }),
                method: "POST"
            })
        );
    });

    test("should fail to submit", async () => {
        setup();

        const error = "something went wrong";
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue(error)
        });

        clickButton("Save");

        await waitFor(() => expect(screen.queryByText(error)).toBeInTheDocument());
    });

    test("should reject to submit", async () => {
        setup();

        global.fetch = jest.fn().mockRejectedValue(500);

        clickButton("Save");

        jest.spyOn(console, "log");

        clickButton("Save");

        await waitFor(() => expect(console.log).toHaveBeenCalled());
    });
});
