/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Group, Plan, TimeWindow } from "../../api/types";
import { CEGroupService } from "../group/ceGroupService";
import { CETimeWindowService } from "../time/ceTimeWindowService";


class PlanEvaluator {

    async evaluate(plan: Plan): Promise<Plan> {
        // Evaluautes Plan
        // mutate group objects inside the plan object, and return plan
        plan.groups.forEach(group => {
            this.evaluateGroup(group);
        })

        plan.avg_country_count = plan.groups
            .map(g => g.country_count)
            .reduce((x, y) => x + y, 0) / plan.groups.length;
        plan.avg_duration = plan.groups
            .map(g => g.duration)
            .filter(d => d !== undefined)
            .reduce((x, y) => x + y, 0) / plan.groups.length;
        plan.total_duration = this.calcPlanDuration(plan);
        return plan
    }

    evaluateGroup(group: Group): Group {
        group.time_windows = this.calcGroupTimeWindows(group);
        group.country_count = this.calcCountryCount(group);
        group.duration = this.calcDuration(group);
        return group;
    }

    calcGroupTimeWindows(group: Group): TimeWindow[] {
        const groupService = CEGroupService.getInstance();
        const timeWindowService = CETimeWindowService.getInstance();

        let timeWindows = groupService.createDefaultTimewindows(group);
        (group.assignments ?? []).forEach(assignment => {
            timeWindows = timeWindowService.intersectionTimeWindowsMultiple(timeWindows, assignment.facilitator!.timeWindows!);
        });
        (group.placements ?? []).forEach(placement => {
            timeWindows = timeWindowService.intersectionTimeWindowsMultiple(timeWindows, placement.student!.timeWindows!);
        });
        timeWindows.forEach(tw => tw.group_id = group.id!);
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
        const timeWindowService = CETimeWindowService.getInstance();
        return timeWindowService.totalDuration(group.time_windows!);
    }

    calcPlanDuration(plan: Plan): number {
        const timeWindowService = CETimeWindowService.getInstance();
        let timeWindows = timeWindowService.createDefaultTimewindows();
        (plan.groups ?? []).forEach(group => {
            timeWindows.concat(group.time_windows!);
        });
        // TODO remove overlap from timeWindows
        return timeWindowService.totalDuration(timeWindows);
    }
}

const planEvaluator = new PlanEvaluator()
export { planEvaluator, PlanEvaluator };
