/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { CEAssignmentService } from "../ceAssignmentService";
import { CEGroupService } from "../../api/ceGroupService";
import { CEPlanDao } from "../../api/cePlanDao";
import { Plan } from "../../api/types";
import { CEPlacementService } from "../cePlacementService";

export async function planDelete(plan: Plan): Promise<void> {
    const planDao = CEPlanDao.getInstance();
    const groupService = CEGroupService.getInstance();
    const assignmentService = CEAssignmentService.getInstance();

    for (const assignment of plan.assignments ?? []) {
        await assignmentService.delete(assignment.id!);
    }
    for (const placement of plan.placements) {
        await CEPlacementService.getInstance().deletePlacement(placement);
    }
    for (const group of plan.groups) {
        await groupService.deleteGroup(group)
    }
    return await planDao.delete(plan.id!)
}