/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { groupService } from "./ceGroupService";
import { timeWindowService } from "./ceTimeWindowService";
import { Plan, TimeWindow } from "./types";

class PlanEvaluator {

    async evaluate(plan: Plan): Promise<Plan> {
        // Evaluautes Plan in memory
        // mutate group objects inside the plan object, and return plan
        // Update each group time_windows with by the intersections with students
        plan.groups.forEach(group => {
            if (group.placements === undefined || group.placements.length === 0) {
                group.time_windows = groupService.createDefaultTimewindows(group);
                group.country_count = 0;
            } else {
                group.placements!.forEach(placement => {
                    group.time_windows = this.updateGroupTimeWindows(group.time_windows!, placement.student!.timeWindows!)
                        .map(tw => {
                            tw.group_id = group.id;
                            return tw
                        })
                });
                group.country_count = new Set(group.placements!.map(p => p.student?.country.toLocaleUpperCase())).size;
            }
        })
        return plan
    }

    updateGroupTimeWindows(currentGroupWindows: TimeWindow[], studentWindows: TimeWindow[]): TimeWindow[] {
        const updatedWindows = currentGroupWindows.length === 0
            ? studentWindows
            : timeWindowService.intersectionTimeWindowsMultiple(currentGroupWindows, studentWindows);
        return timeWindowService.mergeTimeWindows(updatedWindows)
    }

}

const planEvaluator = new PlanEvaluator()
export { planEvaluator };
