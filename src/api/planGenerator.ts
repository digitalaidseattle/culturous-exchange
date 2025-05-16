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
        return this.hydratePlan(plan.id);
      });
  }

  // Review: consider moving to planService as getById
  async hydratePlan(planId: Identifier): Promise<Plan> {
    // lookup student
    // lookup time windows for each student
    // fix time windows
    // place students in groups

    //get a recent version of the plan
    const latest = await planService.getById(planId);
    if (latest !== null) {
      latest.placements
        .filter(placement => placement.student_id !== null)
        .forEach(placement => {
          // place students in groups
          const group = latest.groups.find(group => group.id === placement.group_id);
          if (group) {
            if (group.placements === undefined) {
              group.placements = [];
            }
            placement.group = group;
            placement.group_id = group.id;
            group.placements.push(placement);
          }
        });

      for (const placement of latest.placements) {
        if (placement.student_id !== null) {
          const student: any = await studentService.getById(placement.student_id!, "*, timewindow(*)");
          if (student !== null) {
            student.timewindow.forEach((tw: TimeWindow) => {
              tw.start_date_time = parseISO(tw.start_date_time! as unknown as string);
              tw.end_date_time = parseISO(tw.end_date_time! as unknown as string);
            });
            student.timeWindows = student.timewindow;
            placement.student = student;

          }
        }
      }
      return latest;
    }
    throw new Error("Plan not found");
  }
}

const planGenerator = new PlanGenerator()
export { planGenerator };
