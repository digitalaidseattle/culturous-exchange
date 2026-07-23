/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { CEGroupDao } from "../../api/ceGroupDao";
import { CETimeWindowDao } from "../../api/ceTimeWindowDao";
import { Group, TimeWindow } from "../../api/types";
import { CETimeWindowService } from "../time/ceTimeWindowService";
import { CEGroupService } from "./ceGroupService";


describe("groupService", () => {

    const mockTimeWindowService = {
        createDefaultTimewindows: vi.fn(() => { })
    } as unknown as CETimeWindowService;

    const mockTimeWindowDao = {
        delete: vi.fn(() => { })
    } as unknown as CETimeWindowDao;

    const mockGroupDao = {
        delete: vi.fn(() => { })
    } as unknown as CEGroupDao;

    const groupService = new CEGroupService();

    it("createDefaultTimewindows", () => {

        const group = {
            id: "test"
        } as Group;

        const timeWindow = {} as TimeWindow;
        const timeWindows = [timeWindow];

        const getTimeWindowServiceSpy = vi.spyOn(CETimeWindowService, "getInstance").mockReturnValue(mockTimeWindowService);
        const createDefaultTimewindowsSpy = vi.spyOn(mockTimeWindowService, "createDefaultTimewindows").mockReturnValue(timeWindows);

        const result = groupService.createDefaultTimewindows(group)

        expect(getTimeWindowServiceSpy).toHaveBeenCalledOnce();
        expect(createDefaultTimewindowsSpy).toHaveBeenCalledOnce();
        expect(result[0].group_id).toBe("test");
    });

    it("deleteGroup", () => {
        const tw = {
            id: "twid"
        } as TimeWindow;

        const group = {
            id: "test",
            time_windows: [tw]
        } as Group;

        const getimeWindowDaoSpy = vi.spyOn(CETimeWindowDao, "getInstance").mockReturnValue(mockTimeWindowDao);
        const getGroupDaoSpy = vi.spyOn(CEGroupDao, "getInstance").mockReturnValue(mockGroupDao);
        vi.spyOn(mockTimeWindowDao, "delete").mockResolvedValue();
        vi.spyOn(mockGroupDao, "delete").mockResolvedValue();

        groupService.deleteGroup(group)
            .then(_result => {
                expect(getimeWindowDaoSpy).toHaveBeenCalledOnce();
                expect(getGroupDaoSpy).toHaveBeenCalledOnce();
                expect(mockTimeWindowDao.delete).toBeCalledWith("twid");
                expect(mockGroupDao.delete).toBeCalledWith("test");
            })
    });



});