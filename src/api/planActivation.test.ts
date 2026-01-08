/**
 *  PlanActivation.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { describe, expect, it, vi } from "vitest";
import { planService } from "./cePlanService";
import { planActivation } from "./planActivation";
import { Plan } from "./types";

describe("PlanActivation", () => {

    it("changeActivation", () => {
        const plan = {
            id: 'test-id',
            cohort_id: 'cohort-id',
            active: true,
        } as Plan;
        const planChanged = {
            id: 'test-id',
            active: false,
        } as Plan;
        const planA = {
            id: 'plan-a-id',
            active: true,
        } as Plan;
        const planB = {
            id: 'plan-b-id',
            active: false,
        } as Plan;
        const findSpy = vi.spyOn(planService, "findByCohortId").mockResolvedValue([planA, planB]);
        const updateSpy = vi.spyOn(planService, "update").mockResolvedValue(planChanged);

        planActivation.changeActivation(plan, true)
            .then(updated => {
                expect(findSpy).toBeCalledWith("cohort-id");
                expect(updateSpy).toBeCalledWith('plan-a-id', { active: false });
                expect(updateSpy).toBeCalledWith('test-id', { active: true });
                expect(updated).toBe(planChanged);
            })

    })


    // async changeActivation(plan: Plan, value: boolean): Promise < Plan > {
    //     const cohortPlans = await planService
    //         .findByCohortId(plan.cohort_id)
    //     const othersToDeactivate = cohortPlans
    //         .filter(p => p.id !== plan.id && p.active)
    //         .map(p => planService.update(p.id, { active: false }));
    //     console.log('othersToDeactivate', othersToDeactivate, othersToDeactivate.length)
    //     return Promise.all(othersToDeactivate)
    //         .then(() => {
    //             console.log(plan, value)

    //             return planService.update(plan.id, { active: value })
    //         })
    //         .catch(err => {
    //             console.error('Failed to deactivate other plans in cohort', err);
    //             throw err;
    //         })
    // }

});


