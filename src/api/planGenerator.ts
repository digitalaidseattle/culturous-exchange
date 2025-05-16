/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { Group, Identifier, Plan, TimeWindow } from "./types";
import { planService } from './cePlanService';
import { studentService } from './ceStudentService';
import { parseISO } from 'date-fns';

const MAX_SIZE = 10;

class PlanGenerator {

    async emptyPlan(plan: Plan): Promise<Plan> {
        for (const placement of plan.placements) {
            await placementService.updatePlacement(plan.id, placement.student_id, { group_id: null });
            placement.group = undefined;
            placement.group_id = undefined;
        }

        for (const group of plan.groups) {
            // TODO check if there is a batch delete
            await groupService.delete(group.id);
        }

        // requery the plan
        return await this.hydratePlan(plan.id);
    }

    async seedPlan(plan: Plan): Promise<Plan> {
        const cleaned = await this.emptyPlan(plan)

        const nGroups = cleaned.placements ? Math.ceil(cleaned.placements.length / MAX_SIZE) : 0;

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
