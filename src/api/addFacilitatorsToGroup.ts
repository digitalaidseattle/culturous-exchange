/**
 * addFacilitatorsToGroup.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */


import { v4 as uuid } from 'uuid';
import { CEAssignmentService } from "./ceAssignmentService";
import { Facilitator, Group } from "./types";
import { groupService } from './ceGroupService';

const service = CEAssignmentService.getInstance();

export function addFacilitatorsToGroup(group: Group, facilitators: Facilitator[]): Promise<Group | null> {
    const now = new Date();

    const deletePromises = (group.assignments ?? [])
        .map(assignment => service.delete(assignment.id!));

    const addPromises = facilitators.map(async facilitator => {
        const assignment = {
            id: uuid(),
            group_id: group.id,
            facilitator_id: facilitator.id,
            created_at: now,
            updated_at: now
        }
        return service.insert(assignment);
    })
    return Promise.all([...deletePromises, ...addPromises])
        .then(() => groupService.getById(group.id))

}