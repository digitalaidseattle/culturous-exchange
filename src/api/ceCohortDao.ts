/**
 *  CECohortDao.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

import { SERVICE_ERRORS } from '../constants';
import { CEEnrollmentDao } from './ceEnrollmentDao';
import { Cohort } from "./types";

const DEFAULT_SELECT = '*, enrollment(*, student(*, timewindow(*))), plan(*)';

function JSON_2_ENTITY(json: any): Cohort {
    const enrollments = json.enrollment.map((enroll: any) => CEEnrollmentDao.getInstance().mapJson(enroll));
    const cohort = {
        ...json,
        enrollments: enrollments,
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

export class CECohortDao extends SupabaseDAO<Cohort> {
    private static instance: CECohortDao;

    static getInstance() {
        if (!CECohortDao.instance) {
            const supabaseClient = SupabaseConfiguration.getInstance().getSupabaseClient();
            CECohortDao.instance = new CECohortDao(
                supabaseClient,
                'cohort',
                {
                    select: DEFAULT_SELECT,
                    mapper: JSON_2_ENTITY
                }
            );
        }
        return CECohortDao.instance;
    }

    mapEntity(entity: Cohort): any {
        return ENTITY_2_JSON(entity);
    }

    async getLatest(): Promise<Cohort | null> {
        try {
            return this.client
                .from(this.tableName)
                .select(this.getSelect({}))
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then((resp: any) => this.mapJson(resp.data))
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

    async nameExists(name: string): Promise<boolean> {
        // case-insensitive exact match; escape ilike wildcards
        const pattern = name.trim().replace(/[\\%_]/g, c => `\\${c}`);
        return this.client
            .from(this.tableName)
            .select('id')
            .ilike('name', pattern)
            .limit(1)
            .then((resp: any) => {
                if (resp.error) {
                    throw resp.error;
                }
                return (resp.data ?? []).length > 0;
            })
    }

}
