import React from "react";
import {render, screen} from "@testing-library/react";

import {changeInput, clickButton} from "../testUtils";
import SliderFloatingPeriod from "../admin/components/SliderFloatingPeriod";

jest.mock("rc-slider", () => ({
    Range: ({value: range, onChange}) => {
        return (
            <>
                <div data-testid="min">{range[0]}</div>
                <div data-testid="max">{range[1]}</div>
                <button
                    type="button"
                    data-testid="trigger-range-changed"
                    onClick={() => onChange([0, 0])}
                />
            </>
        );
    }
}));

const setup = overrides => {
    const props = {
        onChange: jest.fn(),

        ...overrides
    };

    const wrapper = render(<SliderFloatingPeriod {...props} />);

    return {
        wrapper,
        props
    };
};

describe("SliderFloatingPeriod", () => {
    test("should render default range", () => {
        setup();

        expect(screen.queryByText("0")).toBeInTheDocument();
        expect(screen.queryByText("30")).toBeInTheDocument();

        expect(screen.queryByText("Starting now")).toBeInTheDocument();
        expect(screen.queryByText("Ending in 30 days")).toBeInTheDocument();
    });

    test("should limit in 365 days", () => {
        setup({
            range: [0, 366]
        });

        expect(screen.queryByText("0")).toBeInTheDocument();
        expect(screen.queryByText("365")).toBeInTheDocument();

        expect(screen.queryByText("Starting now")).toBeInTheDocument();
        expect(screen.queryByText("Ending in 365 days")).toBeInTheDocument();
    });

    test("should update the range properly", () => {
        const {wrapper, props} = setup();

        wrapper.rerender(<SliderFloatingPeriod {...props} range={[0, 366]} />);

        expect(screen.queryByText("0")).toBeInTheDocument();
        expect(screen.queryByText("365")).toBeInTheDocument();

        expect(props.onChange).toHaveBeenCalled();
    });

    test("should change start date properly", () => {
        const {props} = setup();

        props.onChange.mockReset();
        changeInput("start date", -1);
        expect(props.onChange).toHaveBeenCalledWith([0, 30]);

        props.onChange.mockReset();
        changeInput("start date", 20);
        expect(props.onChange).toHaveBeenCalledWith([20, 30]);

        props.onChange.mockReset();
        changeInput("start date", 50);
        expect(props.onChange).toHaveBeenCalledWith([50, 51]);

        props.onChange.mockReset();
        changeInput("start date", 365);
        expect(props.onChange).toHaveBeenCalledWith([364, 365]);
    });

    test("should change end date properly", () => {
        const {props} = setup({
            range: [20, 30]
        });

        props.onChange.mockReset();
        changeInput("end date", 40);
        expect(props.onChange).toHaveBeenCalledWith([20, 40]);

        props.onChange.mockReset();
        changeInput("end date", 366);
        expect(props.onChange).toHaveBeenCalledWith([20, 365]);

        props.onChange.mockReset();
        changeInput("end date", null);
        expect(props.onChange).toHaveBeenCalledWith([0, 1]);
    });

    test("should trigger range change properly", () => {
        const {props} = setup({
            range: [0, 30]
        });

        clickButton("trigger-range-changed", true);
        expect(props.onChange).toHaveBeenCalledWith([0, 1]);
    });
});
