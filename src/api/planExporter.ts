/**
 *  PlanExporter.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Plan } from "./types";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { timeWindowService } from "./ceTimeWindowService";

class PlanExporter {

    async exportPlan(plan: Plan): Promise<boolean> {
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
        console.log('Exporting plan', plan.name, 'with data:', data);

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Group Placements');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        saveAs(blob, `${plan.name}.xlsx`);
        return true
    }

}

const planExporter = new PlanExporter()
export { planExporter };

