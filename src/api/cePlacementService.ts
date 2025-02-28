/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Plan, Placement, Student } from "./types";


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
}

const placementService = new CEPlacementService('placement')
export { placementService };

