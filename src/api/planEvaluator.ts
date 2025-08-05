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
            const placements = group.placements ?? [];
            placements.forEach(placement => {
                if (placement.student !== undefined && placement.student.timeWindows) {
                    group.time_windows = this.updateGroupTimeWindows(group.time_windows, placement.student.timeWindows);
                } else {
                    console.error("no time windows", placement.student);
                }
            });
            group.country_count = new Set(placements.map(p => p.student?.country.toLocaleUpperCase())).size;
        })
        return { ...plan }; // <- Return a shallow copy of plan object to avoid mutation
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
