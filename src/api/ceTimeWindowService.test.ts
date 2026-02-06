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
    // using formatInTimeZone to make tests deterministic across runner timezones

    it("toString", () => {
        const tw = {
            start_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow
        const result = timeWindowService.toString(tw);
    // compare against an expected PST wall-time string constructed from input
    expect(result).toBe(expectedString(0, 8, 14));
    })

    it("toZonedTime", () => {
        const result = timeWindowService.toZonedTime(0, "07:00:00", DEFAULT_TIMEZONE);
        const tw = {
            start_date_time: result,
            end_date_time: timeWindowService.toZonedTime(0, "08:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;
    // assert expected wall-time in PST constructed from the input
    expect(timeWindowService.toString(tw, DEFAULT_TIMEZONE)).toBe(expectedString(0, 7, 8));
    });

    it("toZonedTime - Mexico_City", () => {
        const result = timeWindowService.toZonedTime(0, "07:00:00", "America/Mexico_City");
        const tw = {
            start_date_time: result,
            end_date_time: timeWindowService.toZonedTime(0, "08:00:00", "America/Mexico_City")
        } as TimeWindow;
        expect(timeWindowService.toString(tw, 'America/Mexico_City')).toBe(expectedString(0, 11, 12));
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
    expect(timeWindowService.toString(merged!, DEFAULT_TIMEZONE)).toBe(expectedString(0, 9, 12));

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