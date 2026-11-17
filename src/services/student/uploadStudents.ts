/**
 *  uploadStudents.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { FailedProfile, Student } from "../../api/types";
import { StudentUploader } from "./StudentUploader";

export interface StudentUploadResult {
    /** the students that were added to the student list */
    students: Student[];
    /** the rows that could not be added, with what was wrong */
    failedProfiles: FailedProfile[];
}

/**
 * Adds the students in the given spreadsheets to the student list, the same as Upload on the
 * Students page, and says which were added and which were not. Nobody is placed in a cohort.
 */
export async function uploadStudents(files: File[]): Promise<StudentUploadResult> {
    const uploader = StudentUploader.getInstance();
    const responses = await Promise.all(files.map(file => uploader.insert_from_excel(file)));
    return {
        students: responses.flatMap(resp => resp.successProfiles),
        failedProfiles: responses.flatMap(resp => resp.failedProfiles)
    };
}
