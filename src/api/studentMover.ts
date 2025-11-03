/**
 * StudentUploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */

import { planEvaluator } from "./planEvaluator";
import { Identifier, Plan } from "./types";


class StudentMover {
    run(plan: Plan, studentId: Identifier, newGroupId: Identifier): Promise<Plan> {
        const planPlacement = plan.placements.find(p => p.student_id === studentId);
            
        if (planPlacement) {
            const oldGroup = plan.groups.find(g => g.id === planPlacement.group_id);
            const newGroup = plan.groups.find(g => g.id === newGroupId);

            console.log(planPlacement, oldGroup, newGroup)
            if (oldGroup && oldGroup.placements) {
                const oldIndex = oldGroup.placements.findIndex(p => p.student_id === planPlacement.student_id);
                oldGroup.placements.splice(oldIndex, 1);
                // TODO  reorder / resequence group
            }

            if (newGroup && newGroup.placements) {
                // TODO  reorder / resequence group
                newGroup.placements.push(planPlacement)
                planPlacement.group_id = newGroupId;
            } else {
                planPlacement.group_id = null;
            }

            return planEvaluator
                .evaluate(plan);
        }
        throw new Error(`Cannot find placement for student id = ${studentId}`)
    }

}

const studentMover = new StudentMover();
export { studentMover };
