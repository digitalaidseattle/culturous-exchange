/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { v4 as uuidv4 } from 'uuid';
import { CEPlanService } from "../../cePlanService";
import { Cohort, Placement, Plan } from '../../types';
import { UI_STRINGS } from '../../../constants';
import { enrollmentService } from '../../ceEnrollmentService';
import { placementService } from '../../cePlacementService';

export async function create(cohort: Cohort): Promise<Plan> {
  const planDao = CEPlanService.getInstance();
  const proposed: Plan = {
    id: uuidv4(),
    name: UI_STRINGS.NEW_PLAN,
    cohort_id: cohort.id,
    note: "",
    group_size: 10,
    placements: [],
    groups: [],
    active: false,
  } as Plan;
  await planDao.save(proposed)
  return planDao.insert(proposed)
    .then((plan) => {
      return enrollmentService.getStudents(cohort)
        .then((students) => {
          const placements = students.map((student) => {
            return {
              plan_id: plan.id,
              student_id: student.id,
              anchor: student.anchor || false,
              priority: 0,
              student: student
            } as unknown as Placement;
          });
          return placementService
            .batchInsert(placements)
            .then((createdPlacements) => {
              plan.placements = createdPlacements;
              return plan;
            });
        });
    });
}
