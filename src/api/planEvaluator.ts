/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { parseISO } from "date-fns";
import { studentService } from "./ceStudentService";
import { timeWindowService } from "./ceTimeWindowService";
import { Plan, TimeWindow } from "./types";


class PlanEvaluator {

    async hydrate(plan: Plan): Promise<Plan> {
        // lookup student
        // lookup time windows for each student
        // fix time windows
        // place students in groups

        console.log('0', plan.groups.length)
        plan.placements
            .filter(placement => placement.student_id !== null)
            .forEach(placement => {
                // place students in groups
                const group = plan.groups.find(group => group.id === placement.group_id);
                if (group) {
                    if (group.placements === undefined) {
                        group.placements = [];
                    }
                    placement.group = group;
                    placement.group_id = group.id;
                    group.placements.push(placement);
                    // plan.groups.push()
                }
            });
        console.log('1', plan)

        for (const placement of plan.placements) {
            if (placement.student_id !== null) {
                const student: any = await studentService.getById(placement.student_id!, "*, timewindow(*)");
                if (student !== null) {
                    student.timewindow.forEach((tw: TimeWindow) => {
                        tw.start_date_time = parseISO(tw.start_date_time! as unknown as string);
                        tw.end_date_time = parseISO(tw.end_date_time! as unknown as string);
                    });
                    student.timeWindows = student.timewindow;
                    placement.student = student;
                }
            }
        }
        console.log(plan)
        return { ...plan };
    }

    async evaluate(plan: Plan): Promise<Plan> {
        return this.hydrate(plan)
            .then(hydrated => {
                hydrated.groups.forEach(group => {
                    console.log(group)

                    group.placements!.forEach(placement => {
                        if (placement.student !== undefined && placement.student.timeWindows) {
                            const tws = placement.student.timeWindows;
                            if (group.time_windows === undefined || group.time_windows.length === 0) {
                                group.time_windows = [...tws];
                            } else {
                                const intersection = timeWindowService.intersectionTimeWindowsMultiple(group.time_windows, tws);
                                console.log('group', intersection)
                                group.time_windows = [...intersection];
                            }
                        } else {
                            console.error("no time windows", placement.student);
                        }
                    })
                })
                return hydrated;
            })
    }

}

const planEvaluator = new PlanEvaluator()
export { planEvaluator };

