/**
 *  PlanActivation.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { describe, expect, it, vi } from "vitest";

import { CEPlanDao } from "../../api/cePlanDao";
import { Plan } from "../../api/types";
import { planActivation } from "./planActivation";

const mockPlacementDao = {
    updatePlacement: vi.fn(() => { }),
    getStudents: vi.fn(() => { }),
    findByCohortId: vi.fn(() => { }),
    update: vi.fn(() => { })
} as unknown as CEPlanDao;

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

        const getPlacementDaoInstanceSpy = vi.spyOn(CEPlanDao, "getInstance").mockReturnValue(mockPlacementDao);
        const findSpy = vi.spyOn(mockPlacementDao, "findByCohortId").mockResolvedValue([planA, planB]);
        const updateSpy = vi.spyOn(mockPlacementDao, "update").mockResolvedValue(planChanged);

        planActivation.changeActivation(plan, true)
            .then(updated => {
                expect(getPlacementDaoInstanceSpy).toHaveBeenCalledOnce();
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


