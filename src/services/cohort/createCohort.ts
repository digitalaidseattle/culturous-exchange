
/**
 *  createCohort.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { CECohortDao } from '../../api/ceCohortDao';
import { CEStudentDao } from '../../api/ceStudentDao';
import { Cohort, Student } from '../../api/types';
import { addStudentsToCohort } from './addStudentsToCohort';

export type NewCohortOptions = {
    /** nothing, or only spaces, means "(New) Cohort" */
    name?: string;
    /** the students to enrol; nothing means every student who is not in a cohort yet */
    students?: Student[];
};

export async function createCohort(options: NewCohortOptions = {}): Promise<Cohort> {
    const students = options.students ?? await CEStudentDao.getInstance().findUnenrolled();
    const cohort = await CECohortDao.getInstance()
        .insert({ id: uuid(), name: options.name?.trim() || `(New) Cohort` } as Cohort);
    if (students.length > 0) {
        await addStudentsToCohort(cohort, students);
    }
    return cohort;
}
