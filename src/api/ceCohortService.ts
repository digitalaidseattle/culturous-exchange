/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuidv4 } from 'uuid';
import { EntityService } from "./entityService";
import { Cohort } from "./types";


class CECohortService extends EntityService<Cohort> {

    async create(): Promise<Cohort> {
        // TODO add unenrolled students
        return await cohortService.insert(
            {
                id: uuidv4(),
                name: `(New) Cohort`,
            } as Cohort
        );
    }

    async getById(entityId: number | undefined, select?: string): Promise<Cohort | null> {
        try {
            const cohort = await super.getById(entityId, select)
            if (cohort) {
                return {
                    ...cohort,
                    plans: []   // TODO join into plans
                }
            } else {
                return null
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

    async update(entityId: string, updatedFields: Partial<Cohort>, select?: string): Promise<Cohort> {
        try {
            const cohort = await super.update(entityId, updatedFields, select)
            if (cohort) {
                return {
                    ...cohort,
                    plans: []   // TODO join into plans
                }
            } else {
                throw new Error('Unexpected error during update:');
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }

    }

}

const cohortService = new CECohortService('cohort')
export { cohortService };

