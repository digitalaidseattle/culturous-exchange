/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Identifier } from '@digitalaidseattle/core';
import { Cohort, Enrollment } from '../../api/types';
import { CEEnrollmentService } from '../ceEnrollmentService';


class CECohortService {
    private static instance: CECohortService;

    static getInstance() {
        if (!CECohortService.instance) {
            CECohortService.instance = new CECohortService();
        }
        return CECohortService.instance;
    }

    async removeStudents(cohort: Cohort, studentIds: Identifier[]): Promise<boolean> {
        return Promise.all(
            studentIds.map(id => CEEnrollmentService.getInstance()
                .deleteEnrollment({ cohort_id: cohort.id, student_id: id } as Enrollment)))
            .then(() => true)
    }

}

export { CECohortService };
