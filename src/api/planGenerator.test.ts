/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { placementService } from "./cePlacementService";
import { planGenerator } from "./planGenerator";
import { Group, Placement, Plan, TimeWindow } from "./types";
import { groupService } from "./ceGroupService";
import { planService } from "./cePlanService";

vi.mock("./cePlacementService", () => {
    return {
        placementService: {
            updatePlacement: vi.fn(),

        }
    };
});

vi.mock("./ceGroupService", () => {
    return {
        groupService: {
            deleteGroup: vi.fn(),
            createDefaultTimewindows: vi.fn()
        },
    };
});

vi.mock("./cePlanService", () => {
    return {
        planService: {
            getById: vi.fn(),
        },
    };
});

describe("planGenerator", () => {

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

        (placementService.updatePlacement as ReturnType<typeof vi.fn>).mockResolvedValue(Promise.resolve(placementLessPlan));
        (groupService.deleteGroup as ReturnType<typeof vi.fn>).mockResolvedValue(Promise.resolve());
        (planService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(Promise.resolve(emptyPlan));

        planGenerator.emptyPlan(plan)
            .then(result => {
                expect(result).toBe(emptyPlan);
                expect(placementService.updatePlacement).toHaveBeenCalledWith("test", "123", { group_id: null });
                expect(groupService.deleteGroup).toHaveBeenCalledWith(group);
                expect(planService.getById).toHaveBeenCalledWith("test");
            })

    });

    it("createGroups", () => {

        const plan = {
            id: "test"
        } as Plan;

        (groupService.createDefaultTimewindows as ReturnType<typeof vi.fn>).mockReturnValue([{} as TimeWindow]);
        planGenerator.createGroups(plan, 2)
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