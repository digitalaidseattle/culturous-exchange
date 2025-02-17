/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuidv4 } from 'uuid';
import { enrollmentService } from './ceEnrollmentService';
import { studentService } from './ceStudentService';
import { EntityService } from "./entityService";
import { Cohort, Enrollment } from "./types";


class CECohortService extends EntityService<Cohort> {

    async create(): Promise<Cohort> {
        return studentService.findUnenrolled()
            .then(students => {
                return cohortService
                    .insert(
                        {
                            id: uuidv4(),
                            name: `(New) Cohort`,
                        } as Cohort
                    )
                    .then(cohort => {
                        const enrollments = students.map(student => {
                            return {
                                cohort_id: cohort.id,
                                student_id: student.id
                            } as Enrollment
                        });
                        enrollmentService.batchInsert(enrollments)
                        return cohort
                    })
            })
    }

    async getById(entityId: string | number, select?: string): Promise<Cohort | null> {
        try {
            const cohort = await super.getById(entityId, select ?? '*, enrollment(*), plan(*)');
            console.log(cohort);
            if (cohort) {
                return {
                    ...cohort,
                    plans: []   // TODO join into plans
                }
            } else {
                return null
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

    async update(entityId: string, updatedFields: Partial<Cohort>, select?: string): Promise<Cohort> {
        try {
            const cohort = await super.update(entityId, updatedFields, select)
            if (cohort) {
                return {
                    ...cohort,
                    plans: []   // TODO join into plans
                }
            } else {
                throw new Error('Unexpected error during update:');
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }

    }

}

const cohortService = new CECohortService('cohort')
export { cohortService };

