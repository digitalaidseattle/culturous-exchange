
/**
 *  createCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { CECohortDao } from '../../api/ceCohortDao';
import { CEStudentDao } from '../../api/ceStudentDao';
import { Cohort, Enrollment, Student } from '../../api/types';
import { CEEnrollmentService } from '../../api/ceEnrollmentDao';

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
            return CECohortDao.getInstance()
                .insert({ id: uuid(), name: `(New) Cohort`, } as Cohort)
                .then(cohort => {
                    const enrollments = createEnrollments(cohort, students)
                    return CEEnrollmentService.getInstance().batchInsert(enrollments)
                        .then(() => cohort)
                })
        })
}