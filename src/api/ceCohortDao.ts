/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from '@digitalaidseattle/supabase';
import { SERVICE_ERRORS } from '../constants';
import { SupabaseDao } from './SupabaseDao';
import { Cohort } from "./types";

const DEFAULT_SELECT = '*, enrollment(*), plan(*)';

function JSON_2_ENTITY(json: any): Cohort {
    const cohort = {
        ...json,
        enrollments: json.enrollment,
        plans: json.plan
    }
    delete cohort.enrollment;
    delete cohort.plan;
    return cohort as Cohort;
}

function ENTITY_2_JSON(entity: Partial<Cohort>): any {
    const json = { ...entity }
    delete json.enrollments;
    delete json.plans;
    return json;
}

export class CECohortDao extends SupabaseDao<Cohort> {
    private static instance: CECohortDao;

    static getInstance() {
        if (!CECohortDao.instance) {
            CECohortDao.instance = new CECohortDao(supabaseClient, 'cohort', { select: DEFAULT_SELECT });
        }
        return CECohortDao.instance;
    }

    mapJson(json: any): Cohort {
        return JSON_2_ENTITY(json);
    }

    mapEntity(entity: Cohort): any {
        return ENTITY_2_JSON(entity);
    }

    async getLatest(): Promise<Cohort | null> {
        try {
            return supabaseClient
                .from(this.tableName)
                .select(this.getSelect())
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then((resp: any) => this.mapJson(resp.data))
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

}
