/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { v4 as uuidv4 } from 'uuid';
import { placementService } from "./cePlacementService";
import { EntityService } from "./entityService";
import { Cohort, Identifier, Placement, Plan } from "./types";
import { enrollmentService } from "./ceEnrollmentService";

class CEPlanService extends EntityService<Plan> {

    async create(cohort: Cohort): Promise<Plan> {
        const proposed: Plan = {
            id: uuidv4(),
            name: 'New Plan',
            note: '',
            cohort_id: cohort.id
        } as Plan
        // 
        return enrollmentService.getStudents(cohort)
            .then(students => {
                return this.insert(proposed)
                    .then(plan => {
                        const placements = students.map(student => {
                            return {
                                plan_id: plan.id,
                                student_id: student.id,
                                anchor: false,
                                priority: 0
                            } as Placement
                        })
                        return placementService
                            .batchInsert(placements)
                            .then(createdPlacements => {
                                plan.placements = createdPlacements;
                                return plan;
                            })
                    })
            });
    }

    async getById(entityId: string | number, select?: string): Promise<Plan | null> {
        try {
            const plan = await super.getById(entityId, select ?? '*, placement(*)');
            if (plan) {
                console.log(plan)
                return {
                    ...plan,
                    placements: (plan as any).placement
                }
            } else {
                return null
            }
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

    async duplicate(plan: Plan): Promise<Plan> {
        const proposed: Plan = {
            id: uuidv4(),
            name: plan.name + ' (copy)',
            note: '',
            cohort_id: plan.cohort_id
        } as Plan
        return this.insert(proposed)
            .then(plan => {
                // TODO copy placements
                // TODO copy groups? 
                return plan;
            })
    }

    async findByCohortId(cohort_id: Identifier): Promise<Plan[]> {
        return await supabaseClient
            .from(this.tableName)
            .select('*')
            .eq('cohort_id', cohort_id)
            .then(resp => resp.data as Plan[]);
    }

}

const planService = new CEPlanService()
export { planService };

