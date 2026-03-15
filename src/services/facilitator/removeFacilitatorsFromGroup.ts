/**
 * removeFacilitatorsFromGroup.ts
 *
 * @copyright 2026 Digital Aid Seattle
 *
 */

import { CEAssignmentService } from "../ceAssignmentService";
import { CEGroupService } from "../../api/ceGroupService";
import { Group } from "../../api/types";

export function removeFacilitatorsFromGroup(group: Group): Promise<Group | null> {
    const service = CEAssignmentService.getInstance();
    const groupService = CEGroupService.getInstance();

    const promises = (group.assignments ?? [])
        .map(assignment => service.delete(assignment.id!));
    return Promise
        .all(promises)
        .then(() => groupService.getById(group.id!));
}