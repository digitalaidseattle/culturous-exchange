/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Cohort, Enrollment, Student } from "./types";


class CEEnrollmentService extends EntityService<Enrollment> {

    async getStudents(cohort: Cohort): Promise<Student[]> {
        return await supabaseClient
            .from(this.tableName)
            .select('student(*)')
            .eq('cohort_id', cohort.id)
            .then(resp => {
                const objects = resp.data as unknown as any[];
                return objects.map(ss => ss.student) as Student[];
            });
    }

}

const enrollmentService = new CEEnrollmentService('enrollment')
export { enrollmentService };

