/**
 *  cePlanService.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { groupService } from "./ceGroupService";
import { placementService } from "./cePlacementService";
import { planService } from "./cePlanService";
import { Group, Placement, Plan } from "./types";

describe("planService", () => {

    vi.mock("./cePlacementService", () => {
        return {
            placementService: {
                mapJson: vi.fn()
            }
        };
    });

    vi.mock("./ceGroupService", () => {
        return {
            groupService: {
                mapJson: vi.fn()
            }
        };
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

        (placementService.mapJson as ReturnType<typeof vi.fn>)
            .mockReturnValueOnce(placement1)
            .mockReturnValueOnce(placement2);
        (groupService.mapJson as ReturnType<typeof vi.fn>).mockReturnValue(group);

        const result = planService.mapJson(json);
        expectTypeOf(result).toMatchTypeOf<Plan>();
        expect(result.id).toBe("plan1");
        expect(result.name).toBe("Test Plan");
        expect(result.placements.length).toBe(2);
        expect(result.groups[0]).toBe(group);
        expect(result.placements.length).toBe(2);
        expect(group.placements!.length).toBe(1);
        expect(group.placements![0]).toBe(placement1);
    })

});