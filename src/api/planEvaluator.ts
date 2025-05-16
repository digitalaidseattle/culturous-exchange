/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { timeWindowService } from "./ceTimeWindowService";
import { Plan } from "./types";


class PlanEvaluator {
    async evaluate(plan: Plan): Promise<Plan> {
        plan.groups.forEach(group => {
            group.placements!.forEach(placement => {
                if (placement.student !== undefined && placement.student.timeWindows) {
                    const tws = placement.student.timeWindows;
                    if (group.time_windows === undefined || group.time_windows.length === 0) {
                        group.time_windows = [...tws];
                    } else {
                        const intersection = timeWindowService.intersectionTimeWindowsMultiple(group.time_windows, tws);
                        group.time_windows = [...intersection];
                    }
                } else {
                    console.error("no time windows", placement.student);
                }
            })
        })
        return {...plan};
    }

  async hydrate(plan: Plan): Promise<Plan> {
    // lookup student
    // lookup time windows for each student
    // fix time windows
    // place students in groups
    plan.placements
      .filter(placement => placement.student_id !== null)
      .forEach(async placement => {
        // Place students in groups
        //  group is an object inside plan.groups
        //  group.placements becomes a list of all placements assigned to that group, populated as you loop through all placements
        const group = plan.groups.find(group => group.id === placement.group_id); // Validate that student group_id has defined is defined.
        if (group) {
          if (group.placements === undefined) {
            group.placements = [];
          }
          placement.group = group;
          placement.group_id = group.id;
          group.placements.push(placement);
        }
      });

    // Hydrate time windows
    //  update plan.placements with student time windows
    for (const placement of plan.placements) {
      if (placement.student_id !== null) {
        // Get all fields on the student (*), and also join in all related timewindow records.
        const student: any = await studentService.getById(placement.student_id!, "*, timewindow(*)");
        if (student !== null) {
          student.timewindow.forEach((tw: TimeWindow) => {
            if (tw.start_date_time) {
              tw.start_date_time = parseISO(tw.start_date_time as unknown as string);
            }
            if (tw.end_date_time) {
              tw.end_date_time = parseISO(tw.end_date_time as unknown as string);
            }
          });
          student.timeWindows = student.timewindow;
          placement.student = student;
        }
      }
    }

    return plan;
  }

  // TODO fix error in the time_window WIP
  async evaluate(plan: Plan): Promise<Plan> {
    return this.hydrate(plan) // a plan with timeWindows
      .then(hydrated => {

        // Only filter the groups that has placements with time_windows
        hydrated.groups
          .filter(group => group.placements && group.placements.length > 0)
          .forEach(group => {
          console.log('Hydrated group in Eval', group);

          group.placements!.forEach(placement => {
            if (placement.student !== undefined && placement.student.timeWindows) {
              const tws = placement.student.timeWindows;
              if (group.time_windows === undefined || group.time_windows.length === 0) {
                group.time_windows = [...tws];
              } else {
                const intersection = timeWindowService.intersectionTimeWindowsMultiple(group.time_windows, tws);
                group.time_windows = [...intersection];
              }
            } else {
              console.error("no time windows", placement.student);
            }
          })
        })
        
        console.log('hydrated groups', hydrated.groups);
        return hydrated;
      })
  }

}

const planEvaluator = new PlanEvaluator()
export { planEvaluator };
