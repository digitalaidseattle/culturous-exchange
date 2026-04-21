
/**
 *  addStudentsToCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";

import { Cohort, Enrollment } from "../../api/types";
import { CEEnrollmentService } from "../../services/ceEnrollmentService";

export async function removeStudentsFromCohort(cohort: Cohort, studentIds: Identifier[]): Promise<boolean> {
    return Promise.all(
        studentIds.map(id => CEEnrollmentService.getInstance()
            .deleteEnrollment({ cohort_id: cohort.id, student_id: id } as Enrollment)))
        .then(() => true)
}
