/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEEnrollmentService } from '../../api/ceEnrollmentDao';
import { CEPlacementDao } from '../../api/cePlacementDao';
import { CEPlanDao } from "../../api/cePlanDao";
import { Cohort, Placement, Plan, Student } from "../../api/types";
import { SERVICE_ERRORS, UI_STRINGS } from '../../constants';
import { CEPlacementService } from '../cePlacementService';
import { CEGroupService } from "../group/ceGroupService";

class CEPlanService {
  private static instance: CEPlanService;

  static getInstance() {
    if (!CEPlanService.instance) {
      CEPlanService.instance = new CEPlanService();
    }
    return CEPlanService.instance;
  }

  empty(): Plan {
    return {
      id: uuid(),
      name: UI_STRINGS.NEW_PLAN,
      cohort_id: '',
      note: "",
      group_size: 10,
      placements: [],
      groups: [],
      active: false,
      avg_country_count: 0.0,
      avg_duration: 0.0,
      total_duration: 0.0,
      optimization_style: 'largest_first'
    } as Plan;
  }

  async create(cohort: Cohort): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();
    const placementDao = CEPlacementDao.getInstance();
    const enrollmentService = CEEnrollmentService.getInstance();

    const proposed: Plan = {
      ...this.empty(),
      cohort_id: cohort.id,
    } as Plan;

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
              } as Placement;
            });
            return placementDao
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
    const placementDao = CEPlacementDao.getInstance();

    try {
      const placements = this.createPlacements(plan, students);
      return placementDao.batchInsert(placements);
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
      throw err;
    }
  }

  async save(plan: Plan): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();
    const groupService = CEGroupService.getInstance();
    const placementService = CEPlacementService.getInstance();

    await planDao.upsert(plan);
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
