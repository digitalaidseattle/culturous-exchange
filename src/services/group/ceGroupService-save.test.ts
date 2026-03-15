/**
 *  ceGroupService-save.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { CEGroupService } from "./ceGroupService";
import { CETimeWindowService } from "../../api/ceTimeWindowService";
import { Group, TimeWindow } from "../../api/types";
import { CETimeWindowDao } from "../../api/ceTimeWindowDao";
import { CEGroupDao } from "../../api/ceGroupDao";

describe("groupService-save", () => {
    const groupService = CEGroupService.getInstance();
    const groupDao = CEGroupDao.getInstance();
    const timeWindowService = CETimeWindowService.getInstance();
    const timeWindowDao = CETimeWindowDao.getInstance();

    it("save", () => {

        const tw = {
        } as TimeWindow;

        const savedTw = {
        } as TimeWindow;

        const group = {
            id: "test",
            time_windows: [tw]
        } as Group;

        const inserted = {
        } as Group;

        // Using a spy here to check if methods are called
        // Spies are a simpler alternative to mockFunctions. You can specify a mock function to do more that just return a value.
        vi.spyOn(groupDao, "insert").mockResolvedValue(inserted);
        vi.spyOn(timeWindowDao, "deleteByGroupId").mockResolvedValue(true);
        vi.spyOn(timeWindowService, "save").mockResolvedValue(savedTw);

        groupService.save(group)
            .then(result => {
                expect(result).toBe(group);
                expect(timeWindowDao.deleteByGroupId).toHaveBeenCalledWith("test");
                expect(timeWindowService.save).toHaveBeenCalledWith(tw);
            })
    });

});