/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { planService } from './cePlanService';
import { timeWindowService } from './ceTimeWindowService';
import { planEvaluator } from './planEvaluator';
import { Group, Placement, Plan, TimeWindow } from "./types";

const MAX_SIZE = 10;

class PlanGenerator {

  async emptyPlan(plan: Plan): Promise<Plan> {
    for (const placement of plan.placements) {
      await placementService.updatePlacement(plan.id, placement.student_id, { group_id: null });
      placement.group_id = undefined;
    }

    for (const group of plan.groups) {
      // TODO check if there is a batch delete
      await groupService.deleteGroup(group);
    }

    // requery the plan
    return await planService.getById(plan.id);
  }

  async getTotalAvailableHours(timeWindows: TimeWindow[]): Promise<number> {
    if (!timeWindows || timeWindows.length === 0) return 0;
    return timeWindows.reduce((sum, tw) => {
      if (!tw.start_date_time || !tw.end_date_time) return sum;
      return sum + (new Date(tw.end_date_time).getTime() - new Date(tw.start_date_time).getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  async seedPlan(plan: Plan): Promise<Plan> {
    const cleaned = await this.emptyPlan(plan)

    const nGroups = Math.ceil(cleaned.placements.length / (plan.group_size ?? MAX_SIZE));
    cleaned.groups = await this.createGroups(cleaned, nGroups);

    const anchorPlacements = cleaned.placements.filter(p => p.anchor)
    const nonAnchorPlacements = cleaned.placements.filter(p => !p.anchor);

    const planWithAnchors = await this.assignByGreedy(cleaned, anchorPlacements);
    const planEvaluatedWithAnchors = await planEvaluator.evaluate(planWithAnchors); // to update group.time_windows and country counts
    const planWithAllStudents = await this.assignedByTimewindow(planEvaluatedWithAnchors, nonAnchorPlacements);
    const finalPlan = await planEvaluator.evaluate(planWithAllStudents); // to update group.time_windows and country counts

    return finalPlan;
  }

  async createGroups(plan: Plan, nCount: number): Promise<Group[]> {
    const groups: Group[] = [];
    for (let groupNo = 1; groupNo <= nCount; groupNo++) {
      const group = {
        id: uuid(),
        plan_id: plan.id,
        name: `Group ${groupNo}`,
        country_count: 0,
        time_windows: [],
        placements: []
      } as Group;
      group.time_windows = groupService.createDefaultTimewindows(group);
      groups.push(group);
    }
    return groups;
  }

  async assignByGreedy(plan: Plan, placements: Placement[]): Promise<Plan> {
    // Greedy algorithm to assign first row students into groups 
    // Output contains one student in each group id
    // All anchors + other students that fit in the first row
    // Assign anchor students to the first row (in memory only)
    placements.forEach((placement, index) => {
      const group = plan.groups[index % plan.groups.length];
      group.placements?.push(placement);
      placement.group_id = group.id;
    });
    console.log(plan)
    return plan
  }

  // Algorithm to assign students to groups by time windows
  async assignedByTimewindow(plan: Plan, remainingPlacements: Placement[]): Promise<Plan> {
    // Assign each placement to the best group based on time windows
    for (const placement of remainingPlacements) {
      let { bestGroup, bestIntersect } = await this.getBestOverlap(placement, plan.groups, plan.group_size!);

      // Assign studnets that has no overlap to the first group
      if (!bestGroup) {
        console.log("No suitable group found for placement", placement.student_id);
        placement.group_id = null;
      } else {
        placement.group_id = bestGroup.id;
        bestGroup.placements!.push(placement);
        bestGroup.time_windows = bestIntersect;
      }
    }
    return plan;  // returning in-memory tempPlan
  }

  async getBestOverlap(
    placement: Placement,
    groups: Group[],
    maxSize: number
  ): Promise<{ bestOverlap: number | 0; bestGroup: Group | null; bestIntersect: TimeWindow[] }> {
    let bestGroup: Group | null = null;
    let bestIntersect: TimeWindow[] = [];
    let bestOverlap = 0;

    for (const group of groups) {
      if ((group.placements?.length ?? 0) >= maxSize) continue;

      const intersect = timeWindowService.intersectionTimeWindowsMultiple(
        group.time_windows ?? [],
        placement.student?.timeWindows ?? []
      );

      const overlap = await timeWindowService.overlapDuration(intersect);

      if (overlap > bestOverlap) {
        bestOverlap = overlap; // Hours of overlap
        bestGroup = group; // Group number
        bestIntersect = intersect; // Time windows intersection
      }
    }
    return { bestOverlap, bestGroup, bestIntersect };
  }

}

const planGenerator = new PlanGenerator()
export { planGenerator };
