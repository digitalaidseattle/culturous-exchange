import { describe, expect, it } from "vitest";
import { DEFAULT_TIMEZONE, timeWindowService } from "./ceTimeWindowService";
import { TimeWindow } from "./types";

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
        expect(merged[0].start_date_time?.getHours()).toBe(8);
        expect(merged[0].end_date_time?.getHours()).toBe(10);
        expect(merged[1].start_date_time?.getHours()).toBe(12);
        expect(merged[1].end_date_time?.getHours()).toBe(13);
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
        expect(merged[0].start_date_time?.getHours()).toBe(8);
        expect(merged[0].end_date_time?.getHours()).toBe(13);
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
        expect(merged[0].start_date_time?.getHours()).toBe(8);
        expect(merged[0].end_date_time?.getHours()).toBe(17);
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
        expect(merged[0].start_date_time?.getHours()).toBe(8);
        expect(merged[0].end_date_time?.getHours()).toBe(14);
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
        expect(union[0].start_date_time?.getHours()).toBe(12);
        expect(union[0].end_date_time?.getHours()).toBe(14);
        expect(union[1].start_date_time?.getHours()).toBe(16);
        expect(union[1].end_date_time?.getHours()).toBe(18);
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
        expect(union[0].start_date_time?.getHours()).toBe(8);
        expect(union[0].end_date_time?.getHours()).toBe(14);
        expect(union[1].start_date_time?.getHours()).toBe(8);
        expect(union[1].end_date_time?.getHours()).toBe(14);
    });

    it("merge - small", () => {

        const timeA = {
            start_date_time: timeWindowService.toZonedTime(0, "12:00:00", DEFAULT_TIMEZONE),
            end_date_time: timeWindowService.toZonedTime(0, "14:00:00", DEFAULT_TIMEZONE)
        } as TimeWindow;

        const merged = timeWindowService.mergeTimeWindows([timeA]);

        expect(merged).toBeDefined();
        expect(merged.length).toBe(1);
        expect(merged[0].start_date_time?.getHours()).toBe(12);
        expect(merged[0].end_date_time?.getHours()).toBe(14);
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
        expect(merged[0].start_date_time?.getHours()).toBe(12);
        expect(merged[0].end_date_time?.getHours()).toBe(18);
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
        expect(merged[0].start_date_time?.getHours()).toBe(12);
        expect(merged[0].end_date_time?.getHours()).toBe(20);
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
        expect(merged[0].start_date_time?.getHours()).toBe(12);
        expect(merged[0].end_date_time?.getHours()).toBe(18);
    });

});