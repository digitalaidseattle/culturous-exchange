/**
 *  dasVolunteerService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import {  PageInfo, QueryModel  } from "@digitalaidseattle/supabase";


const TEST_PLAN = {
    id: 'xxyyzz',
    sessionId: '',
    name: 'Plan 1',
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
class CESessionService {

    async find(_queryModel: QueryModel): Promise<PageInfo<Session>> {
        return {
            totalRowCount: 2,
            rows: [
                {
                    id: 'sess1',
                    name: 'Session 1',
                    startDate: new Date(),
                    endDate: new Date(),
                    plans: []
                },
                {
                    id: 'sess2',
                    name: 'Session 2',
                    startDate: new Date(),
                    endDate: new Date(),
                    plans: []
                }
            ]
        }
    }

    async getById(id: string): Promise<Session> {
        console.log("get ", id);
        return {
            id: 'sess1',
            name: 'Session 1',
            startDate: new Date(),
            endDate: new Date(),
            plans: [TEST_PLAN]
        }
    }

}

const sessionService = new CESessionService()
export { sessionService };

