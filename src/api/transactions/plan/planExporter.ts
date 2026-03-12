/**
 *  PlanExporter.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Facilitator, Plan, Student } from "../../types";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CETimeWindowService } from "../../ceTimeWindowService";
import { PST_OFFSET, UI_STRINGS } from '../../../constants';

class PlanExporter {

    static PST_OFFSET = PST_OFFSET;

    timeWindowService: CETimeWindowService;

    constructor() {
        this.timeWindowService = CETimeWindowService.getInstance();
    }

    // Treat placements with group_id == null (or no group) as waitlisted
    isWaitlisted(placement: any): boolean {
        // Covers both shapes: explicit group_id or a missing/null group object
        return placement?.group_id == null;
    }

    profileRows(plan: Plan): any[] {
        const data: any[] = [];
        for (const group of plan.groups) {
            const groupTimes = (group.time_windows ?? []).map(tw => this.timeWindowService.toString(tw)).join(', ');
            for (const assignment of group.assignments || []) {
                let facilitator: Facilitator = assignment.facilitator! || {};
                const row: any = {
                    [UI_STRINGS.GROUP]: group.name,
                    [UI_STRINGS.GROUP_TIMES]: groupTimes,
                    [UI_STRINGS.GROUP_TIMES_STUDENT_TZ]: (group.time_windows ?? []).map(tw => this.timeWindowService.toString(tw, facilitator.time_zone)).join(', '),
                    [UI_STRINGS.NAME]: facilitator.name || "",
                    [UI_STRINGS.TYPE]: "Facilitator",
                    [UI_STRINGS.EMAIL]: facilitator.email || "",
                    [UI_STRINGS.COUNTRY]: facilitator.country,
                    [UI_STRINGS.TIME_ZONE]: facilitator.time_zone,
                    [UI_STRINGS.STUDENT_TIMES]: (facilitator.timeWindows ?? []).map(tw => this.timeWindowService.toString(tw)).join(', '),
                };
                data.push(row);
            }

            for (const placement of group.placements || []) {
                let student: Student = placement.student! || {};

                // Build one row per student
                const row: any = {
                    [UI_STRINGS.GROUP]: group.name,
                    [UI_STRINGS.GROUP_TIMES]: groupTimes,
                    [UI_STRINGS.GROUP_TIMES_STUDENT_TZ]: (group.time_windows ?? []).map(tw => this.timeWindowService.toString(tw, student.time_zone)).join(', '),
                    [UI_STRINGS.NAME]: student.name || "",
                    [UI_STRINGS.TYPE]: student.anchor ? "Anchor" : "",
                    [UI_STRINGS.EMAIL]: student.email || "",
                    [UI_STRINGS.COUNTRY]: student.country,
                    [UI_STRINGS.TIME_ZONE]: student.time_zone,
                    [UI_STRINGS.STUDENT_TIMES]: (student.timeWindows ?? []).map(tw => this.timeWindowService.toString(tw)).join(', '),
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
                [UI_STRINGS.TYPE]: student.anchor ? "Anchor" : "",
                [UI_STRINGS.EMAIL]: student.email || "",
                [UI_STRINGS.COUNTRY]: student.country,
                [UI_STRINGS.TIME_ZONE]: student.time_zone,
                [UI_STRINGS.STUDENT_TIMES]: (student.timeWindows ?? []).map(tw => this.timeWindowService.toString(tw)).join(", ")
            });
        }

        return data;

    }

    async exportPlan(plan: Plan): Promise<boolean> {
        const data = this.profileRows(plan);

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

