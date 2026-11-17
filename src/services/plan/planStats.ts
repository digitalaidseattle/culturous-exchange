/**
 *  planStats.ts
 *
 *  Summary numbers for a plan: totals, the countries it represents, and the
 *  minimum, average and maximum across its groups. Pure functions, no database.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Group, Plan } from "../../api/types";
import { CETimeWindowService } from "../time/ceTimeWindowService";

export type RangeStats = {
    min: number;
    average: number;
    max: number;
    /** every value that went into the summary, smallest first */
    values: number[];
};

export type CountryCount = {
    /** the country as typed, first spelling seen */
    name: string;
    /** students in the plan from this country, including waitlisted ones */
    count: number;
};

/** One group's numbers, for the charts that show a bar for each group. */
export type GroupStat = {
    name: string;
    students: number;
    /** distinct countries among its students */
    countries: number;
    /** hours of shared time, as for groupOverlap; 0 when the group has no shared time */
    hours: number;
};

export type PlanStats = {
    groupCount: number;
    studentCount: number;
    /** students placed in the plan but not in any group */
    waitlistedCount: number;
    /** each country the plan's students come from, with how many, alphabetical */
    countries: CountryCount[];
    /** students per group; null when the plan has no groups */
    groupSize: RangeStats | null;
    /** distinct countries per group; null when the plan has no groups */
    countriesPerGroup: RangeStats | null;
    /** hours of shared time per group; null when no group has a value yet */
    groupOverlap: RangeStats | null;
    /** each group's own numbers, in numeric order of the groups' names */
    perGroup: GroupStat[];
};

/** Whole numbers stay whole, everything else shows up to two decimals. */
export function formatNumber(value: number): string {
    return String(Number(value.toFixed(2)));
}

export function rangeStats(values: number[]): RangeStats | null {
    if (values.length === 0) {
        return null;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((total, value) => total + value, 0);
    return {
        min: sorted[0],
        average: sum / sorted.length,
        max: sorted[sorted.length - 1],
        values: sorted
    };
}

// Countries are compared ignoring case, like the plan evaluator does.
function countryKey(country: string): string {
    return country.trim().toLocaleUpperCase();
}

function countriesIn(group: Group): Set<string> {
    const keys = new Set<string>();
    (group.placements ?? []).forEach(placement => {
        if (placement.student?.country) {
            keys.add(countryKey(placement.student.country));
        }
    });
    return keys;
}

export function planStats(plan: Plan): PlanStats {
    const groups = plan.groups ?? [];
    const placements = plan.placements ?? [];

    // keep the first spelling seen for each country, and count the students
    const countries = new Map<string, CountryCount>();
    placements.forEach(placement => {
        const country = placement.student?.country;
        if (country) {
            const key = countryKey(country);
            const found = countries.get(key);
            if (found) {
                found.count += 1;
            } else {
                countries.set(key, { name: country.trim(), count: 1 });
            }
        }
    });

    // Overlap is the real shared time of each group: the length of its saved shared windows.
    // The saved `duration` is not used, because it counts an extra hour for every window.
    // A group with no windows has no shared time, so it counts as 0; a group whose windows
    // were not loaded is left out.
    const timeWindowService = CETimeWindowService.getInstance();
    const overlaps = groups
        .filter(group => group.time_windows !== undefined && group.time_windows !== null)
        .map(group => timeWindowService.totalHours(group.time_windows!));

    return {
        groupCount: groups.length,
        studentCount: placements.length,
        waitlistedCount: placements.filter(placement => !placement.group_id).length,
        countries: Array.from(countries.values()).sort((a, b) => a.name.localeCompare(b.name)),
        groupSize: rangeStats(groups.map(group => (group.placements ?? []).length)),
        countriesPerGroup: rangeStats(groups.map(group => countriesIn(group).size)),
        groupOverlap: rangeStats(overlaps),
        // in numeric order, so "Group 2" comes before "Group 10", whatever order the groups were read in
        perGroup: [...groups].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map(group => ({
            name: group.name,
            students: (group.placements ?? []).length,
            countries: countriesIn(group).size,
            hours: timeWindowService.totalHours(group.time_windows ?? [])
        }))
    };
}
