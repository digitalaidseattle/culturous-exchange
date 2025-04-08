/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { Group, Plan } from "./types";

const MAX_SIZE = 10;

class PlanGenerator {

    async seedPlan(plan: Plan): Promise<Plan> {
        // FIXME: should use info from the plan to determine the number of groups
        const nGroups = plan.placements ? Math.ceil(plan.placements.length / MAX_SIZE) : 0;

        const groups = Array.from({ length: nGroups }, (_, groupNo) => {
            return {
                id: uuid(),
                plan_id: plan.id,
                name: `Group ${groupNo}`,
                country_count: 0
            } as Group;
        });

        const updatedPlan = await groupService.batchInsert(groups)
            .then(() => {
                return {
                    ...plan,
                    groups: groups
                } as Plan;
            });

        plan.placements.forEach((placement, index) => {
            // FIXME use algorithm to place students in group
            const group = updatedPlan.groups[index % nGroups];
            placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id })
                .then(resp => console.log(resp))
        });

        return updatedPlan;
    }

}

const planGenerator = new PlanGenerator()
export { planGenerator };

