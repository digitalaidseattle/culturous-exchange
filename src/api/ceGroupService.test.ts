/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { groupService } from "./ceGroupService";
import { Group, TimeWindow } from "./types";
import { getTimezoneOffset } from "date-fns-tz";
import { DEFAULT_TIMEZONE, timeWindowService } from "./ceTimeWindowService";

describe("groupService", () => {
    const offset = getTimezoneOffset(DEFAULT_TIMEZONE, new Date()) / 60 / 60 / 1000

    it("createDefaultTimewindows", () => {

        const group = {
            id: "test"
        } as Group;

        const result = groupService.createDefaultTimewindows(group)

        expect(result.length).toBe(3);
        expect(result[0].start_date_time.getDay()).toBe(5);
        expect(result[0].start_date_time.getHours()).toBe(7);
        expect(result[0].start_date_time.getUTCHours()).toBe(7 - offset);
        expect(result[2].end_date_time.getDay()).toBe(0);
        expect(result[2].end_date_time.getHours()).toBe(22);

    });

    it("deleteGroup", () => {
        const tw = {
            id: "twid"
        } as TimeWindow;

        const group = {
            id: "test",
            time_windows: [tw]
        } as Group;

        vi.spyOn(timeWindowService, "delete").mockResolvedValue();
        vi.spyOn(groupService, "delete").mockResolvedValue();
        groupService.deleteGroup(group)
            .then(_result => {
                expect(timeWindowService.delete).toBeCalledWith("twid");
                expect(groupService.delete).toBeCalledWith("test");
            })
    });



});