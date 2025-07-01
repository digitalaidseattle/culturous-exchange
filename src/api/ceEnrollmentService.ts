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
            .from('enrollment')
            .select('student(*)')
            .eq('cohort_id', cohort.id)
            .then(resp => resp.data as unknown as Student[]);
    }
}

const enrollmentService = new CEEnrollmentService('enrollment')
export { enrollmentService };

