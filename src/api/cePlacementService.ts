/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Plan, Placement, Student, Identifier } from "./types";


class CEPlacementService extends EntityService<Placement> {

    async getStudents(plan: Plan): Promise<Student[]> {
        return await supabaseClient
            .from('placement')
            .select('student(*)')
            .eq('plan_id', plan.id)
            .then(resp => {
                return resp.data?.map(data => data.student) as unknown as Student[]
            });
    }

    async updatePlacement(planId: Identifier, studentId: Identifier, updatedFields: Partial<Placement>, select?: string): Promise<Placement> {
        try {
            const { data, error } = await supabaseClient.from(this.tableName)
                .update(updatedFields)
                .eq('plan_id', planId)
                .eq('student_id', studentId)
                .select(select ?? '*')
                .single();
            if (error) {
                console.error('Error updating entity:', error.message);
                throw new Error('Failed to update entity');
            }
            return data as unknown as Placement;
        } catch (err) {
            console.error('Unexpected error during update:', err);
            throw err;
        }
    }
}

const placementService = new CEPlacementService('placement')
export { placementService };

