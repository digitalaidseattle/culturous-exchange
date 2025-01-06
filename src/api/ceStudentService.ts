/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { PageInfo, QueryModel } from "@digitalaidseattle/supabase";


class CEStudentService {

    async find(_queryModel: QueryModel): Promise<PageInfo<Student>> {
        return {
            totalRowCount: 2,
            rows: [
                {
                    id: 'sess1',
                    name: 'Student 1',
                    age: 17,
                    email: 's1@gmail.com',
                    city: "Seattle",
                    state: "Washington",
                    country: "US",
                    availabilities: []
                },
                {
                    id: 'sess2',
                    name: 'Student 1',
                    age: 15,
                    email: 's2@gmail.com',
                    city: "Essen",
                    state: "",
                    country: "Germany",
                    availabilities: []
                }
            ]
        }
    }

}

const studentService = new CEStudentService()
export { studentService };

