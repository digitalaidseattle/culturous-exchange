
/**
 *  createCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { Cohort, Enrollment, Student } from '../../api/types';
import { CECohortService } from '../../api/ceCohortService';
import { CEStudentDao } from '../../api/ceStudentDao';
import { CEEnrollmentService } from '../ceEnrollmentService';

export async function createCohort(): Promise<Cohort> {
    function createEnrollments(cohort: Cohort, students: Student[]): Enrollment[] {
        return students.map(student => {
            return {
                cohort_id: cohort.id,
                student_id: student.id,
                anchor: student.anchor ?? false,
            } as Enrollment
        })
    }

    return CEStudentDao.getInstance().findUnenrolled()
        .then(students => {
            return CECohortService.getInstance()
                .insert({ id: uuid(), name: `(New) Cohort`, } as Cohort)
                .then(cohort => {
                    const enrollments = createEnrollments(cohort, students)
                    return CEEnrollmentService.getInstance().batchInsert(enrollments)
                        .then(() => cohort)
                })
        })
}