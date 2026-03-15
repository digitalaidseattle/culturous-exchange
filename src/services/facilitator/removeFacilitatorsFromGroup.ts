/**
 * removeFacilitatorsFromGroup.ts
 *
 * @copyright 2026 Digital Aid Seattle
 *
 */

import { CEAssignmentDao } from "../../api/ceAssignmentDao";
import { CEGroupDao } from "../../api/ceGroupDao";
import { Group } from "../../api/types";

export function removeFacilitatorsFromGroup(group: Group): Promise<Group | null> {
    const assignmentDao = CEAssignmentDao.getInstance();
    const groupDao = CEGroupDao.getInstance();

    const promises = (group.assignments ?? [])
        .map(assignment => assignmentDao.delete(assignment.id!));
    return Promise
        .all(promises)
        .then(() => groupDao.getById(group.id!));
}