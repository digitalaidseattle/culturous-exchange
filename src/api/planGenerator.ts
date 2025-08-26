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
      await groupService.delete(group.id);
    }
    // requery the plan
    const resp = await planService.getById(plan.id);
    if (resp) {
      return resp
    }
    throw new Error(`Could not get plan for ${plan.id}`)
  }

  async getTotalAvailableHours(timeWindows: TimeWindow[]): Promise<number> {
    if (!timeWindows || timeWindows.length === 0) return 0;
    return timeWindows.reduce((sum, tw) => {
      if (!tw.start_date_time || !tw.end_date_time) return sum;
      return sum + (new Date(tw.end_date_time).getTime() - new Date(tw.start_date_time).getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  async seedPlan(plan: Plan): Promise<Plan> {
    plan.groups = this.createGroups(plan);
    console.log("createGroups:", plan);

    const anchorStudents = plan.placements.filter(p => p.anchor);
    const unanchoredPlacements = plan.placements.filter(p => !p.anchor);

    // Fetch DB and update plan
    const planWithAnchors = await planGenerator.assignToGroup(plan, anchorStudents);
    console.log("planWithAnchors:", planWithAnchors);

    // const planEvaluatedWithAnchors = await planEvaluator.evaluate(planWithAnchors); // to update group.time_windows and country counts

    const planWithAllStudents = await planGenerator.assignedByTimewindow(planWithAnchors, unanchoredPlacements);
    console.log("planWithAllStudents:", planWithAllStudents);

    return await planEvaluator.evaluate(planWithAllStudents); // to update group.time_windows and country counts

  }

  calcNumberOfGroups(plan: Plan): number {
    return Math.ceil(plan.placements.length / (plan.group_size ?? MAX_SIZE));
  }

  createGroups(plan: Plan): Group[] {
    const numGroups = this.calcNumberOfGroups(plan);
    console.log(numGroups);
    return Array.from({ length: numGroups }, (_, groupNo) => {
      return {
        id: uuid(),
        plan_id: plan.id,
        name: `Group ${groupNo}`,
        country_count: 0,
        time_windows: []
      } as Group;
    });
  }

  async assignToGroup(plan: Plan, placements: Placement[]): Promise<Plan> {
    // Greedy algorithm to assign students to groups
    placements.map((placement, index) => {
      const group = plan.groups[index % plan.groups.length];
      group.time_windows = placement.student!.timeWindows!
        .map(tw => {
          return {
            ...tw,
            group_id: group.id
          }
        })
      placement.group_id = group.id;
    });
    return { ...plan }
  }

  async assignedByTimewindow(plan: Plan, remainingPlacements: Placement[]): Promise<Plan> {
    // Greedy algorithm to assign students to groups by time windows

    if (remainingPlacements.length === 0) {
      return plan; // No placements to assign
    }

    const groups = plan.groups;
    const maxGroupSize = Math.ceil(plan.placements.length / plan.groups.length);

    // Assign each placement to the best group based on time windows
    for (const placement of remainingPlacements) {
      let { bestGroup, bestIntersect } = await groupService.getBestOverlap(placement, groups, maxGroupSize);

      // Assign studnets that has no overlap to the first group
      if (!bestGroup) {
        console.log("No suitable group found for placement", placement.student_id);
        placement.group_id = null;
      } else {
        placement.group_id = bestGroup.id;
        bestGroup.time_windows = bestIntersect;

        // Update the group in the plan
        const groupIndex = groups.findIndex(g => g.id === bestGroup.id);
        if (groupIndex !== -1) {
          groups[groupIndex].placements = groups[groupIndex].placements || [];
          groups[groupIndex].placements.push(placement);
          groups[groupIndex].time_windows = bestIntersect;
        }
      }
    }
    return {
      ...plan
    }
  }

}

const planGenerator = new PlanGenerator()
export { planGenerator };
