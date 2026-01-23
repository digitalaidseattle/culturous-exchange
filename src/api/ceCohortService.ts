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
import { SERVICE_ERRORS } from '../constants';

const DEFAULT_SELECT = '*, enrollment(*), plan(*)';

class CECohortService extends EntityService<Cohort> {

    async removeStudents(cohort: Cohort, studentIds: Identifier[]): Promise<boolean> {
        return Promise.all(
            studentIds.map(id => enrollmentService
                .deleteEnrollment({ cohort_id: cohort.id, student_id: id } as Enrollment)))
            .then(() => true)
    }


    private createEnrollments(cohort: Cohort, students: Student[]): Enrollment[] {
        return students.map(student => {
            return {
                cohort_id: cohort.id,
                student_id: student.id,
                anchor: student.anchor ?? false,
            } as Enrollment
        })
    }

    async addStudents(cohort: Cohort, students: Student[]): Promise<any> {
        try {
            const enrollments = this.createEnrollments(cohort, students);
            return enrollmentService
                .batchInsert(enrollments)
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

    async create(): Promise<Cohort> {
        return studentService.findUnenrolled()
            .then(students => {
                return this
                    .insert({ id: uuidv4(), name: `(New) Cohort`, } as Cohort)
                    .then(cohort => {
                        const enrollments = this.createEnrollments(cohort, students)
                        return enrollmentService.batchInsert(enrollments)
                            .then(() => cohort)
                    })
            })
    }

    private mapToCohort(json: any): Cohort | null {
        if (json) {
            const cohort = {
                ...json,
                enrollments: json.enrollment,
                plans: json.plan
            }
            delete cohort.enrollment;
            delete cohort.plan;
            return cohort as Cohort;
        }
        else {
            return null
        }
    }

    async getAll(select?: string): Promise<Cohort[]> {
        return supabaseClient
            .from(this.tableName)
            .select(select ?? DEFAULT_SELECT)
            .then((resp: any) =>
                resp.data.map((json: any) => this.mapToCohort(json))
            )
    }

    async getById(entityId: string | number, select?: string): Promise<Cohort | null> {
        try {
            const json: any = await super.getById(entityId, select ?? DEFAULT_SELECT);
            return this.mapToCohort(json);
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

    async update(entityId: Identifier, updatedFields: Partial<Cohort>, select?: string): Promise<Cohort> {
        try {
            const json: any = await super.update(entityId, updatedFields, select ?? DEFAULT_SELECT)
            const cohort = this.mapToCohort(json)!;
            if (cohort) {
                return cohort;
            } else {
                throw new Error(SERVICE_ERRORS.UNEXPECTED_ERROR_UPDATE);
            }
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }

    }

    async getLatest(): Promise<Cohort | null> {
        try {
            return supabaseClient
                .from(this.tableName)
                .select(DEFAULT_SELECT)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then((resp: any) => this.mapToCohort(resp.data))
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

}

const cohortService = new CECohortService('cohort')
export { cohortService };
