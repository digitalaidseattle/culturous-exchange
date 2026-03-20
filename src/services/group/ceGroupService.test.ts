/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { CEGroupService } from "./ceGroupService";
import { CETimeWindowDao } from "../../api/ceTimeWindowDao";
import { Group, TimeWindow } from "../../api/types";
import { CEGroupDao } from "../../api/ceGroupDao";

describe("groupService", () => {
    const offset = -7; // using a fixed offset to make test deterministic; 
    const groupService = CEGroupService.getInstance();
    const groupDao = CEGroupDao.getInstance();
    const timeWindowDao = CETimeWindowDao.getInstance();

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

        vi.spyOn(timeWindowDao, "delete").mockResolvedValue();
        vi.spyOn(groupDao, "delete").mockResolvedValue();
        groupService.deleteGroup(group)
            .then(_result => {
                expect(timeWindowDao.delete).toBeCalledWith("twid");
                expect(groupDao.delete).toBeCalledWith("test");
            })
    });



});