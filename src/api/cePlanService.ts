/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { v4 as uuidv4 } from 'uuid';
import { EntityService } from "./entityService";
import { Cohort, Identifier, Plan } from "./types";

class CEPlanService extends EntityService<Plan> {
    async create(cohort: Cohort): Promise<Plan> {
        const proposed: Plan = {
            id: uuidv4(),
            name: 'New Plan',
            note: '',
            cohort_id: cohort.id
        } as Plan
        return this.insert(proposed)
            .then(plan => {
                // TODO add placement
                return plan;
            })
    }

    async duplicate(plan: Plan): Promise<Plan> {
        const proposed: Plan = {
            id: uuidv4(),
            name: plan.name + ' (copy)',
            note: '',
            cohort_id: plan.cohort_id
        } as Plan
        return this.insert(proposed)
            .then(plan => {
                // TODO copy placements
                // TODO copy groups? 
                return plan;
            })
    }

    async findByCohortId(cohort_id: Identifier): Promise<Plan[]> {
        return await supabaseClient
            .from(this.tableName)
            .select('*')
            .eq('cohort_id', cohort_id)
            .then(resp => resp.data as Plan[]);
    }

}

const planService = new CEPlanService('plan')
export { planService };

