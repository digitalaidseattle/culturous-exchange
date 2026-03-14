/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { CEAssignmentService } from "../../ceAssignmentService";
import { CEGroupService } from "../../ceGroupService";
import { placementService } from "../../cePlacementService";
import { CEPlanDao } from "../../cePlanDao";
import { Plan } from "../../types";

export async function planDelete(plan: Plan): Promise<void> {
    const planDao = CEPlanDao.getInstance();
    const groupService = CEGroupService.getInstance();
    const assignmentService = CEAssignmentService.getInstance();

    for (const assignment of plan.assignments ?? []) {
        await assignmentService.delete(assignment.id!);
    }
    for (const placement of plan.placements) {
        await placementService.deletePlacement(placement);
    }
    for (const group of plan.groups) {
        await groupService.deleteGroup(group)
    }
    return await planDao.delete(plan.id!)
}