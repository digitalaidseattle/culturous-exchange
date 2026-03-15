/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { v4 as uuidv4 } from 'uuid';
import { SERVICE_ERRORS, UI_STRINGS } from '../constants';
import { CEGroupService } from "./ceGroupService";
import { CEPlanDao } from "./cePlanDao";
import { Cohort, Placement, Plan, Student } from "./types";
import { CEPlacementService } from '../services/cePlacementService';
import { CEEnrollmentService } from '../services/ceEnrollmentService';

class CEPlanService {
  private static instance: CEPlanService;

  static getInstance() {
    if (!CEPlanService.instance) {
      CEPlanService.instance = new CEPlanService();
    }
    return CEPlanService.instance;
  }

  async create(cohort: Cohort): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();
    const placementService = CEPlacementService.getInstance();
    const enrollmentService = CEEnrollmentService.getInstance();

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
    await this.save(proposed)
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

  createPlacements(plan: Plan, students: Student[]): Placement[] {
    const placements = students.map((student) => {
      return {
        plan_id: plan.id,
        student_id: student.id,
        anchor: student.anchor || false,
        priority: 0,
      } as Placement;
    });
    return placements;
  }

  async addStudents(plan: Plan, students: Student[]): Promise<any> {
    const placementService = CEPlacementService.getInstance();

    try {
      const placements = this.createPlacements(plan, students);
      return placementService.batchInsert(placements);
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
      throw err;
    }
  }

  async save(plan: Plan): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();
    const groupService = CEGroupService.getInstance();
    const placementService = CEPlacementService.getInstance();

    await planDao.insert(plan)
    for (const group of plan.groups) {
      await groupService.save(group)
    }
    for (const placement of plan.placements) {
      await placementService.save(placement)
    }
    return plan
  }

}

export { CEPlanService };
