import { describe, expect, it } from "vitest";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_TIMEZONE, CETimeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "../../api/types";

describe("timeWindowService", () => {
    const timeWindowService = CETimeWindowService.getInstance();
    const formatTimeWindow = (date: Date, timezone = DEFAULT_TIMEZONE) =>
        formatInTimeZone(date, timezone, "yyyy-MM-dd EEE H");

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
        expect(formatTimeWindow(result)).toBe("2000-09-01 Fri 7");
    });

    it("toZonedTime - Mexico_City", () => {
        const result = timeWindowService.toZonedTime(0, "07:00:00", "America/Mexico_City");
        expect(formatTimeWindow(result, "America/Mexico_City")).toBe("2000-09-01 Fri 7");
        expect(formatTimeWindow(result, DEFAULT_TIMEZONE)).toBe("2000-09-01 Fri 5");
    });

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
        expect(merged).not.toBeNull();
        expect(formatTimeWindow(merged!.start_date_time!)).toBe("2000-09-01 Fri 9");
        expect(formatTimeWindow(merged!.end_date_time!)).toBe("2000-09-01 Fri 12");

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

    it("duration - count", () => {

        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const duration = timeWindowService.duration(timeA);
        expect(duration).toBe(5);

    });

    it("totalDuration", () => {

        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "010:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "11:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const duration = timeWindowService.totalDuration([timeA, timeB]);
        expect(duration).toBe(7);

    });
});
