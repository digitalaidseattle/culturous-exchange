/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { CEPlacementDao } from "../api/cePlacementDao";
import { CEStudentDao } from "../api/ceStudentDao";
import { Cohort, Placement, Plan, Student } from "../api/types";
import { SERVICE_ERRORS } from '../constants';
import { CEEnrollmentService } from "../api/ceEnrollmentDao";

class CEPlacementService {

  private static instance: CEPlacementService;

  static getInstance() {
    if (!CEPlacementService.instance) {
      CEPlacementService.instance = new CEPlacementService();
    }
    return CEPlacementService.instance;
  }

  // getUnplacedStudents : for the Add student Modal
  async getUnplacedStudents(cohort: Cohort, plan: Plan): Promise<Student[]> {
    const enrolledStudents = await CEEnrollmentService.getInstance().getStudents(cohort);
    const placedStudents = await CEPlacementDao.getInstance().getStudents(plan);
    const placedStudentIds = new Set(placedStudents.map(student => student.id));
    const unplacedStudents = enrolledStudents.filter(student => !placedStudentIds.has(student.id));
    return unplacedStudents;
  }

  async save(placement: Placement): Promise<Placement> {
    const json = { ...placement }
    delete json.student;

    const updated = await this.updatePlacement(placement.plan_id,
      placement.student_id,
      json)
    updated.student = placement.student
    return updated;
  }

  async updatePlacement(planId: Identifier, studentId: Identifier, updatedFields: Partial<Placement>): Promise<Placement> {
    try {
      const updatedPlacement = await CEPlacementDao.getInstance()
        .updatePlacement(planId, studentId, updatedFields);

      // If the placement's anchor flag was changed, propagate the change to the student record
      // placement's anchor state -> update student's anchor state
      try {
        await CEStudentDao.getInstance()
          .update(studentId, { anchor: updatedPlacement.anchor });
      } catch (err) {
        // Log but do not fail placement update if student update fails
        console.error('Failed to propagate placement.anchor to student.anchor', err);
      }

      return updatedPlacement;
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_UPDATE, err);
      throw err;
    }
  }


  async getEnrichedPlacements(plan: Plan): Promise<Placement[]> {
    const students = await CEPlacementDao.getInstance().getStudents(plan);
    return plan.placements.map((placement) => ({
      ...placement,
      student: students.find(
        (student) => student.id === placement.student_id
      ),
    } as Placement));
  }

}

export { CEPlacementService };
