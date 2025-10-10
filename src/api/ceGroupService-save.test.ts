/**
 *  ceGroupService-save.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { groupService } from "./ceGroupService";
import { timeWindowService } from "./ceTimeWindowService";
import { Group, TimeWindow } from "./types";

describe("groupService-save", () => {

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
        vi.spyOn(groupService, "insert").mockResolvedValue(inserted);
        vi.spyOn(timeWindowService, "deleteByGroupId").mockResolvedValue(true);
        vi.spyOn(timeWindowService, "save").mockResolvedValue(savedTw);

        groupService.save(group)
            .then(result => {
                expect(result).toBe(group);
                expect(timeWindowService.deleteByGroupId).toHaveBeenCalledWith("test");
                expect(timeWindowService.save).toHaveBeenCalledWith(tw);
            })
    });

});