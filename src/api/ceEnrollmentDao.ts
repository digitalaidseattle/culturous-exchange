/**
 *  CEEnrollmentDao.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { SERVICE_ERRORS } from '../constants';
import { CEStudentDao } from "./ceStudentDao";
import { getSupabaseClient } from "./Configuration";
import { SupabaseDao } from "./SupabaseDao";
import { Cohort, Enrollment, Student } from "./types";

const DEFAULT_SELECT = '*, student(*, timewindow(*))';

export class CEEnrollmentDao extends SupabaseDao<Enrollment> {
    private static instance: CEEnrollmentDao;

    static getInstance() {
        if (!CEEnrollmentDao.instance) {
            CEEnrollmentDao.instance = new CEEnrollmentDao(getSupabaseClient(), 'enrollment', { select: DEFAULT_SELECT });
        }
        return CEEnrollmentDao.instance;
    }

    mapJson(json: any): Enrollment {
        const student = CEStudentDao.getInstance().mapJson(json.student);
        const mapped = {
            ...json,
            id: `${json.cohort_id}:${json.student_id}`,
            student: student,
        }
        return mapped;
    }

    mapEntity(entity: Partial<Enrollment>): any {
        const json = {
            ...entity
        }
        delete json.id;  // TODO remove when id added to table
        delete json.student;
        return json;
    }

    async updateEnrollment(cohortId: Identifier, studentId: Identifier, updatedFields: Partial<Enrollment>): Promise<Enrollment> {
        try {
            const { data, error } = await this.client.from(this.tableName)
                .update(updatedFields)
                .eq('cohort_id', cohortId)
                .eq('student_id', studentId)
                .select(this.getSelect())
                .single();
            if (error) {
                console.error(SERVICE_ERRORS.ERROR_UPDATING_ENTITY, error.message);
                throw new Error(SERVICE_ERRORS.FAILED_UPDATE_ENTITY);
            }
            return this.mapJson(data);
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_UPDATE, err);
            throw err;
        }
    }

    // TODO returning timewindow as object instead of array
    async getStudents(cohort: Cohort): Promise<Student[]> {
        return await this.client
            .from(this.tableName)
            .select(this.getSelect())
            .eq('cohort_id', cohort.id)
            .then((resp: any) => {
                return resp.data!
                    .map((json: any) => {
                        const enrollment = this.mapJson(json);
                        return enrollment.student;
                    })
            });
    }

    async deleteEnrollment(enrollment: Enrollment): Promise<void> {
        try {
            const { error } = await this.client
                .from(this.tableName)
                .delete()
                .eq('cohort_id', enrollment.cohort_id)
                .eq('student_id', enrollment.student_id);
            if (error) {
                console.error(SERVICE_ERRORS.ERROR_DELETING_ENTITY, error.message);
                throw new Error(SERVICE_ERRORS.FAILED_DELETE_ENTITY);
            }
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_DELETION, err);
            throw err;
        }
    }

    async batchInsert(entities: Enrollment[]): Promise<Enrollment[]> {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .insert(entities.map(e => this.mapEntity(e)))
                .select(this.getSelect());
            if (error) {
                console.error(SERVICE_ERRORS.ERROR_INSERTING_ENTITY, error);
                throw new Error(SERVICE_ERRORS.FAILED_INSERT_ENTITY_PREFIX + error.message);
            }
            return data.map(json => this.mapJson(json));
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_INSERTION, err);
            throw err;
        }
    }
}

// TODO add concrete CEEnrollmentService class
export {CEEnrollmentDao as CEEnrollmentService}