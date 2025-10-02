import { describe, expect, it } from "vitest";
import { DEFAULT_TIMEZONE, timeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "./types";

describe("timeWindowService", () => {

    it("calcAvailability", () => {

        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "10:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(1, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(1, "15:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const result = timeWindowService.calcAvailability([timeA, timeB]);
        expect(result.friday).toStrictEqual([
            false, true, true,
            true, false, false,
            false, false, false,
            false, false, false,
            false, false, false,
            false
        ]);
        //  expect(result.saturday).toStrictEqual([
        //     false, false, false,
        //     false, false, true,
        //     true, true, true,
        //     false, false, false,
        //     false, false, false,
        //     false
        // ]);

    });


});