/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Identifier, Placement } from "./types";


class CEPlacementService extends EntityService<Placement> {
    
    async findByPlanId(planId: Identifier): Promise<Placement[]> {
        return await supabaseClient
            .from(this.tableName)
            .select('*, student(*)')
            .eq('plan_id', planId)
            .then(resp => resp.data as Placement[]);
    }    
}

const placementService = new CEPlacementService('placement')
export { placementService };

