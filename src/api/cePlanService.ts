/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Placement, Plan } from "./types";

const TEST_PLAN = {
    id: '1',
    name: 'Plan1',
    rating: 0,
    notes: '',
    cohort_id: "sess1",
    placements: [
        {
            id: '1',
            cohort_id: '1',
            student_id: 's1',
            student: {
                id: '',
                name: 'Student 1',
                age: null,
                email: '',
                city: '',
                state: '',
                country: '',
                availabilities: []
            },
            anchor: true,
            availabilities: []
        } ,
        {
            id: '2',
            cohort_id: '1',
            student_id: 's2',
            student: {
                id: '',
                name: 'Student 2',
                age: null,
                email: '',
                city: '',
                state: '',
                country: '',
                availabilities: []
            },
            anchor: false,
            availabilities: []
        },
        {
            id: '3',
            cohort_id: '1',
            student_id: 's3',
            student: {
                id: '',
                name: 'Student 3',
                age: null,
                email: '',
                city: '',
                state: '',
                country: '',
                availabilities: []
            },
            anchor: false,
            availabilities: []
        }
    ]  as Placement[],
    groups: [
        {
            id: undefined,
            groupNo: 'Group 1',
            studentIds: ['s1']
        },
        {
            id: undefined,
            groupNo: 'Group 2',
            studentIds: ['s2', 's3']
        },
        {
            id: undefined,
            groupNo: 'Group 3',
            studentIds: []
        }
    ],
} as Plan;

class CEPlanService {
    async getById(id: string): Promise<Plan> {
        console.log("get plan", id);
        return TEST_PLAN;
    }

    async findByCohortId(cohortId: string): Promise<Plan[]> {
        console.log("get plans for cohort ", cohortId);
        return [TEST_PLAN]
    }

    async duplicate(plan: Plan): Promise<Plan[]> {
        alert(`  '${plan.name}' would be duplicated  ${plan.name}`)
        return [{ ...TEST_PLAN }]
    }

}

const planService = new CEPlanService()
export { planService };

