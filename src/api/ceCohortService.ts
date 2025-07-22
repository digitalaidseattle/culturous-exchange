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
import { Cohort, Enrollment, Identifier, Student } from "./types";
import { supabaseClient } from '@digitalaidseattle/supabase';


class CECohortService extends EntityService<Cohort> {

    async removeStudents(cohort: Cohort, studentIds: Identifier[]): Promise<boolean> {
        return Promise.all(
            studentIds.map(id => enrollmentService
                .deleteEnrollment({ cohort_id: cohort.id, student_id: id } as Enrollment)))
            .then(() => true)
    }


    private createEnrollments(cohort: Cohort, studentIds: Identifier[]): Enrollment[] {
        return studentIds.map(id => {
            return {
                cohort_id: cohort.id,
                student_id: id
            } as Enrollment
        })
    }

    async addStudents(cohort: Cohort, students: Student[]): Promise<any> {
        try {
            const enrollments = this.createEnrollments(cohort, students.map(student => student.id!.toString()));
            return enrollmentService
                .batchInsert(enrollments)
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

    async create(): Promise<Cohort> {
        return studentService.findUnenrolled()
            .then(students => {
                return this
                    .insert({ id: uuidv4(), name: `(New) Cohort`, } as Cohort)
                    .then(cohort => {
                        const studentIds = students.map(student => student.id?.toString());
                        const enrollments = this.createEnrollments(cohort, studentIds)
                        return enrollmentService.batchInsert(enrollments)
                            .then(() => cohort)
                    })
            })
    }

    async getAll(select?: string): Promise<Cohort[]> {
        return supabaseClient
            .from(this.tableName)
            .select(select ?? '*, enrollment(*), plan(*)')
            .then((resp: any) => {
                // TODO should we lookup students here?
               return resp.data.map((cohort: Cohort) => {
                    return {
                        ...cohort,
                        plans: (cohort as any).plan
                    }
                })
            })
    }

    async getById(entityId: string | number, select?: string): Promise<Cohort | null> {
        try {
            const json: any = await super.getById(entityId, select ?? '*, enrollment(*), plan(*)');
            if (json) {
                // TODO should we lookup students here?
                return {
                    ...json,
                    enrollments: json.enrollment,
                    plans: json.plan
                }
            } else {
                return null
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

    async update(entityId: Identifier, updatedFields: Partial<Cohort>, select?: string): Promise<Cohort> {
        try {
            const dbCohort = await super.update(entityId, updatedFields, select ?? '*, enrollment(*), plan(*)')
            if (dbCohort) {
                return {
                    ...dbCohort,
                    plans: (dbCohort as any).plan
                }
            } else {
                throw new Error('Unexpected error during update:');
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }

    }

    async getLatest(): Promise<Cohort | null> {
        try {
            return supabaseClient
                .from(this.tableName)
                .select('*, student(*), plan(*), enrollment(*)')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then(resp => resp.data)
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

}

const cohortService = new CECohortService('cohort')
export { cohortService };
