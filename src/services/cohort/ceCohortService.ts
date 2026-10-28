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
import { nextDefaultPlanName } from '../plan/planNaming';


export type NewPlanOptions = {
    name?: string;
    /** the least shared time, in hours, a group may be left with; 0 or nothing means any shared time */
    minOverlapHours?: number;
    /** groups smaller than this are broken up; 1 or nothing means no minimum */
    minGroupSize?: number;
    /** the most students in a group, saved on the plan as its group size; nothing means the usual 10 */
    maxGroupSize?: number;
    /** places students in the shuffled order this seed gives (see Optimize in the New Plan window); nothing means the fixed order */
    shuffleSeed?: number;
};

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

    /**
     * Creates a plan for the cohort and groups its students. With no options this is the plan the
     * New Plan button always made; the New Plan window passes a name and the minimums.
     */
    async createPlan(cohort: Cohort, options: NewPlanOptions = {}): Promise<Plan> {
        const planService = CEPlanService.getInstance();
        const planDao = CEPlanDao.getInstance();
        const planGenerator = PlanGenerator.getInstance();

        const overrides: Partial<Plan> = {};
        // a plan with no name given is "Plan N", numbered after the cohort's other plans
        overrides.name = options.name || nextDefaultPlanName(cohort.plans);
        if (options.maxGroupSize) {
            overrides.group_size = options.maxGroupSize;
        }
        const created = await planService.create(cohort, overrides);
        const hydrated = await planDao.getById(created.id!);
        const seeded = await planGenerator.run(hydrated!, {
            minOverlapHours: options.minOverlapHours,
            minGroupSize: options.minGroupSize,
            shuffleSeed: options.shuffleSeed
        });
        console.log('seeded', seeded)
        return planService.save(seeded);
    }

}

export { CECohortService };
