/**
 *  PlanActivation.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { CEPlanService } from "./cePlanService";
import { Plan } from "./types";

class PlanActivation {

    async changeActivation(plan: Plan, value: boolean): Promise<Plan> {
        const planService = CEPlanService.getInstance();

        const cohortPlans = await planService
            .findByCohortId(plan.cohort_id)
        const othersToDeactivate = cohortPlans
            .filter(p => p.id !== plan.id && p.active)
            .map(p => planService.update(p.id!, { active: false }));
        return Promise.all(othersToDeactivate)
            .then(() => planService.update(plan.id!, { active: value }))
            .catch(err => {
                console.error('Failed to deactivate other plans in cohort', err);
                throw err;
            })
    }

}
const planActivation = new PlanActivation();
export { planActivation, PlanActivation };

