import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {startOfDay, addDays} from "date-fns";

import SelectPricingTemplates from "../admin/components/SelectPricingTemplates";

const setup = (bindings) => {
  const props = {
    onSelectedTemplate: jest.fn(),
    pricingRules: [{}],
    selectedValue: "",
    ...bindings,
  }

  const view = render(<SelectPricingTemplates {...props} />);

  return {
    view,
    props,
  };
};


describe('Pricing Rules', () => {
    test("should add more templates from pricing rules when rule is not blocked", () => {
        const { view } = setup({
          pricingRules: [{
                title: "Pricing Rule 1",
                event: "pricing",
                type: "pricing1",
                _id: "pricing1",
                blocked: false,
            }, {
                title: "Pricing Rule 2",
                event: "pricing",
                type: "pricing2",
                _id: "pricing2",
                blocked: true,
            }]
        });
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

        expect(queryByText("Pricing Rule 1")).toBeInTheDocument();
        expect(queryByText("Pricing Rule 2")).not.toBeInTheDocument();
    });

    test("should select new template from pricing rules", async () => {
        const {view, props} = setup({
            pricingRules: [{
                title: "Pricing Rule 1",
                event: "pricing",
                type: "pricing1",
                _id: "pricing1",
                blocked: false,
            }, {
                title: "Pricing Rule 2",
                event: "pricing",
                type: "pricing2",
                _id: "pricing2",
                blocked: false,
          }]
        });
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("Pricing Rule 1"));
        fireEvent.click(queryByText("Pricing Rule 1"));

        expect(queryByText("Pricing Rule 1")).toBeInTheDocument();
        expect(props.onSelectedTemplate).toHaveBeenCalledWith({
            title: "Pricing Rule 1",
            event: "pricing",
            type: "pricing1",
            blocked: false,
        });
    });
});

describe("onSelectedTemplate", () => {

  test("should call correct params when select `increase`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Increase Airbnb Smart Pricing by 20%"));
    fireEvent.click(queryByText("Increase Airbnb Smart Pricing by 20%"));

    expect(queryByText("Increase Airbnb Smart Pricing by 20%")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "floatingPeriod",
        amount: 20,
        scale: "increaseByPercentage",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        floatingPeriodStartDay: 0,
        floatingPeriodLength: 365
    });
  });

  test("should call correct params when select `decrease`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Decrease Airbnb Smart Pricing by $20"));
    fireEvent.click(queryByText("Decrease Airbnb Smart Pricing by $20"));

    expect(queryByText("Decrease Airbnb Smart Pricing by $20")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "floatingPeriod",
        amount: 20,
        scale: "decreaseByPrice",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        floatingPeriodStartDay: 0,
        floatingPeriodLength: 365
    });
  });

  test("should call correct params when select `orphan`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Decrease prices by 30% for orphan periods that are 2 days or less"));
    fireEvent.click(queryByText("Decrease prices by 30% for orphan periods that are 2 days or less"));

    expect(queryByText("Decrease prices by 30% for orphan periods that are 2 days or less")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "orphanPeriod",
        amount: 30,
        scale: "decreaseByPercentage",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        orphanPeriodLength: 2
    });
  });

  test("should call correct params when select `weekends`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Set prices on the weekends to $120"));
    fireEvent.click(queryByText("Set prices on the weekends to $120"));

    expect(queryByText("Set prices on the weekends to $120")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "floatingPeriod",
        amount: 120,
        scale: "fixedPrice",
        limitDays: {
            friday: true,
            saturday: true
        },
        floatingPeriodStartDay: 0,
        floatingPeriodLength: 365
    });
  });

  test("should call correct params when select `lastMinAvailability`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Gradually decrease prices by 40% over the next 7 days"));
    fireEvent.click(queryByText("Gradually decrease prices by 40% over the next 7 days"));

    expect(queryByText("Gradually decrease prices by 40% over the next 7 days")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "floatingPeriod",
        amount: 40,
        scale: "graduallyDecreaseByPercentageReverse",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        floatingPeriodStartDay: 0,
        floatingPeriodLength: 7
    });
  });

  test("should call correct params when select `minPrice`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Set minimum price to $120 for any day after 30 days"));
    fireEvent.click(queryByText("Set minimum price to $120 for any day after 30 days"));

    expect(queryByText("Set minimum price to $120 for any day after 30 days")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "floatingPeriod",
        amount: 120,
        scale: "minPrice",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        floatingPeriodStartDay: 30,
        floatingPeriodLength: 335
    });
  });

  test("should call correct params when select `specificDates`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Set a specific date range to $120"));
    fireEvent.click(queryByText("Set a specific date range to $120"));

    expect(queryByText("Set a specific date range to $120")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "specificDates",
        amount: 120,
        scale: "fixedPrice",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        specificDatesStartDate: startOfDay(new Date()),
        specificDatesEndDate: startOfDay(addDays(new Date(), 7))
    });
  });

  test("should call correct params when select `custom`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Custom pricing rule"));
    fireEvent.click(queryByText("Custom pricing rule"));

    expect(queryByText("Custom pricing rule")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        event: "floatingPeriod",
        amount: 120,
        scale: "minPrice",
        limitDays: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true
        },
        floatingPeriodStartDay: 30,
        floatingPeriodLength: 335
    });
  });
});
