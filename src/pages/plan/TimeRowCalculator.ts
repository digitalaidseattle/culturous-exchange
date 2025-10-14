/**
 *  TimeRowCalculator.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { addHours, compareAsc, getHours, isFriday, isSaturday, isSunday } from "date-fns";
import { Group, Identifier, Placement, Plan, TimeWindow } from "../../api/types";

const WAITLIST_ID = 'WAITLIST';
export type TimeRow = {
    id: Identifier;
    groupId: Identifier;
    studentId: Identifier;
    label: string;
    type: 'group' | 'anchor' | 'student' | 'waitlist';
    friday: boolean[];
    saturday: boolean[];
    sunday: boolean[];
}
export class TimeRowCalculator {

    endingHour: number;
    startingHour: number;

    constructor(startingHour: number, endingHour: number) {
        this.endingHour = endingHour;
        this.startingHour = startingHour
    }

    calcAvailability(time_windows: TimeWindow[]): { friday: any; saturday: any; sunday: any; } {
        const range = this.endingHour - this.startingHour + 1
        const friday = Array(range).fill(false);
        const saturday = Array(range).fill(false);
        const sunday = Array(range).fill(false);
        time_windows.forEach(tw => {
            let timeCounter = tw.start_date_time;
            while (compareAsc(timeCounter, tw.end_date_time) !== 1) {
                const index = getHours(timeCounter) - this.startingHour;
                if (index < range) {
                    if (isFriday(timeCounter)) {
                        friday[index] = true;
                    } else if (isSaturday(timeCounter)) {
                        saturday[index] = true;
                    } else if (isSunday(timeCounter)) {
                        sunday[index] = true;
                    }
                }
                timeCounter = addHours(timeCounter, 1);
            }
        });
        return {
            friday: friday,
            saturday: saturday,
            sunday: sunday
        }
    }

    createStudentRows(placements: Placement[]): TimeRow[] {
        const rows = placements.map(placement => {
            const response = this.calcAvailability(placement.student?.timeWindows!)
            const row = {
                id: placement.student_id,
                groupId: placement.group_id,
                studentId: placement.student_id,
                label: placement.student ? placement.student.name : '',
                type: placement.anchor ? 'anchor' : 'student',
                friday: response.friday,
                saturday: response.saturday,
                sunday: response.sunday,
            } as TimeRow;
            return row;
        })
        return rows;
    }

    createGroupRow(group: Group): TimeRow {
        const response = this.calcAvailability(group.time_windows!)
        return {
            id: group.id,
            groupId: group.id,
            label: group.name,
            type: 'group',
            friday: response.friday,
            saturday: response.saturday,
            sunday: response.sunday,
        } as TimeRow
    }

    createWaitlistRow(): TimeRow {
        const response = this.calcAvailability([])
        return {
            id: WAITLIST_ID,
            groupId: WAITLIST_ID,
            label: "Waitlist",
            type: 'waitlist',
            friday: response.friday,
            saturday: response.saturday,
            sunday: response.sunday,
        } as TimeRow
    }

    calculate(plan: Plan): TimeRow[] {
        const tempRows: TimeRow[] = [];
        plan.groups
            .sort((g0, g1) => g0.name.localeCompare(g1.name))
            .forEach(group => {
                tempRows.push(this.createGroupRow(group));
                this.createStudentRows(plan.placements.filter(p => p.group_id === group.id))
                    .forEach(sRow => { tempRows.push(sRow) });
            });
        tempRows.push(this.createWaitlistRow());
        this.createStudentRows(plan.placements.filter(p => !p.group_id))
            .forEach(sRow => { tempRows.push(sRow) });
        return tempRows;
    }

}