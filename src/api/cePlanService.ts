/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */


class CEPlanService {

    async findBySessionId(sessionId: string): Promise<Plan[]> {
        console.log("get ", sessionId);
        return [
            {
                id: 'plan1',
                name: 'Plan1',
                numberOfGroups: 3,
                rating: 0,
                comments: [],
                sessionId: "sess1",
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
        ]
    }

}

const planService = new CEPlanService()
export { planService };

