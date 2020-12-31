import React from "react";
import {render, screen} from "@testing-library/react";
import ModalCreditCard from "@/admin/components/ModalCreditCard";
import {MemoryRouter} from "react-router-dom";

jest.mock("react-stripe-elements", () => ({
    ...jest.requireActual("react-stripe-elements"),
    CardCVCElement: () => null,
    CardExpiryElement: () => null,
    CardNumberElement: () => null,
    injectStripe: Component => {
        const Wrapper = props => {
            return (
                <Component
                    {...props}
                    unregisterElement={jest.fn()}
                    stripe={{createToken: jest.fn()}}
                />
            );
        };

        return Wrapper;
    }
}));

const setup = overrides => {
    const props = {
        show: true,
        user: {},
        invoice: [],
        onSuccess: jest.fn(),
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(
        <MemoryRouter>
            <ModalCreditCard {...props} />
        </MemoryRouter>
    );

    return {
        wrapper,
        props
    };
};

describe("ModalCreditCard", () => {
    test("should show the modal", () => {
        setup();

        expect(screen.queryByText("Your Payment Details")).toBeInTheDocument();
    });
});
