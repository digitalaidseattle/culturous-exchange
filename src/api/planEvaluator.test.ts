import { describe, expect, it, vi } from "vitest";
import { PlanEvaluator, planEvaluator } from "./planEvaluator";
import { Group, Placement, Plan, TimeWindow } from "./types";
import { timeWindowService } from "./ceTimeWindowService";
import { groupService } from "./ceGroupService";

describe("planEvaluator", () => {

    it("evaluate", () => {
        const evaluator = new PlanEvaluator();

        const groupA = {} as Group;
        const groupB = {} as Group;
        const plan = {
            groups: [groupA, groupB]
        } as Plan;

        vi.spyOn(evaluator, "evaluateGroup").mockResolvedValue({} as Group);

        evaluator.evaluate(plan)
            .then(() => {
                expect(evaluator.evaluateGroup).toHaveBeenCalledWith(groupA);
                expect(evaluator.evaluateGroup).toHaveBeenCalledWith(groupB);
            })
    })

    it("evaluateGroup", () => {
        const evaluator = new PlanEvaluator();

        const tws: TimeWindow[] = [];
        const groupA = {
            id: 'test',
            time_windows: tws
        } as Group;

        const spyTimeWindow = vi.spyOn(evaluator, "calcGroupTimeWindows").mockReturnValue(tws);
        const spyCountry = vi.spyOn(evaluator, "calcCountryCount").mockReturnValue(3);
        const spyDuration = vi.spyOn(evaluator, "calcDuration").mockReturnValue(5);

        evaluator.evaluateGroup(groupA)
        expect(spyTimeWindow).toHaveBeenCalledWith(groupA);
        expect(spyCountry).toHaveBeenCalledWith(groupA);
        expect(spyDuration).toHaveBeenCalledWith(groupA);
        expect(groupA.time_windows).toBe(tws);
        expect(groupA.country_count).toBe(3);
        expect(groupA.duration).toBe(5);
    });

    it("calcGroupTimeWindows", () => {
        const evaluator = new PlanEvaluator();

        const defWindows: TimeWindow[] = [];
        const student_tws: TimeWindow[] = [];
        const final_tws: TimeWindow[] = [{} as TimeWindow];
        const placements: Placement[] = [
            { student: { timeWindows: student_tws } } as Placement
        ];
        const groupA = {
            id: 'test',
            placements: placements
        } as Group;

        const spyDefaultindow = vi.spyOn(groupService, "createDefaultTimewindows").mockReturnValue(defWindows);
        const spyIntersect = vi.spyOn(timeWindowService, "intersectionTimeWindowsMultiple").mockReturnValue(final_tws);

        const result = evaluator.calcGroupTimeWindows(groupA)
        expect(spyDefaultindow).toHaveBeenCalledWith(groupA);
        expect(spyIntersect).toHaveBeenCalledWith(defWindows, student_tws);
        expect(result).toBe(final_tws);
        expect(result[0].group_id).toBe('test');
    })

    it("calcCountryCount", () => {
        const placements: Placement[] = [
            { student: { country: 'US' } } as Placement,
            { student: { country: 'CA' } } as Placement,
            { student: { country: 'us' } } as Placement,
        ];
        const groupA = {
            id: 'test',
            placements: placements
        } as Group;


        const result = planEvaluator.calcCountryCount(groupA)
        expect(result).toBe(2);
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