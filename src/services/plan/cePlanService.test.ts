/**
 *  cePlanService.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { CEGroupDao } from "../../api/ceGroupDao";
import { CEPlacementDao } from "../../api/cePlacementDao";
import { CEPlanDao } from "../../api/cePlanDao";
import { Group, Placement, Plan } from "../../api/types";

describe("planService", () => {
    const groupDao = CEGroupDao.getInstance();
    const planDao = CEPlanDao.getInstance();
    const placementDao = CEPlacementDao.getInstance();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("mapJson", () => {

        const json = {
            id: "plan1",
            name: "Test Plan",
            placement: [
                { id: "placement1", plan_id: "plan1", student_id: "student1", group_id: "group1", anchor: false, priority: 0 },
                { id: "placement2", plan_id: "plan1", student_id: "student2", group_id: null, anchor: true, priority: 0 }
            ],
            grouptable: [
                { id: "group1", plan_id: "plan1", name: "Group 1", country_count: 2, time_windows: [] }
            ]
        }

        const placement1 = { group_id: "group1" } as Placement;
        const placement2 = { group_id: null } as Placement;
        const group = { id: "group1" } as Group;

        vi.spyOn(placementDao, "mapJson")
            .mockReturnValueOnce(placement1)
            .mockReturnValueOnce(placement2);
        vi.spyOn(groupDao, "mapJson").mockReturnValue(group);

        const result = planDao.mapJson(json);
        expectTypeOf(result).toMatchTypeOf<Plan>();
        expect(result.id).toBe("plan1");
        expect(result.name).toBe("Test Plan");
        expect(result.placements.length).toBe(2);
        expect(result.groups.length).toBe(1);
        // placement1 is grouped under group1; placement2 has no group
        expect(result.groups[0].placements).toEqual([placement1]);
        // the raw supabase join fields are removed
        expect((result as any).placement).toBeUndefined();
        expect((result as any).grouptable).toBeUndefined();
    });

});
