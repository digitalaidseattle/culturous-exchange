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

  async seedPlan(plan: Plan): Promise<Plan> {
    const cleaned = await this.emptyPlan(plan)

    const nGroups = Math.ceil(cleaned.placements.length / (plan.group_size ?? MAX_SIZE));
    cleaned.groups = await this.createGroups(cleaned, nGroups);

    const anchorPlacements = cleaned.placements.filter(p => p.anchor)
    const nonAnchorPlacements = cleaned.placements.filter(p => !p.anchor);

    const planWithAnchors = await this.assignStudents(cleaned, anchorPlacements);
    const planWithAllStudents = await this.assignStudents(planWithAnchors, nonAnchorPlacements);
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

  // Algorithm to assign students to groups by time windows
  async assignStudents(plan: Plan, remainingPlacements: Placement[]): Promise<Plan> {
    // Assign each placement to the best group based on time windows
    for (const placement of remainingPlacements) {
      let response = await this.getBestOverlap(plan, placement);
      // Assign studnets that has no overlap to the first group
      if (response === null) {
        console.log("No suitable group found for placement", placement.student_id);
        placement.group_id = null;
      } else {
        placement.group_id = response.group.id;
        response.group.placements!.push(placement);
        response.group.time_windows = response.intersect;
      }
    }
    return plan;
  }

  async getBestOverlap(
    plan: Plan,
    placement: Placement
  ): Promise<{ duration: number | 0; group: Group; intersect: TimeWindow[] } | null> {
    const tuples = plan.groups
      .filter(g => (g.placements?.length ?? 0) < (plan.group_size ?? MAX_SIZE)) // Only consider groups that are not full
      .map(group => {
        const intersect = timeWindowService.intersectionTimeWindowsMultiple(
          group.time_windows ?? [],
          placement.student?.timeWindows ?? []
        );
        const overlap = timeWindowService.overlapDuration(intersect);
        return { duration: overlap, group: group, intersect: intersect };
      })
      .filter(tuple => tuple.duration > 0)  // Only consider groups with some overlap
      .sort((a, b) => {
         // Biggest overlap - descending order by overlap duration 
        const spread = b.duration - a.duration;
        if (spread !== 0) {
          return spread;
        }
         // Fill empty groups first - Ascending order by number of placements 
        return (a.group.placements?.length ?? 0) - (b.group.placements?.length ?? 0);
      })
    return tuples.length > 0 ? tuples[0] : null; // Return the best group or null no match
  }

}


const planGenerator = new PlanGenerator()
export { PlanGenerator, planGenerator };
