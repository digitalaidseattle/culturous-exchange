/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { timeWindowService } from "./ceTimeWindowService";
import { Plan, TimeWindow } from "./types";


class PlanEvaluator {

    async evaluate(plan: Plan): Promise<Plan> {
        // Evaluautes Plan in memory
        // mutate group objects inside the plan object, and return plan
        // Update each group time_windows with by the intersections with students
        plan.groups.forEach(group => {
            group.placements!.forEach(placement => {
                group.time_windows = this.updateGroupTimeWindows(group.time_windows, placement.student!.timeWindows!)
                    .map(tw => {
                        tw.group_id = group.id;
                        return tw
                    })
            });
            group.country_count = new Set(group.placements!.map(p => p.student?.country.toLocaleUpperCase())).size;
        })
        return plan
    }


    updateGroupTimeWindows(
        currentGroupWindows: TimeWindow[] | undefined,
        studentWindows: TimeWindow[]): TimeWindow[] {
        if (!currentGroupWindows || currentGroupWindows.length === 0) {
            return [...studentWindows];
        }
        const intersection = timeWindowService.intersectionTimeWindowsMultiple(currentGroupWindows, studentWindows);
        return [...intersection];
    }

}

const planEvaluator = new PlanEvaluator()
export { planEvaluator };
