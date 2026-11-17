/**
 *  countryCounts.ts
 *
 *  How many students are from each country, as the slices of a pie chart.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Student } from "../api/types";
import { UI_STRINGS } from "../constants";
import { normalizeCountryName } from "./countryFlag";

/** How many students are from each country, most first (ties in the order the countries were first met). */
export function countryCounts(students: Student[]): { id: number, label: string, value: number }[] {
    const counts = new Map<string, { label: string, value: number }>();
    students.forEach(student => {
        const typed = student.country?.trim();
        const key = typed ? normalizeCountryName(typed) : '';
        const found = counts.get(key);
        if (found) {
            found.value += 1;
        } else {
            counts.set(key, { label: typed || UI_STRINGS.UNKNOWN, value: 1 });
        }
    });
    return Array.from(counts.values())
        .sort((a, b) => b.value - a.value)
        .map((slice, id) => ({ id, ...slice }));
}
