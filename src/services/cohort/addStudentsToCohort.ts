
/**
 *  addStudentsToCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { enrollmentService } from "../../api/ceEnrollmentService";
import { Cohort, Enrollment, Student } from "../../api/types";
import { SERVICE_ERRORS } from "../../constants";

function createEnrollments(cohort: Cohort, students: Student[]): Enrollment[] {
    return students.map(student => {
        return {
            cohort_id: cohort.id,
            student_id: student.id,
            anchor: student.anchor ?? false,
        } as Enrollment
    })
}

export async function addStudentsToCohort(cohort: Cohort, students: Student[]): Promise<any> {
    try {
        const enrollments = createEnrollments(cohort, students);
        return enrollmentService
            .batchInsert(enrollments)
    } catch (err) {
        console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
        throw err;
    }
}