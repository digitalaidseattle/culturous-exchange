/**
 * removeFacilitatorsFromGroup.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */


import { CEAssignmentService } from "./ceAssignmentService";
import { groupService } from './ceGroupService';
import { Group } from "./types";

const service = CEAssignmentService.getInstance();

export function removeFacilitatorsFromGroup(group: Group): Promise<Group | null> {

    const promises = (group.assignments ?? [])
        .map(assignment => service.delete(assignment.id));
    return Promise.all(promises)
        .then(() =>
            groupService.getById(group.id));

}