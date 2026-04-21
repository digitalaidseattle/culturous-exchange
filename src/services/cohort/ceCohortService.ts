/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Identifier } from '@digitalaidseattle/core';
import { Cohort, Enrollment, Plan } from '../../api/types';
import { CEEnrollmentService } from "../../services/ceEnrollmentService";
import { CEPlanService } from '../plan/cePlanService';
import { CEPlanDao } from '../../api/cePlanDao';
import { PlanGenerator } from '../plan/planGenerator';


class CECohortService {
    private static instance: CECohortService;

    static getInstance() {
        if (!CECohortService.instance) {
            CECohortService.instance = new CECohortService();
        }
        return CECohortService.instance;
    }

    async removeStudents(cohort: Cohort, studentIds: Identifier[]): Promise<boolean> {
        return Promise.all(
            studentIds.map(id => CEEnrollmentService.getInstance()
                .deleteEnrollment({ cohort_id: cohort.id, student_id: id } as Enrollment)))
            .then(() => true)
    }

    async createPlan(cohort: Cohort): Promise<Plan> {
        const planService = CEPlanService.getInstance();
        const planDao = CEPlanDao.getInstance();
        const planGenerator = PlanGenerator.getInstance();

        const created = await planService.create(cohort);
        const hydrated = await planDao.getById(created.id!);
        const seeded = await planGenerator.run(hydrated!);
        console.log('seeded', seeded)
        return planService.save(seeded);
    }

}

export { CECohortService };
