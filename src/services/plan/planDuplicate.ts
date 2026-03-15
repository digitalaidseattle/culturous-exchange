/**
 *  planDuplicate.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';
import { CEAssignmentDao } from '../../api/ceAssignmentDao';
import { CEGroupDao } from '../../api/ceGroupDao';
import { CEPlacementDao } from '../../api/cePlacementDao';
import { CEPlanDao } from '../../api/cePlanDao';
import { CETimeWindowDao } from '../../api/ceTimeWindowDao';
import { Plan } from '../../api/types';

export async function planDuplicate(plan: Plan): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();
    const groupDao = CEGroupDao.getInstance();
    const assignmentDao = CEAssignmentDao.getInstance();
    const timeWindowDao = CETimeWindowDao.getInstance();
    const placementDao = CEPlacementDao.getInstance();

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

        const duplicateGroup = await groupDao.insert(proposedGroup);

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
            await placementDao.insert(proposedPlacement);
        }

        for (let assignment of group.assignments ?? []) {
            const proposedAssignment = {
                ...assignment,
                id: uuid(),
                group_id: duplicateGroup.id!
            };
            delete proposedAssignment.facilitator;

            await assignmentDao.insert(proposedAssignment);
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
        await placementDao.insert(proposedPlacement);
    }

    const fetched = await planDao.getById(duplicatePlan.id!);
    if (fetched) {
        return fetched;
    }
    throw new Error(`Could not fetch duplicated plane ${duplicatePlan.id}`)
}