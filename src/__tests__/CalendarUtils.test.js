import {
    getAllPrices,
    buildCalendarArray,
    updateSelectedDates,
    differenceInDaysToNearestDay,
    roundToNearestDate
} from "../admin/components/CalendarUtils";

describe("getAllPrices", () => {
    it("should fetch successfully", async () => {
        const prices = [];

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([])
        });

        const result = await getAllPrices();

        expect(global.fetch).toHaveBeenCalledWith("/getAllPrices");
        expect(result).toEqual(prices);
    });

    it("should fail to fetch", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue()
        });

        const result = await getAllPrices();

        expect(global.fetch).toHaveBeenCalledWith("/getAllPrices");
        expect(result).toEqual({});
    });

    it("should reject to fetch", async () => {
        global.fetch = jest.fn().mockRejectedValue(500);

        expect(getAllPrices()).rejects.toEqual(500);
    });
});

describe("buildCalendarArray", () => {
    const selectedDates = {
        startDate: new Date("2021-1-01"),
        endDate: new Date("2021-1-03")
    };

    it("should be starting in the same date with start date in selected dates", () => {
        const calendarArray = [
            {
                localDate: new Date("2021-1-01"),
                isSelected: true
            }
        ];

        const result = buildCalendarArray(selectedDates, calendarArray);

        expect(result).toEqual([
            {
                ...calendarArray[0],
                isSelected: true
            }
        ]);
    });

    it("should be in the middle of range selected dates", () => {
        const calendarArray = [
            {
                localDate: new Date("2021-1-02"),
                isSelected: true
            }
        ];

        const result = buildCalendarArray(selectedDates, calendarArray);

        expect(result).toEqual([
            {
                ...calendarArray[0]
            }
        ]);
    });

    it("should be out of range selected dates", () => {
        const calendarArray = [
            {
                localDate: new Date("2021-1-04"),
                isSelected: true
            }
        ];

        const result = buildCalendarArray(selectedDates, calendarArray);

        expect(result).toEqual([
            {
                ...calendarArray[0],
                isSelected: false
            }
        ]);
    });

    it("should be out of range selected dates but no selected", () => {
        const calendarArray = [
            {
                localDate: new Date("2021-1-04"),
                isSelected: false
            }
        ];

        const result = buildCalendarArray(selectedDates, calendarArray);

        expect(result).toEqual([
            {
                ...calendarArray[0],
                isSelected: false
            }
        ]);
    });
});

describe("updateSelectedDates", () => {
    const listing = {
        _id: "1",
        airbnbTimeZone: "Asia/Saigon"
    };
    const day = {
        currencySymbol: "$",
        appliedRules: [],
        priceFormatted: "$20",
        currentPrice: 20,
        price: 30,
        currentPriceFormatted: "$30"
    };
    const selectedDates = {
        startDate: new Date("2021-1-01"),
        endDate: new Date("2021-1-03")
    };

    it("should have no selected dates", () => {
        const result = updateSelectedDates(
            [],
            listing,
            {
                ...selectedDates,
                startDate: null,
                endDate: null
            },
            day
        );

        expect(result).toEqual({
            ...day,
            listingID: "1"
        });
    });

    it("should have both selected dates", () => {
        const result = updateSelectedDates([], listing, selectedDates, day);

        expect(result).toEqual({
            blocked: undefined,
            listingID: "1",
            startDate: undefined,
            endDate: undefined
        });
    });

    describe("only having startDate", () => {
        const setup = (arr, {localDate}) =>
            updateSelectedDates(
                arr,
                listing,
                {
                    ...selectedDates,
                    endDate: null
                },
                {
                    ...day,
                    localDate
                }
            );

        it("should have the same start and end date", () => {
            const result = setup(
                [
                    {
                        date: new Date("2020-12-25")
                    }
                ],
                {
                    localDate: new Date("2021-1-01")
                }
            );

            expect(result).toEqual({
                blocked: undefined,
                listingID: "1",
                startDate: new Date("2021-1-01"),
                endDate: new Date("2021-1-01")
            });
        });

        it("should have the start date as local date", () => {
            const result = setup(
                [
                    {
                        date: new Date("2020-12-25")
                    }
                ],
                {
                    localDate: new Date("2020-12-24")
                }
            );

            expect(result).toEqual({
                blocked: false,
                listingID: "1",
                startDate: new Date("2020-12-24"),
                endDate: new Date("2021-1-01")
            });
        });

        it("should have the end date as unset", () => {
            const result = setup(
                [
                    {
                        date: new Date("2020-12-25"),
                        occupied: true
                    }
                ],
                {
                    localDate: new Date("2020-12-24")
                }
            );

            expect(result).toEqual({
                blocked: false,
                listingID: "1",
                startDate: new Date("2020-12-24"),
                endDate: undefined
            });
        });

        it("should have the end date as unset", () => {
            const result = setup(
                [
                    {
                        date: new Date("2020-12-25")
                    },
                    {
                        date: new Date("2020-12-26"),
                        blocked: true
                    },
                    {
                        date: new Date("2020-12-27")
                    }
                ],
                {
                    localDate: new Date("2020-12-24")
                }
            );

            expect(result).toEqual({
                blocked: undefined,
                listingID: "1",
                startDate: new Date("2020-12-24"),
                endDate: new Date("2021-1-01")
            });
        });

        it("should have end date as local date", () => {
            const result = setup(
                [
                    {
                        date: new Date("2021-1-2"),
                        blocked: true
                    }
                ],
                {
                    localDate: new Date("2021-1-15")
                }
            );

            expect(result).toEqual({
                blocked: true,
                listingID: "1",
                startDate: new Date("2021-1-01"),
                endDate: new Date("2021-1-15")
            });
        });

        it("should have end date as local date but no blocked defined", () => {
            const result = setup(
                [
                    {
                        date: new Date("2021-1-2"),
                        blocked: true
                    },
                    {
                        date: new Date("2021-1-3"),
                        blocked: false
                    }
                ],
                {
                    localDate: new Date("2021-1-15")
                }
            );

            expect(result).toEqual({
                blocked: undefined,
                listingID: "1",
                startDate: new Date("2021-1-01"),
                endDate: new Date("2021-1-15")
            });
        });
    });
});

describe("differenceInDaysToNearestDay", () => {
    it("should work properly", () => {
        const result = differenceInDaysToNearestDay(new Date("2021-1-01"), new Date("2021-1-04"));

        expect(result).toBe(-3);
    });
});

describe("roundToNearestDate", () => {
    it("should work properly", () => {
        const d = new Date("2021-1-01");
        const result = roundToNearestDate(d);

        expect(result).toEqual(d);
    });
});
