
/**
 *  createCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { CECohortService } from "../../ceCohortService";
import { enrollmentService } from '../../ceEnrollmentService';
import { CEStudentService } from "../../ceStudentService";
import { Cohort, Enrollment, Student } from '../../types';



export async function createCohort(): Promise<Cohort> {
    const cohortService = CECohortService.getInstance();
    const studentService = CEStudentService.getInstance();

    function createEnrollments(cohort: Cohort, students: Student[]): Enrollment[] {
        return students.map(student => {
            return {
                cohort_id: cohort.id,
                student_id: student.id,
                anchor: student.anchor ?? false,
            } as Enrollment
        })
    }

    return studentService.findUnenrolled()
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