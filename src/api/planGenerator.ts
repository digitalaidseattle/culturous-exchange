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

    async emptyPlan(plan: Plan): Promise<Plan> {
        for (const placement of plan.placements) {
            await placementService.updatePlacement(plan.id, placement.student_id, { group_id: null });
            placement.group = undefined;
            placement.group_id = undefined;
        }

        for (const group of plan.groups) {
            await groupService.delete(group.id);
        }
        plan.groups = [];

        // REVIEW could requery for a plan
        return { ...plan };
    }

    async seedPlan(plan: Plan): Promise<Plan> {
        const cleaned = await this.emptyPlan(plan)

        const nGroups = cleaned.placements ? Math.ceil(cleaned.placements.length / MAX_SIZE) : 0;

        const groups = Array.from({ length: nGroups }, (_, groupNo) => {
            return {
                id: uuid(),
                plan_id: cleaned.id,
                name: `Group ${groupNo}`,
                country_count: 0
            } as Group;
        });

        const updatedPlan = await groupService.batchInsert(groups)
            .then(() => {
                return {
                    ...cleaned,
                    groups: groups
                } as Plan;
            });

        return Promise
            .all(cleaned.placements.map((placement, index) => {
                const group = updatedPlan.groups[index % nGroups];
                return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id })
            }))
            .then(() => {
                return updatedPlan
            });

    }

}

const planGenerator = new PlanGenerator()
export { planGenerator };

