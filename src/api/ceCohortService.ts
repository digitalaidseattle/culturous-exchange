/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { SERVICE_ERRORS } from '../constants';
import { enrollmentService } from './ceEnrollmentService';
import { Cohort, Enrollment } from "./types";
import { Identifier } from '@digitalaidseattle/core';

const DEFAULT_SELECT = '*, enrollment(*), plan(*)';

function MAPPER(json: any): Cohort {
    const cohort = {
        ...json,
        enrollments: json.enrollment,
        plans: json.plan
    }
    delete cohort.enrollment;
    delete cohort.plan;
    return cohort as Cohort;
}

class CECohortService extends SupabaseEntityService<Cohort> {
    private static instance: CECohortService;

    static getInstance() {
        if (!CECohortService.instance) {
            CECohortService.instance = new CECohortService('cohort', DEFAULT_SELECT, MAPPER);
        }
        return CECohortService.instance;
    }

    async removeStudents(cohort: Cohort, studentIds: Identifier[]): Promise<boolean> {
        return Promise.all(
            studentIds.map(id => enrollmentService
                .deleteEnrollment({ cohort_id: cohort.id, student_id: id } as Enrollment)))
            .then(() => true)
    }

    async getLatest(): Promise<Cohort | null> {
        try {
            return supabaseClient
                .from(this.tableName)
                .select(DEFAULT_SELECT)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then((resp: any) => MAPPER(resp.data))
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

}

export { CECohortService };
