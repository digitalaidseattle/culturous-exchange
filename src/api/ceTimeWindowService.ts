/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Student, TimeWindow } from "./types";


class CETimeWindowService extends EntityService<TimeWindow> {

    async getForStudent(student: Student): Promise<TimeWindow[]> {
        return supabaseClient
            .from(this.tableName)
            .select('*')
            .eq('student_id', student.id)
            .then(resp => resp.data as unknown as TimeWindow[]);
    }

}

const timeWindowService = new CETimeWindowService('timewindow')
export { timeWindowService };

