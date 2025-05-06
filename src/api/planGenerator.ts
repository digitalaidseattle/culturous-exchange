/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { Group, Plan } from "./types";

class PlanGenerator {

  async seedPlan(plan: Plan, groupSize: number): Promise<Plan> {
    const nGroups = groupSize;

    // create groups arrays that has group objects.
    const groups = Array.from({ length: nGroups }, (_, groupNo) => {
      return {
        id: uuid(),
        plan_id: plan.id,
        name: `Group ${groupNo}`,
        country_count: 0
      } as Group;
    });

    console.log('Created groups:', groups);
    console.log('Plan:', plan);

    // Insert into groups table
    const updatedPlan = await groupService.batchInsert(groups)
      .then(() => {
        return {
          ...plan,
          groups: groups
        } as Plan;
      });

    // First, handle anchor students
    const anchorPlacements = plan.placements.filter(p => p.anchor);

    // Distribute anchor students evenly across groups
    const anchorPromises = anchorPlacements.map((placement, index) => {
      const group = updatedPlan.groups[index % nGroups];
      return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id });
    });

    // Then handle remaining students
    const nonAnchorPlacements = plan.placements.filter(p => !p.anchor);

    const nonAnchorPromises = nonAnchorPlacements.map((placement, index) => {
      const group = updatedPlan.groups[index % nGroups];
      return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id });
    });

    // Execute all placement updates
    return Promise.all([...anchorPromises, ...nonAnchorPromises])
      .then(() => {
        return updatedPlan;
      });
  }

}

const planGenerator = new PlanGenerator()
export { planGenerator };
