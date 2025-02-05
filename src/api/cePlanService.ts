/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

const TEST_PLAN = {
    id: 'plan1',
    name: 'Plan1',
    numberOfGroups: 3,
    rating: 0,
    notes: '',
    cohortId: "sess1",
    enrollments: [
        {
            id: '1',
            studentId: 's1',
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
        },
        {
            id: '2',
            studentId: 's2',
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
            studentId: 's3',
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
    ], groups: [
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
}

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
        alert(` a plan would be duplicated `)
        return [{...TEST_PLAN}]
    }

}

const planService = new CEPlanService()
export { planService };

