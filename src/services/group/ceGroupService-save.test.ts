/**
 *  ceGroupService-save.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { CEGroupService } from "./ceGroupService";
import { Group, TimeWindow } from "../../api/types";
import { CETimeWindowDao } from "../../api/ceTimeWindowDao";
import { CEGroupDao } from "../../api/ceGroupDao";

describe("groupService-save", () => {
    const groupService = CEGroupService.getInstance();
    const groupDao = CEGroupDao.getInstance();
    const timeWindowDao = CETimeWindowDao.getInstance();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("save", async () => {

        const tw = {
            id: "tw1"
        } as TimeWindow;

        const group = {
            id: "test",
            time_windows: [tw]
        } as Group;

        const saved = {
            id: "test"
        } as Group;

        // Spies replace the DAO methods on the real singleton instances so no
        // database access happens, while still letting us assert the calls.
        const upsertSpy = vi.spyOn(groupDao, "upsert").mockResolvedValue(saved);
        const deleteSpy = vi.spyOn(timeWindowDao, "deleteByGroupId").mockResolvedValue(true);
        const insertSpy = vi.spyOn(timeWindowDao, "insert").mockResolvedValue(tw);

        const result = await groupService.save(group);

        expect(result).toBe(group);
        expect(upsertSpy).toHaveBeenCalledWith(group);
        // the group must be saved before its time windows are replaced
        expect(upsertSpy.mock.invocationCallOrder[0]).toBeLessThan(deleteSpy.mock.invocationCallOrder[0]);
        expect(deleteSpy).toHaveBeenCalledWith("test");
        expect(insertSpy).toHaveBeenCalledWith(tw);
    });

});
