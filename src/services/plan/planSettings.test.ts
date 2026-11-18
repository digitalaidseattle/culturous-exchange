/**
 *  planSettings.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.hoisted(() => vi.fn());
const run = vi.hoisted(() => vi.fn());
vi.mock("../../api/cePlanDao", () => ({ CEPlanDao: { getInstance: () => ({ update }) } }));
vi.mock("./planGenerator", () => ({ PlanGenerator: { getInstance: () => ({ run }) } }));

import { Plan } from "../../api/types";
import { applyPlanSettings } from "./planSettings";

const plan = { id: "p1", name: "Plan 1", group_size: 6, optimization_style: "largest_first" } as Plan;
const SETTINGS = { minOverlapHours: 2, minGroupSize: 3, maxGroupSize: 8, optimizationStyle: "balanced", shuffleSeed: 42 };

describe("applyPlanSettings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        update.mockImplementation(async (_id: string, changes: Partial<Plan>) => ({ ...plan, ...changes }));
        run.mockImplementation(async (saved: Plan) => ({ ...saved, regrouped: true }));
    });

    it("saves the largest group size and the generation method on the plan", async () => {
        await applyPlanSettings(plan, SETTINGS);
        expect(update).toHaveBeenCalledWith("p1", { group_size: 8, optimization_style: "balanced" });
    });

    it("regroups the saved plan with every setting, and the arrangement Optimize chose", async () => {
        await applyPlanSettings(plan, SETTINGS);
        expect(run).toHaveBeenCalledWith(
            expect.objectContaining({ id: "p1", group_size: 8, optimization_style: "balanced" }),
            { maxGroupSize: 8, minGroupSize: 3, minOverlapHours: 2, optimizationStyle: "balanced", shuffleSeed: 42 });
    });

    it("gives back the plan as it is after it was regrouped", async () => {
        const result = await applyPlanSettings(plan, SETTINGS);
        expect(result).toMatchObject({ id: "p1", regrouped: true });
    });

    it("keeps the plan's own generation method when none is given", async () => {
        const { optimizationStyle: _style, ...withoutStyle } = SETTINGS;
        await applyPlanSettings(plan, withoutStyle);
        expect(update).toHaveBeenCalledWith("p1", { group_size: 8, optimization_style: "largest_first" });
    });

    it("regroups nothing when the plan cannot be saved, and says why", async () => {
        update.mockRejectedValue(new Error("offline"));
        await expect(applyPlanSettings(plan, SETTINGS)).rejects.toThrow("offline");
        expect(run).not.toHaveBeenCalled();
    });

    it("says why when the plan cannot be regrouped", async () => {
        run.mockRejectedValue(new Error("database is down"));
        await expect(applyPlanSettings(plan, SETTINGS)).rejects.toThrow("database is down");
    });
});
