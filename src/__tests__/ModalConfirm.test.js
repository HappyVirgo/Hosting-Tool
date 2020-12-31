import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import ModalConfirm from "@/admin/components/ModalConfirm";

const setup = overrides => {
    const props = {
        show: false,
        title: "Remove payment method",
        buttonText: "Remove",
        onHide: jest.fn(),

        ...overrides
    };

    const wrapper = render(<ModalConfirm {...props} />);

    return {
        wrapper,
        props
    };
};

describe("ModalConfirm", () => {
    test("should show the modal", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(<ModalConfirm {...props} show />);

        expect(screen.queryByText(props.title)).toBeInTheDocument();
    });

    test("should submit the modal successfully", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(<ModalConfirm {...props} show />);

        fireEvent.click(screen.queryByText(props.buttonText));

        expect(props.onHide).toHaveBeenCalled();
    });

    test("should cancel the modal", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(<ModalConfirm {...props} show />);

        fireEvent.click(
            screen.queryByText("Close", {
                selector: "button"
            })
        );

        expect(props.onHide).toHaveBeenCalled();
    });
});
