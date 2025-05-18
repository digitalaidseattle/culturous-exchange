/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { Group, Identifier, Placement, Plan, TimeWindow } from "./types";
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

  async overlapDuration(timeWindows: TimeWindow[]): Promise<number> {
    // get the total overlapping hours
    return timeWindows.reduce((acc, tw) => acc +
      ((tw.end_date_time?.getTime() ?? 0) - (tw.start_date_time?.getTime() ?? 0)) / (1000 * 60 * 60), 0);
  }

  async getTotalAvailableHours(timeWindows: TimeWindow[]): Promise<number> {
    if (!timeWindows || timeWindows.length === 0) return 0;
    return timeWindows.reduce((sum, tw) => {
      if (!tw.start_date_time || !tw.end_date_time) return sum;
      return sum + (new Date(tw.end_date_time).getTime() - new Date(tw.start_date_time).getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  async getBestGroup(groups: Group[], placement: Placement): Promise<Group | null> {
    // get the best overlapping group from all groups and return bestGroup and bestIntersect
    let bestGroup = null;
    let bestOverlap = 0;
    let bestIntersect: TimeWindow[] = [];

    for (const group of groups) {
      // get the time windows for the group
      const intersect = groupService.intersectionTimeWindowsMultiple(groups, placement);
      const overlapDuration = await this.overlapDuration(intersect);

      if (overlapDuration > bestOverlap) {
        bestOverlap = overlapDuration;
        bestGroup = group;
        bestIntersect = intersect;
      }
    }

    return bestGroup, bestIntersect;
  }

  async seedPlan(plan: Plan, nGroup: number): Promise<Plan> {
    const cleaned = await this.emptyPlan(plan)

    console.log('Number nG:', nGroup);

    const nGroups = nGroup || Math.ceil(cleaned.placements.length / MAX_SIZE);

    console.log('Number of groups:', nGroups);

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

    // REMOVE : Distribute anchor students evenly across groups
    // const anchorPromises = anchorPlacements.map((placement, index) => {
    //   const group = updatedPlan.groups[index % nGroups];
    //   return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id });
    // });

    // TODO
    // 1. Place anchor student first for the first row.
    for (let i = 0; i < nGroup; i++) {
      const placement = anchorPlacements.pop();
      if (placement) {
        placementService.updatePlacement(
          placement.plan_id,
          placement.student_id,
          { group_id: updatedPlan.groups[i].id });
      }
    }

    let remainingPlacements = [
      ...anchorPlacements, // left-over anchors if more than nGroup
      ...plan.placements.filter(p => !p.anchor)
    ];
    console.log('Remaining placements:', remainingPlacements);

    // Sort students by their max available time windows
    const placementsWithHours = await Promise.all(
      remainingPlacements.map(async (placement) => ({
        placement,
        hours: await this.getTotalAvailableHours(placement.student?.timeWindows ?? [])
      }))
    );

    placementsWithHours.sort((a, b) => b.hours - a.hours);
    remainingPlacements = placementsWithHours.map(p => p.placement); //replace with sorted placements but exclude hours

    const remainingPromises = remainingPlacements.map((placement, index) => {
      const group = updatedPlan.groups[index % nGroups];
      return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id });
    });

    // 2. Get the best group for each student.
    // 3. Place the student in the best group.
    // 4. If the group is full, place the student in the next group.
    //getBestGroup(groups, placement) for non anchor

    // TODO : Test up to here first
    // Execute all placement updates
    return Promise.all([...remainingPromises])
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

      // TODO : Test the code up to here first
      // TODO : Understand this how to place students in groups and put the most overlap
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
