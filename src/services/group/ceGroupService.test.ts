/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { formatInTimeZone } from "date-fns-tz";
import { CEGroupService } from "./ceGroupService";
import { CETimeWindowDao } from "../../api/ceTimeWindowDao";
import { Group, TimeWindow } from "../../api/types";
import { CEGroupDao } from "../../api/ceGroupDao";
import { DEFAULT_TIMEZONE } from "../time/ceTimeWindowService";

describe("groupService", () => {
    const groupService = CEGroupService.getInstance();
    const groupDao = CEGroupDao.getInstance();
    const timeWindowDao = CETimeWindowDao.getInstance();
    const formatDefaultTimeZone = (date: Date) =>
        formatInTimeZone(date, DEFAULT_TIMEZONE, "EEE H");

    it("createDefaultTimewindows", () => {

        const group = {
            id: "test"
        } as Group;

        const result = groupService.createDefaultTimewindows(group)

        expect(result.length).toBe(3);
        expect(formatDefaultTimeZone(result[0].start_date_time)).toBe("Fri 7");
        expect(formatDefaultTimeZone(result[2].end_date_time)).toBe("Sun 22");
        
    });

    it("deleteGroup", () => {
        const tw = {
            id: "twid"
        } as TimeWindow;

        const group = {
            id: "test",
            time_windows: [tw]
        } as Group;

        vi.spyOn(timeWindowDao, "delete").mockResolvedValue();
        vi.spyOn(groupDao, "delete").mockResolvedValue();
        groupService.deleteGroup(group)
            .then(_result => {
                expect(timeWindowDao.delete).toBeCalledWith("twid");
                expect(groupDao.delete).toBeCalledWith("test");
            })
    });



});
