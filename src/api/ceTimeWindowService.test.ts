import { describe, expect, it } from "vitest";
import { DEFAULT_TIMEZONE, timeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "./types";
import { getTimezoneOffset } from "date-fns-tz";

describe("timeWindowService", () => {
    const offset = getTimezoneOffset(DEFAULT_TIMEZONE, new Date()) / 60 / 60 / 1000;

    it("toString", () => {
        const tw = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow
        const result = timeWindowService.toString(tw);
        expect(result).toBe('Fri 8am - 2pm');
    })

    it("toZonedTime", () => {

        const result = timeWindowService.toZonedTime(0, "07:00:00", DEFAULT_TIMEZONE);
        expect(result.getDate()).toBe(1);
        expect(result.getDay()).toBe(5);
        expect(result.getHours()).toBe(7); // PDT is UTC-7, so 7+7=14
        expect(result.getUTCHours()).toBe(7 - offset); // PDT is UTC-7, so 7+7=14
    })

    it("intersectionTimeWindows", () => {

        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "09:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "13:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.intersectionTimeWindows(timeA, timeB);
        expect(merged?.start_date_time?.getDay()).toBe(5);
        expect(merged?.start_date_time?.getHours()).toBe(9);
        expect(merged?.end_date_time?.getHours()).toBe(12);

    });

    it("intersectionTimeWindows - none", () => {

        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(1, "09:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(1, "13:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.intersectionTimeWindows(timeA, timeB);
        expect(merged).toBeNull();

    });

});