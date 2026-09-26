/**
 *  uploadStudentsToCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Cohort, FailedProfile, Student } from "../../api/types";
import { SERVICE_ERRORS } from "../../constants";
import { StudentUploader } from "../student/StudentUploader";
import { addStudentsToCohort } from "./addStudentsToCohort";

export interface CohortUploadResult {
    successCount: number;
    failedProfiles: FailedProfile[];
    failedCount: number;
    attemptedCount: number;
}

/**
 * CEMT-138
 *
 * Uploads one or more student spreadsheets and enrolls every successfully
 * created student into the given cohort, in a single step.
 *
 * Students are still added to the global Student database (handled by
 * StudentUploader, same as the Students-page upload). They are then enrolled
 * into the cohort here via addStudentsToCohort, which also copies each
 * student's anchor flag onto the new enrollment.
 */
export async function uploadStudentsToCohort(cohort: Cohort, files: File[]): Promise<CohortUploadResult> {
    try {
        const uploadService = StudentUploader.getInstance();

        const responses = await Promise.all(
            files.map(file => uploadService.insert_from_excel(file))
        );

        const createdStudents: Student[] = [];
        let failedProfiles: FailedProfile[] = [];
        responses.forEach(resp => {
            createdStudents.push(...resp.successProfiles);
            failedProfiles = failedProfiles.concat(resp.failedProfiles);
        });

        // Enroll every created student into this cohort.
        if (createdStudents.length > 0) {
            await addStudentsToCohort(cohort, createdStudents);
        }

        return {
            successCount: createdStudents.length,
            failedProfiles: failedProfiles,
            failedCount: failedProfiles.length,
            attemptedCount: createdStudents.length + failedProfiles.length,
        };
    } catch (err) {
        console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
        throw err;
    }
}
