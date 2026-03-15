/**
 *  planDuplicate.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';
import { CEAssignmentService } from '../ceAssignmentService';
import { CEGroupService } from '../../api/ceGroupService';
import { CEPlanDao } from '../../api/cePlanDao';
import { CETimeWindowDao } from '../../api/ceTimeWindowDao';
import { Plan } from '../../api/types';
import { CEPlacementService } from '../cePlacementService';

export async function planDuplicate(plan: Plan): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();
    const groupService = CEGroupService.getInstance();
    const assignmentService = CEAssignmentService.getInstance();
    const timeWindowDao = CETimeWindowDao.getInstance();
    const placementService = CEPlacementService.getInstance();

    const proposed: any = {
        ...plan,
        id: uuid(),
        name: plan.name + ' (copy)',
        active: false
    };
    delete proposed.groups;
    delete proposed.placements;
    delete proposed.assignments;

    const duplicatePlan = await planDao.insert(proposed);

    for (let group of plan.groups) {
        const proposedGroup = {
            ...group,
            id: uuid(),
            plan_id: duplicatePlan.id!,
        };
        delete proposedGroup.assignments;
        delete proposedGroup.placements;
        delete proposedGroup.time_windows;

        const duplicateGroup = await groupService.insert(proposedGroup);

        for (let tw of group.time_windows ?? []) {
            const proposedTw = {
                ...tw,
                id: uuid(),
                group_id: duplicateGroup.id!
            };
            await timeWindowDao.insert(proposedTw);
        }

        for (let placement of group.placements ?? []) {
            const proposedPlacement = {
                ...placement,
                plan_id: duplicatePlan.id!,
                group_id: duplicateGroup.id!
            };
            delete proposedPlacement.student;
            await placementService.insert(proposedPlacement);
        }

        for (let assignment of group.assignments ?? []) {
            const proposedAssignment = {
                ...assignment,
                id: uuid(),
                group_id: duplicateGroup.id!
            };
            delete proposedAssignment.facilitator;

            await assignmentService.insert(proposedAssignment);
        }
    }

    // handle placements where group is null
    const waitlisted = plan.placements
        .filter(placement => placement.group_id === null);
    for (let placement of waitlisted) {
        const proposedPlacement = {
            ...placement,
            plan_id: duplicatePlan.id!
        };
        delete proposedPlacement.student;
        await placementService.insert(proposedPlacement);
    }

    const fetched = await planDao.getById(duplicatePlan.id!);
    if (fetched) {
        return fetched;
    }
    throw new Error(`Could not fetch duplicated plane ${duplicatePlan.id}`)
}