import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import SelectCountry from "@/admin/components/SelectCountry";


jest.mock("../../node_modules/country-region-data/data.json", () => ([{
  countryName: "Australia",
  countryShortCode: "AU",
}, {
  countryName: "United States",
  countryShortCode: "US",
}, {
  countryName: "United Kingdom",
  countryShortCode: "GB",
}]));

const setup = (bindings) => {
  const props = {
    onSelectedOption: jest.fn(),
    isDisabled: false,
    ...bindings,
  }

  const view = render(<SelectCountry {...props} />);

  return {
    view,
    props,
  };
};

test("should show default value when has no selected value", () => {
  setup();
  const { queryByText } = screen;

  expect(queryByText("United States")).toBeInTheDocument();
});

test("should call `onSelectedOption` props when change option", async () => {
  const { view, props } = setup();
  const { container } = view;
  const { queryByText } = screen;

  fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' });
  await waitFor(() => queryByText('Australia'));
  fireEvent.click(queryByText('Australia'));

  expect(queryByText('Australia')).toBeInTheDocument();
  expect(props.onSelectedOption).toHaveBeenCalledWith({"label": "Australia", "value": "AU"});
});
