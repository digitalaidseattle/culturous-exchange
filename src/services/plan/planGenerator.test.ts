/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";

import { PlanGenerator } from "./planGenerator";
import { CEGroupService } from "../group/ceGroupService";
import { CEPlanDao } from "../../api/cePlanDao";
import { Group, Placement, Plan, TimeWindow } from "../../api/types";
import { CEPlacementService } from "../cePlacementService";

describe("planGenerator", () => {
    const groupService = CEGroupService.getInstance();
    const planDao = CEPlanDao.getInstance();
    const placementService = CEPlacementService.getInstance();

    it("emptyPlan", () => {

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

        const placementLessPlan = {
            id: "test-less"
        } as Plan;

        const emptyPlan = {
            id: "test-empty"
        } as Plan;

        vi.spyOn(placementService, 'updatePlacement').mockResolvedValue(placementLessPlan as any);
        vi.spyOn(groupService, 'deleteGroup').mockResolvedValue(undefined as any);
        vi.spyOn(planDao, 'getById').mockResolvedValue(emptyPlan as any);

        PlanGenerator.getInstance().emptyPlan(plan)
            .then(result => {
                expect(result).toBe(emptyPlan);
                expect(placementService.updatePlacement).toHaveBeenCalledWith("test", "123", { group_id: null });
                expect(groupService.deleteGroup).toHaveBeenCalledWith(group);
                expect(planDao.getById).toHaveBeenCalledWith("test");
            })

    });

    it("createGroups", () => {

        const plan = {
            id: "test"
        } as Plan;

        vi.spyOn(groupService, 'createDefaultTimewindows').mockReturnValue([{} as TimeWindow]);
        PlanGenerator.getInstance().createGroups(plan, 2)
            .then(result => {
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
            })

    });

});