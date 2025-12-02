import { describe, expect, it, vi } from "vitest";
import { planEvaluator } from "./planEvaluator";
import { Group, Plan, TimeWindow } from "./types";
import { timeWindowService } from "./ceTimeWindowService";

describe("planEvaluator", () => {

    it("evaluate", () => {
        const groupA = {} as Group;
        const groupB = {} as Group;
        const plan = {
            groups: [groupA, groupB]
        } as Plan;

        vi.spyOn(planEvaluator, "evaluateGroup").mockResolvedValue({} as Group);

        planEvaluator.evaluate(plan)
            .then(() => {
                expect(planEvaluator.evaluateGroup).toHaveBeenCalledWith(groupA);
                expect(planEvaluator.evaluateGroup).toHaveBeenCalledWith(groupB);
            })
    })

    it("calcDuration", () => {
        const tws: TimeWindow[] = [];
        const groupA = {
            id: 'test',
            time_windows: tws
        } as Group;

        const spyDuration = vi.spyOn(timeWindowService, "overlapDuration").mockReturnValue(5);

        const result = planEvaluator.calcDuration(groupA)
        expect(spyDuration).toHaveBeenCalledWith(tws);
        expect(result).toBe(5);
    })

});