/**
 * ceAssignmentService.ts
 * Scaffold service for managing assignments (facilitator <-> group mapping)
 */
import { Identifier } from '@digitalaidseattle/core';
import { CEEnrollmentDao } from '../api/ceEnrollmentDao';
import { Cohort, Enrollment, Student } from '../api/types';

export class CEEnrollmentService {

  private static instance: CEEnrollmentService;

  dao: CEEnrollmentDao;

  static getInstance() {
    if (!CEEnrollmentService.instance) {
      CEEnrollmentService.instance = new CEEnrollmentService();
    }
    return CEEnrollmentService.instance;
  }

  private constructor() {
    this.dao = CEEnrollmentDao.getInstance();
  }

  async updateEnrollment(cohortId: Identifier, studentId: Identifier, updatedFields: Partial<Enrollment>): Promise<Enrollment> {
    return this.dao.updateEnrollment(cohortId, studentId, updatedFields);
  }

  async getStudents(cohort: Cohort): Promise<Student[]> {
    return this.dao.getStudents(cohort);
  }

  async deleteEnrollment(enrollment: Enrollment): Promise<void> {
    return this.dao.deleteEnrollment(enrollment);
  }

  async batchInsert(entities: Enrollment[]): Promise<Enrollment[]> {
    return this.dao.batchInsert(entities);
  }
}
