import { describe, expect, it } from "vitest";
import { timeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "./types";

describe("timeWindowService", () => {

    it("calcAvailability", () => {

        const timeA = {
            start_date_time: timeWindowService.toDateTime(0, "08:00:00", 8),
            end_date_time: timeWindowService.toDateTime(0, "10:00:00", 8)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toDateTime(1, "12:00:00", 8),
            end_date_time: timeWindowService.toDateTime(1, "15:00:00", 8)
        } as TimeWindow;

        const result = timeWindowService.calcAvailability([timeA, timeB], 8);
        console.log(result)
        expect(result.friday).toStrictEqual([
            false, true, true,
            true, false, false,
            false, false, false,
            false, false, false,
            false, false, false,
            false
        ]);
         expect(result.saturday).toStrictEqual([
            false, false, false,
            false, false, true,
            true, true, true,
            false, false, false,
            false, false, false,
            false
        ]);


    });


});