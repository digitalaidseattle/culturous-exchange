/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { groupService } from "./ceGroupService";
import { timeWindowService } from "./ceTimeWindowService";
import { Group, Plan, TimeWindow } from "./types";

class PlanEvaluator {

    async evaluate(plan: Plan): Promise<Plan> {
        // Evaluautes Plan
        // mutate group objects inside the plan object, and return plan
        plan.groups.forEach(group => {
            this.evaluateGroup(group);
        })
        return plan
    }

    evaluateGroup(group: Group): Group {
        group.time_windows = this.calcGroupTimeWindows(group);
        group.country_count = this.calcCountryCount(group);
        group.duration = this.calcDuration(group);
        return group;
    }

    calcGroupTimeWindows(group: Group): TimeWindow[] {
        let timeWindows = groupService.createDefaultTimewindows(group);
        group.placements!.forEach(placement => {
            timeWindows = timeWindowService.intersectionTimeWindowsMultiple(timeWindows, placement.student!.timeWindows!);
        });
        timeWindows.forEach(tw => tw.group_id = group.id);
        return timeWindows;
    }

    calcCountryCount(group: Group): number {
        const countries = new Set<string>();
        group.placements?.forEach(placement => {
            if (placement.student?.country) {
                countries.add(placement.student.country.toLocaleUpperCase());
            }
        });
        return countries.size;
    }

    calcDuration(group: Group): number {
        return timeWindowService.overlapDuration(group.time_windows!);
    }
}

const planEvaluator = new PlanEvaluator()
export { planEvaluator, PlanEvaluator };
