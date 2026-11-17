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
            start_date_time: timeWindowService.localTimeToUTC(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow
        const result = timeWindowService.toString(tw);
        expect(result).toBe('Fri 8am - 2pm');
    })

    it("toZonedTime", () => {
        const result = timeWindowService.localTimeToUTC(0, "07:00:00", DEFAULT_TIMEZONE);
        expect(formatTimeWindow(result)).toBe("2000-09-01 Fri 7");
    });

    it("toZonedTime - Mexico_City", () => {
        const result = timeWindowService.localTimeToUTC(0, "07:00:00", "America/Mexico_City");
        expect(formatTimeWindow(result, "America/Mexico_City")).toBe("2000-09-01 Fri 7");
        expect(formatTimeWindow(result, DEFAULT_TIMEZONE)).toBe("2000-09-01 Fri 5");
    });

    it("intersectionTimeWindows", () => {

        const timeA = {
            start_date_time: timeWindowService.localTimeToUTC(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.localTimeToUTC(0, "09:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "13:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.intersectionTimeWindows(timeA, timeB);
        expect(merged).not.toBeNull();
        expect(formatTimeWindow(merged!.start_date_time!)).toBe("2000-09-01 Fri 9");
        expect(formatTimeWindow(merged!.end_date_time!)).toBe("2000-09-01 Fri 12");

    });

    it("intersectionTimeWindows - none", () => {

        const timeA = {
            start_date_time: timeWindowService.localTimeToUTC(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.localTimeToUTC(1, "09:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(1, "13:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.intersectionTimeWindows(timeA, timeB);
        expect(merged).toBeNull();

    });

    it("duration - count", () => {

        const timeA = {
            start_date_time: timeWindowService.localTimeToUTC(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const duration = timeWindowService.duration(timeA);
        expect(duration).toBe(5);

    });

    it("totalDuration", () => {

        const timeA = {
            start_date_time: timeWindowService.localTimeToUTC(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.localTimeToUTC(0, "010:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, "11:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const duration = timeWindowService.totalDuration([timeA, timeB]);
        expect(duration).toBe(7);

    });

    describe("totalHours", () => {
        const window = (from: string, to: string) => ({
            start_date_time: timeWindowService.localTimeToUTC(0, from, DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.localTimeToUTC(0, to, DEFAULT_TIMEZONE)
        } as TimeWindow);

        it("is the real length of a window, without the extra hour that duration adds", () => {
            const eightToNoon = window("08:00:00", "12:00:00");
            expect(timeWindowService.totalHours([eightToNoon])).toBe(4);
            expect(timeWindowService.duration(eightToNoon)).toBe(5);
        });

        it("adds up several windows", () => {
            expect(timeWindowService.totalHours([window("08:00:00", "12:00:00"), window("10:00:00", "11:00:00")])).toBe(5);
            // the same two windows, counted the existing way
            expect(timeWindowService.totalDuration([window("08:00:00", "12:00:00"), window("10:00:00", "11:00:00")])).toBe(7);
        });

        it("keeps half hours", () => {
            expect(timeWindowService.totalHours([window("19:30:00", "20:00:00")])).toBe(0.5);
            expect(timeWindowService.totalHours([window("07:30:00", "09:00:00"), window("10:00:00", "12:00:00")])).toBe(3.5);
        });

        it("is 0 when there are no windows", () => {
            expect(timeWindowService.totalHours([])).toBe(0);
        });
    });

    it("adjustTimeWindows - Mexico_City", () => {
        const timezone = "America/Mexico_City";
        const friday = { day_in_week: "Friday", start_t: "07:00:00", end_t: "12:00:00" } as TimeWindow;
        const saturday = { day_in_week: "Saturday", start_t: "09:00:00", end_t: "17:00:00" } as TimeWindow;
        const profile = { time_zone: timezone, timeWindows: [friday, saturday] } as any;

        timeWindowService.adjustTimeWindows(profile);

        expect(formatTimeWindow(friday.start_date_time, timezone)).toBe("2000-09-01 Fri 7");
        expect(formatTimeWindow(friday.end_date_time, timezone)).toBe("2000-09-01 Fri 12");
        expect(formatTimeWindow(saturday.start_date_time, timezone)).toBe("2000-09-02 Sat 9");
        expect(formatTimeWindow(saturday.end_date_time, timezone)).toBe("2000-09-02 Sat 17");
    });
});
