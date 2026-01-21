/**
 *  PlanExporter.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Plan, Student } from "./types";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { timeWindowService } from "./ceTimeWindowService";
import { PST_OFFSET, UI_STRINGS } from '../constants';

class PlanExporter {

    static PST_OFFSET = PST_OFFSET;

    verticalGroups(plan: Plan): any[] {
        const data: any[] = [];

        data.push(plan.groups.map(group => group.name));
        data.push(plan.groups.map(group => group.country_count));
        data.push(plan.groups.map(group => group.time_windows?.map(tw => timeWindowService.toString(tw)).join('\n') || ""));

        let done = false;
        let rowCount = 0;
        while (!done) {
            let row = [];
            let hasOne = false
            for (let i = 0; i < plan.groups.length; i++) {
                if (plan.groups[i].placements!.length > rowCount) {
                    row.push(plan.groups[i].placements![rowCount]?.student?.name || "");
                    hasOne = true;
                } else {
                    row.push("");
                }
            }
            if (hasOne) {
                data.push(row);
                rowCount++;
            } else {
                done = true;
            }
        }
        return data;
    }

    // Treat placements with group_id == null (or no group) as waitlisted
    isWaitlisted(placement: any): boolean {
        // Covers both shapes: explicit group_id or a missing/null group object
        return placement?.group_id == null;
    }

    studentRows(plan: Plan): any[] {
        const data: any[] = [];
        for (const group of plan.groups) {
            for (const placement of group.placements || []) {
                let student: Student = placement.student! || {};

                // Build one row per student
                const row: any = {
                    [UI_STRINGS.GROUP]: group.name,
                    [UI_STRINGS.GROUP_TIMES]: group.time_windows?.map(tw => timeWindowService.toString(tw)).join(', ') || "",
                    [UI_STRINGS.GROUP_TIMES_STUDENT_TZ]: group.time_windows?.map(tw => timeWindowService.toString(tw, student.time_zone)).join(', ') || "",
                    [UI_STRINGS.NAME]: student.name || "",
                    [UI_STRINGS.ANCHOR]: student.anchor ? "yes" : "",
                    [UI_STRINGS.EMAIL]: student.email || "",
                    [UI_STRINGS.COUNTRY]: student.country,
                    [UI_STRINGS.TIME_ZONE]: student.time_zone,
                    [UI_STRINGS.STUDENT_TIMES]: student.timeWindows?.map(tw => timeWindowService.toString(tw)).join(', ') || "",
                };
                data.push(row);
            }
        }

        const waitlisted = (plan.placements ?? []).filter(this.isWaitlisted);

        // Waitlisted students
        for (const placement of waitlisted) {
            const student: Student = placement.student ?? ({} as Student);

                data.push({
                [UI_STRINGS.GROUP]: UI_STRINGS.WAITLIST,
                [UI_STRINGS.GROUP_TIMES_PST]: "",
                [UI_STRINGS.GROUP_TIMES_STUDENT_TZ]: "",
                [UI_STRINGS.NAME]: student.name || "",
                [UI_STRINGS.ANCHOR]: student.anchor ? "yes" : "",
                [UI_STRINGS.EMAIL]: student.email || "",
                [UI_STRINGS.COUNTRY]: student.country,
                [UI_STRINGS.TIME_ZONE]: student.time_zone,
                [UI_STRINGS.STUDENT_TIMES]:
                    student.timeWindows?.map(tw =>
                        timeWindowService.toString(tw)
                    ).join(", ") || "",
            });
        }

        return data;

    }


    async exportPlan(plan: Plan): Promise<boolean> {
        const data = this.studentRows(plan);

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, UI_STRINGS.GROUP_PLACEMENTS_SHEET);

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        saveAs(blob, `${plan.name}.xlsx`);
        return true
    }

}

const planExporter = new PlanExporter()
export { planExporter };

