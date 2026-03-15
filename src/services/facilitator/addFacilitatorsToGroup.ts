/**
 * addFacilitatorsToGroup.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEAssignmentDao } from '../../api/ceAssignmentDao';
import { CEGroupDao } from '../../api/ceGroupDao';
import { Facilitator, Group } from '../../api/types';

export async function addFacilitatorsToGroup(group: Group, facilitators: Facilitator[]): Promise<Group | null> {
    const dao = CEAssignmentDao.getInstance();
    const groupDao = CEGroupDao.getInstance();

    const now = new Date();

    const deletePromises = (group.assignments ?? [])
        .map(assignment => dao.delete(assignment.id!));

    const addPromises = facilitators.map(async facilitator => {
        const assignment = {
            id: uuid(),
            group_id: group.id!,
            facilitator_id: facilitator.id!,
            created_at: now,
            updated_at: now
        }
        return dao.insert(assignment);
    })

    return Promise.all([...deletePromises, ...addPromises])
        .then(() => groupDao.getById(group.id!))
        .catch(error => {
            console.error('Could not insert', error)
            throw error
        })
}