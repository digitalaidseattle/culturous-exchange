/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlanGenerator } from "./planGenerator";
import { CEGroupService } from "../group/ceGroupService";
import { CEPlanDao } from "../../api/cePlanDao";
import { Group, Placement, Plan, TimeWindow } from "../../api/types";
import { CEPlacementService } from "../cePlacementService";

describe("planGenerator", () => {
    const groupService = CEGroupService.getInstance();
    const planDao = CEPlanDao.getInstance();
    const placementService = CEPlacementService.getInstance();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("emptyPlan", async () => {

        const placement = {
            student_id: "123",
        } as Placement;

        const group = {
            plan_id: "test",
        } as Group;

        const plan = {
            id: "test",
            placements: [placement],
            groups: [group]
        } as Plan;

        const placementLessPlacement = {
            plan_id: "test",
            student_id: "123",
        } as Placement;

        const emptyPlan = {
            id: "test-empty"
        } as Plan;

        const updateSpy = vi.spyOn(placementService, "updatePlacement").mockResolvedValue(placementLessPlacement);
        const deleteSpy = vi.spyOn(groupService, "deleteGroup").mockResolvedValue();
        const getByIdSpy = vi.spyOn(planDao, "getById").mockResolvedValue(emptyPlan);

        const result = await PlanGenerator.getInstance().emptyPlan(plan);

        expect(result).toBe(emptyPlan);
        expect(updateSpy).toHaveBeenCalledWith("test", "123", { group_id: null });
        expect(deleteSpy).toHaveBeenCalledWith(group);
        expect(getByIdSpy).toHaveBeenCalledWith("test");
    });

    it("createGroups", async () => {

        const plan = {
            id: "test"
        } as Plan;

        vi.spyOn(groupService, "createDefaultTimewindows").mockReturnValue([{} as TimeWindow]);

        const result = await PlanGenerator.getInstance().createGroups(plan, 2);

        expect(result.length).toBe(2);
        expect(result[0].id).toBeDefined();
        expect(result[0].plan_id).toBe("test");
        expect(result[0].name).toBe("Group 1");
        expect(result[0].country_count).toBe(0);
        expect(result[0].time_windows?.length).toBe(1);
        expect(result[0].placements?.length).toBe(0);
        expect(result[1].id).toBeDefined();
        expect(result[1].plan_id).toBe("test");
        expect(result[1].name).toBe("Group 2");
    });

});
