/**
 *  PlanActivation.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { CEPlanDao } from "../../api/cePlanDao";
import { Plan } from "../../api/types";



class PlanActivation {

    async changeActivation(plan: Plan, value: boolean): Promise<Plan> {
        const planDao = CEPlanDao.getInstance();

        const cohortPlans = await planDao
            .findByCohortId(plan.cohort_id)
        const othersToDeactivate = cohortPlans
            .filter(p => p.id !== plan.id && p.active)
            .map(p => planDao.update(p.id!, { active: false }));
        return Promise.all(othersToDeactivate)
            .then(() => planDao.update(plan.id!, { active: value }))
            .catch(err => {
                console.error('Failed to deactivate other plans in cohort', err);
                throw err;
            })
    }

}
const planActivation = new PlanActivation();
export { planActivation, PlanActivation };

