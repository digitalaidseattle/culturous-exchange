/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { PageInfo, QueryModel } from "@digitalaidseattle/supabase";


const TEST_PLAN = {
    id: 'xxyyzz',
    cohortId: '',
    name: 'Plan 1',
    notes: 'Default',
    numberOfGroups: 3,
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
            priority: false,
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
            priority: false,
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
            priority: false,
            availabilities: []
        }
    ],
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
    rating: 10,
    comments: []
}

const TEST_PLAN2 ={...TEST_PLAN,
    name: 'Plan 2',
    notes: 'shifted student X from group 1 to group 2'
}
class CECohortService {

    async find(_queryModel: QueryModel): Promise<PageInfo<Cohort>> {
        return {
            totalRowCount: 2,
            rows: [
                {
                    id: 'cohort1',
                    name: 'Cohort 1',
                    plans: [TEST_PLAN, TEST_PLAN2]
                },
                {
                    id: 'cohort2',
                    name: 'Cohort 2',
                    plans: []
                }
            ]
        }
    }

    async getById(id: string): Promise<Cohort> {
        console.log("get ", id);
        return {
            id: 'cohort1',
            name: 'Cohort 1',
            plans: [TEST_PLAN, TEST_PLAN2]
        }
    }

}

const cohortService = new CECohortService()
export { cohortService };

