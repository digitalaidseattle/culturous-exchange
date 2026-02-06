import { describe, expect, it } from "vitest";
import { DEFAULT_TIMEZONE, timeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "./types";

// Helper to build expected PST wall-time strings independent of runner timezone
const dayNames = ['Fri', 'Sat', 'Sun'];
function h12(hour24: number) {
    const h = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const ampm = hour24 < 12 ? 'am' : 'pm';
    return `${h}${ampm}`;
}
function expectedString(dayOffset: number, startH: number, endH: number) {
    return `${dayNames[dayOffset]} ${h12(startH)} - ${h12(endH)}`;
}

describe("timeWindowService", () => {

    it("union, 'AS', 'AE', 'BS', 'BE' - none", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "10:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "13:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.unionTimeWindows(timeA, timeB);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(2);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 8, 10));
        expect(timeWindowService.toString(merged[1], DEFAULT_TIMEZONE)).toBe(expectedString(0, 12, 13));
    });

    it("union, 'AS', 'AE', 'BS', 'BE' - union", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00",DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "13:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.unionTimeWindows(timeA, timeB);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 8, 13));
    });

    it("union, 'AS', 'BS', 'BE', 'AE' - overlap", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00",DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "17:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.unionTimeWindows(timeA, timeB);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 8, 17));
    });

    it("union, 'BS', 'BE', 'AS', 'AE' - overlap", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.unionTimeWindows(timeA, timeB);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 8, 14));
    });

    it("union, 'BS', 'BE', 'AS', 'AE' - none", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "16:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "18:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const union = timeWindowService.unionTimeWindows(timeA, timeB);
        expect(union).toBeDefined();
        expect(union.length).toBe(2);
        expect(timeWindowService.toString(union[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 12, 14));
        expect(timeWindowService.toString(union[1], DEFAULT_TIMEZONE)).toBe(expectedString(0, 16, 18));
    });

    it("union, different day - none", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(1, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(1, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const union = timeWindowService.unionTimeWindows(timeA, timeB);
        expect(union).toBeDefined();
        expect(union.length).toBe(2);
        expect(timeWindowService.toString(union[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 8, 14));
        expect(timeWindowService.toString(union[1], DEFAULT_TIMEZONE)).toBe(expectedString(1, 8, 14));
    });

    it("merge - small", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.mergeTimeWindows([timeA]);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 12, 14));
    });

    it("merge - two", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "18:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.mergeTimeWindows([timeA, timeB]);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 12, 18));
    });

    it("merge - back2back2back", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "18:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeC = {
            start_date_time: timeWindowService.toZonedTime(0, "18:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "20:00:00",DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.mergeTimeWindows([timeA, timeB, timeC]);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 12, 20));
    });

    it("merge - three", () => {
        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeB = {
            start_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "18:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const timeC = {
            start_date_time: timeWindowService.toZonedTime(1, "14:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(1, "18:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.mergeTimeWindows([timeA, timeB, timeC]);
        expect(merged).toBeDefined();
        expect(merged.length).toBe(2);
        expect(timeWindowService.toString(merged[0], DEFAULT_TIMEZONE)).toBe(expectedString(0, 12, 18));
        expect(timeWindowService.toString(merged[1], DEFAULT_TIMEZONE)).toBe(expectedString(1, 14, 18));
    });

});