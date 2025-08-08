import { describe, expect, it } from "vitest";
import { timeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "./types";

describe("timeWindowService", () => {

    it("toDateTime", () => {

        const result = timeWindowService.toDateTime(0, "08:00:00", 0);
        expect(result.getDate()).toBe(1);
        expect(result.getHours()).toBe(8);
        expect(result.getDay()).toBe(5);

        const result2 = timeWindowService.toDateTime(2, "08:00:00", 3);
        expect(result2.getDate()).toBe(3);
        expect(result2.getHours()).toBe(11);
        expect(result2.getDay()).toBe(0);

    });


    it("toTimeWindowDate", () => {

        const dateTime = timeWindowService.toDateTime(1, "08:00:00", 3);

        const timeWindow = timeWindowService.toTimeWindowDate(dateTime, 3);

        expect(timeWindow.day).toBe(6);  //  6 is Saturday
        expect(timeWindow.time).toBe("08:00:00");

    });

    it("intersectionTimeWindows", () => {

        const timeA = {
            start_date_time: timeWindowService.toDateTime(0, "08:00:00", 0),
            end_date_time: timeWindowService.toDateTime(0, "12:00:00", 0)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toDateTime(0, "09:00:00", 0),
            end_date_time: timeWindowService.toDateTime(0, "13:00:00", 0)
        } as TimeWindow;

        const merged = timeWindowService.intersectionTimeWindows(timeA, timeB);
        expect(merged?.start_date_time?.getDay()).toBe(5);
        expect(merged?.start_date_time?.getHours()).toBe(9);
        expect(merged?.end_date_time?.getHours()).toBe(12);

    });

    it("intersectionTimeWindows - none", () => {

        const timeA = {
            start_date_time: timeWindowService.toDateTime(0, "08:00:00", 0),
            end_date_time: timeWindowService.toDateTime(0, "12:00:00", 0)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toDateTime(1, "09:00:00", 0),
            end_date_time: timeWindowService.toDateTime(1, "13:00:00", 0)
        } as TimeWindow;

        const merged = timeWindowService.intersectionTimeWindows(timeA, timeB);
        expect(merged).toBeNull();

    });

});