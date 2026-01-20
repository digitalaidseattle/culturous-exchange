/**
 *  PlanActivation.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { planService } from "./cePlanService";
import { Plan } from "./types";

class PlanActivation {

    async changeActivation(plan: Plan, value: boolean): Promise<Plan> {
        const cohortPlans = await planService
            .findByCohortId(plan.cohort_id)
        const othersToDeactivate = cohortPlans
            .filter(p => p.id !== plan.id && p.active)
            .map(p => planService.update(p.id, { active: false }));
        console.log('othersToDeactivate', othersToDeactivate, othersToDeactivate.length)
        return Promise.all(othersToDeactivate)
            .then(() => {
                console.log(plan, value)

                return planService.update(plan.id, { active: value })
            })
            .catch(err => {
                console.error('Failed to deactivate other plans in cohort', err);
                throw err;
            })
    }

}
const planActivation = new PlanActivation();
export { planActivation, PlanActivation };

