
/**
 *  createCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { CECohortService } from "../../ceCohortService";
import { enrollmentService } from '../../ceEnrollmentService';
import { CEStudentDao } from "../../ceStudentDao";
import { Cohort, Enrollment, Student } from '../../types';



export async function createCohort(): Promise<Cohort> {
    const cohortService = CECohortService.getInstance();
    const studentDao = CEStudentDao.getInstance();

    function createEnrollments(cohort: Cohort, students: Student[]): Enrollment[] {
        return students.map(student => {
            return {
                cohort_id: cohort.id,
                student_id: student.id,
                anchor: student.anchor ?? false,
            } as Enrollment
        })
    }

    return studentDao.findUnenrolled()
        .then(students => {
            return cohortService
                .insert({ id: uuid(), name: `(New) Cohort`, } as Cohort)
                .then(cohort => {
                    const enrollments = createEnrollments(cohort, students)
                    return enrollmentService.batchInsert(enrollments)
                        .then(() => cohort)
                })
        })
}