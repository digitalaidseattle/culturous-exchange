/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { timeWindowService } from "./ceTimeWindowService";
import { Plan } from "./types";


class PlanEvaluator {
    async evaluate(plan: Plan): Promise<Plan> {
        plan.groups.forEach(group => {
            group.placements!.forEach(placement => {
                if (placement.student !== undefined && placement.student.timeWindows) {
                    const tws = placement.student.timeWindows;
                    if (group.time_windows === undefined || group.time_windows.length === 0) {
                        group.time_windows = [...tws];
                    } else {
                        const intersection = timeWindowService.intersectionTimeWindowsMultiple(group.time_windows, tws);
                        group.time_windows = [...intersection];
                    }
                } else {
                    console.error("no time windows", placement.student);
                }
            });
            group.country_count =  new Set(group.placements!.map(p => p.student?.country.toLocaleUpperCase())).size;

            // TODO: save the group
        })
        return {...plan};
    }
}

const planEvaluator = new PlanEvaluator()
export { planEvaluator };

