/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { CEPlacementDao } from "../../api/cePlacementDao";
import { CEPlanDao } from "../../api/cePlanDao";
import { Plan } from "../../api/types";
import { CEGroupService } from "../group/ceGroupService";

export async function planDelete(plan: Plan): Promise<void> {
    const placementDao = CEPlacementDao.getInstance();
    const planDao = CEPlanDao.getInstance();
    const groupService = CEGroupService.getInstance();

    for (const placement of plan.placements) {
        await placementDao.deletePlacement(placement);
    }
    for (const group of plan.groups) {
        await groupService.deleteGroup(group)
    }
    return await planDao.delete(plan.id!)
}