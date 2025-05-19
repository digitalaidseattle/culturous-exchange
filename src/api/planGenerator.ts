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

  async getTotalAvailableHours(timeWindows: TimeWindow[]): Promise<number> {
    if (!timeWindows || timeWindows.length === 0) return 0;
    return timeWindows.reduce((sum, tw) => {
      if (!tw.start_date_time || !tw.end_date_time) return sum;
      return sum + (new Date(tw.end_date_time).getTime() - new Date(tw.start_date_time).getTime()) / (1000 * 60 * 60);
    }, 0);
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

    // First, handle anchor students and assign first row students
    // TODO or use updated plan?
    const anchorPlacements = plan.placements.filter(p => p.anchor);
    const nonAnchorPlacements = plan.placements.filter(p => !p.anchor);
    const firstRowStudents: Placement[] = [];

    const numAnchorsToUse = Math.min(anchorPlacements.length, nGroups);
    firstRowStudents.push(...anchorPlacements.splice(0, numAnchorsToUse));
    const remainingSlots = nGroups - numAnchorsToUse;
    firstRowStudents.push(...nonAnchorPlacements.splice(0, remainingSlots));

    let remainingPlacements = [
      ...anchorPlacements, // left-over anchors if more than nGroup
      ...nonAnchorPlacements // non-anchor students
    ];

    console.log('--- First row students:', [...firstRowStudents]);

    // 1. Place anchor student first for the first row.
    // TODO : Chang this to use AWAIT
    const firstRowStudentsPromises = firstRowStudents.map((placement, index) => {
      const group = updatedPlan.groups[index % nGroups];
      return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id });
    });
    await Promise.all(firstRowStudentsPromises);


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

    // TODO: Fix there is a bug. dont get all students in groups
    // 2. Assign best group for each student.
    // ? : Do load balancing here either by Row-by-row group iteration or Student-priority greedy
    const maxGroupSize = Math.floor(updatedPlan.placements.length / updatedPlan.groups.length);
    updatedPlan.groups = await groupService.greedyGrouping(updatedPlan.groups, maxGroupSize, remainingPlacements);

    // 4. If the group is full, place the student in the next group.
    //getBestGroup(groups, placement) for non anchor

    // Update the plan to have the updated groups, attach placements to the group objects
    //fetch students+timewindows and attach each enriched students to its placements
    return this.hydratePlan(plan.id);
  }

  // Review: consider moving to planService as getById
  async hydratePlan(planId: Identifier): Promise<Plan> {
    // Get latest plan
    // Attach placements to the latest plan's group objects
    // Fetch full students' schedules
    // Attach the enriched student to their placement
    // Output :
    // - Each placement has a full student object attached.
    // - Each student has real timeWindows as Date objects
    // - Each group has real placements.

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
      return latest;
    }
    throw new Error("Plan not found");
  }
}

const planGenerator = new PlanGenerator()
export { planGenerator };
