/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { planEvaluator } from './planEvaluator';
import { Group, Identifier, Placement, Plan, TimeWindow } from "./types";
import { planService } from './cePlanService';
import { studentService } from './ceStudentService';
import { parseISO } from 'date-fns';
import { timeWindowService } from './ceTimeWindowService';

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
    return await this.hydratePlan(plan.id);
  }

  async getTotalAvailableHours(timeWindows: TimeWindow[]): Promise<number> {
    if (!timeWindows || timeWindows.length === 0) return 0;
    return timeWindows.reduce((sum, tw) => {
      if (!tw.start_date_time || !tw.end_date_time) return sum;
      return sum + (new Date(tw.end_date_time).getTime() - new Date(tw.start_date_time).getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  async seedPlan(plan: Plan): Promise<Plan> {
    // Clean this up. Do not save to DB yet, save updated plan to DB only
    // at the function that called seedPlan

    const cleaned = await this.emptyPlan(plan)

    const nGroups = Math.ceil(cleaned.placements.length / (plan.group_size ?? MAX_SIZE));
    const groups = Array.from({ length: nGroups }, (_, groupNo) => {
      return {
        id: uuid(),
        plan_id: cleaned.id,
        name: `Group ${groupNo}`,
        country_count: 0
      } as Group;
    });

    // Current state of cleaned.placement has group_id: null
    const updatedPlan: Plan = { ...cleaned, groups, };

    // Assign first row students to groups
    const sortedPlacements = [...cleaned.placements].sort((a, b) => {
      if (a.anchor && !b.anchor) return -1; // a is anchor, b is not
      if (!a.anchor && b.anchor) return 1; // b is anchor, 
      return 0; // both are anchors or neither is an anchor
    })
    const firstRowStudents = sortedPlacements.slice(0, nGroups);
    const remainingPlacements = sortedPlacements.slice(nGroups);

    // *** Pan TODO: Go into these functions and clean up the part that save plan to db
    // Fetch DB and update plan
    const planWithAnchors = await planGenerator.assignByGreedy(updatedPlan, nGroups, firstRowStudents);
    const planEvaluatedWithAnchors = await planEvaluator.evaluate(planWithAnchors); // to update group.time_windows and country counts
    const planWithAllStudents = await planGenerator.assignedByTimewindow(planEvaluatedWithAnchors, nGroups, remainingPlacements);
    const finalPlan = await planEvaluator.evaluate(planWithAllStudents); // to update group.time_windows and country counts

    // DELETE : 

    // Remove and change to save Group, Timewindow tables at the function call seedPlan

    // // Save groups (delete)
    // finalPlan.groups.forEach(async group => {
    //   await groupService.update(group.id, {
    //     country_count: group.country_count
    //   });
    // });

    // // Save time windows (delete)
    // finalPlan.groups.forEach(group => {
    //   const timewindowsWithGroups = group.time_windows?.map(tw => {
    //     return {
    //       ...tw,
    //       id: uuid(),
    //       group_id: group.id
    //     }
    //   });
    //   timeWindowService.batchInsert(timewindowsWithGroups || [])
    // });

    // console.log("Final plan after seeding:", finalPlan);

    return finalPlan;
  }

  // Review: consider moving to planService as getById
  async hydratePlan(planId: Identifier): Promise<Plan> {
    // Get latest plan from DB
    // Attach placements to the latest plan's group objects
    // Fetch full students' schedules
    // Attach the enriched student to their placement
    // Output :
    // - Each placement has a full student object attached.
    // - Each student has real timeWindows as Date objects
    // - Each group has real placements.
    // - Each group has real timeWindows

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
            placement.group_id = group.id;
            group.placements.push(placement);
          }
        });

      // Students have real timeWindows as Date objects
      for (const placement of latest.placements) {
        if (placement.student_id !== null) {
          const student: any = await studentService.getById(placement.student_id!, "*, timewindow(*)");
          if (student !== null) {
            student.timewindow.forEach((tw: TimeWindow) => {
              tw.start_date_time = parseISO(tw.start_date_time! as unknown as string);
              tw.end_date_time = parseISO(tw.end_date_time! as unknown as string);
            });
            student.timeWindows = student.timewindow;
            placement.student = student; // update placement with student with multiple timewindows
          }
        }
      }

      // Groups have real timeWindows
      for (const group of latest.groups) {
        const timewindows: TimeWindow[] = await timeWindowService.findByGroupId(group.id);
        timewindows.forEach((tw: TimeWindow) => {
          tw.start_date_time = parseISO(tw.start_date_time! as unknown as string);
          tw.end_date_time = parseISO(tw.end_date_time! as unknown as string);
        });
        group.time_windows = timewindows
      }
      return latest;
    }
    throw new Error("Plan not found");
  }

  async assignByGreedy(plan: Plan, nGroups: number, students: Placement[]): Promise<Plan> {
    // Greedy algorithm to assign first row students into groups 
    // Output contains one student in each group id
    // All anchors + other students that fit in the first row

    // Assign anchor students to the first row (in memory only)
    const updatedPlacements = students.map((placement, index) => {
      const group = plan.groups[index % nGroups];
      return {
        ...placement,
        group_id: group.id
      };
    });

    // Replace placements in plan
    const updatedPlan: Plan = {
      ...plan,
      placements: updatedPlacements
    };

    return updatedPlan
  }


  async assignedByTimewindow(plan: Plan, nGroups: number, remainingPlacements: Placement[]): Promise<Plan> {
    // Greedy algorithm to assign students to groups by time windows

    if (remainingPlacements.length === 0) {
      return plan; // No placements to assign
    }

    const groups = plan.groups;
    const maxGroupSize = Math.ceil(plan.placements.length / nGroups);

    // Assign each placement to the best group based on time windows
    for (const placement of remainingPlacements) {
      let { bestGroup, bestIntersect } = await groupService.getBestOverlap(placement, groups, maxGroupSize);

      // Assign studnets that has no overlap to the first group
      if (!bestGroup) {
        console.log("No suitable group found for placement", placement.student_id);
        placement.group_id = null;
      } else {
        placement.group_id = bestGroup.id;

        // TODO : consider do this at the caller function (seedPlan) ? 
        // This function mutate plan.groups in place 
        this.assignPlacementToGroup(groups, placement, bestGroup.id, bestIntersect);
      }
    }

    return plan;
  }

  private assignPlacementToGroup(
    groups: Group[],
    placement: Placement,
    groupId: Identifier,
    newTimeWindows: TimeWindow[]
  ): void {
    // This function mutate plan.groups in place 
    // fill plan.group[id].placements and plan.group[id].time_windows

    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex !== -1) {
      const group = groups[groupIndex];
      group.placements = group.placements || [];
      group.placements.push(placement);
      group.time_windows = newTimeWindows;    // TODO : This part might duplicate with evaluate()
    }
  }
}


const planGenerator = new PlanGenerator()
export { planGenerator };
