/**
 *  planStats.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";

import { Group, Placement, Plan, Student, TimeWindow } from "../../api/types";
import { planStats, rangeStats } from "./planStats";

const placement = (studentId: string, country: string, groupId?: string): Placement =>
    ({
        plan_id: "plan",
        student_id: studentId,
        group_id: groupId ?? null,
        student: { id: studentId, country } as Student
    }) as Placement;

// `shared` is the hours the group really shares: one number for one window, or a list for several.
// Nothing (undefined) means the group's windows were not loaded. 0 means it shares no time, so it has no windows.
// The saved `duration` is set the way the counting rule saves it, one extra hour per window,
// so the tests show it is not what the statistics use.
const group = (id: string, placements: Placement[], shared?: number | number[]): Group => {
    if (shared === undefined) {
        return { id, plan_id: "plan", name: id, country_count: 0, placements } as Group;
    }
    const hours = (Array.isArray(shared) ? shared : [shared]).filter(h => h > 0);
    const start = new Date("2000-09-01T02:00:00Z").getTime();
    const time_windows = hours.map((h, i) => ({
        id: `${id}-${i}`,
        start_date_time: new Date(start + i * 24 * 3600 * 1000),
        end_date_time: new Date(start + i * 24 * 3600 * 1000 + h * 3600 * 1000)
    }) as TimeWindow);
    const duration = hours.reduce((total, h) => total + h + 1, 0);
    return { id, plan_id: "plan", name: id, country_count: 0, placements, time_windows, duration } as Group;
};

describe("rangeStats", () => {
    it("returns null for no values", () => {
        expect(rangeStats([])).toBeNull();
    });

    it("finds min, average and max", () => {
        expect(rangeStats([9, 2, 4])).toEqual({ min: 2, average: 5, max: 9, values: [2, 4, 9] });
    });

    it("handles a single value", () => {
        expect(rangeStats([7])).toEqual({ min: 7, average: 7, max: 7, values: [7] });
    });
});

describe("planStats", () => {
    const a1 = placement("s1", "India", "A");
    const a2 = placement("s2", "india", "A");
    const a3 = placement("s3", "Japan", "A");
    const b1 = placement("s4", "Japan", "B");
    const waitlisted = placement("s5", "Brazil");

    const plan = {
        id: "plan",
        placements: [a1, a2, a3, b1, waitlisted],
        groups: [group("A", [a1, a2, a3], 6), group("B", [b1], 2)]
    } as Plan;

    it("counts groups, students and waitlisted students", () => {
        const stats = planStats(plan);
        expect(stats.groupCount).toBe(2);
        expect(stats.studentCount).toBe(5);
        expect(stats.waitlistedCount).toBe(1);
    });

    it("lists each country once, ignoring case, alphabetically", () => {
        expect(planStats(plan).countries.map(country => country.name)).toEqual(["Brazil", "India", "Japan"]);
    });

    it("counts the students from each country, waitlisted ones included", () => {
        expect(planStats(plan).countries).toEqual([
            { name: "Brazil", count: 1 },   // the waitlisted student
            { name: "India", count: 2 },    // "India" and "india" are one country
            { name: "Japan", count: 2 }
        ]);
    });

    it("counts every student that has a country", () => {
        const total = planStats(plan).countries.reduce((sum, country) => sum + country.count, 0);
        expect(total).toBe(5);
    });

    it("ignores students without a country", () => {
        const noCountry = {
            id: "plan",
            placements: [placement("s1", "Japan", "A"), { ...placement("s2", "", "A") }],
            groups: []
        } as unknown as Plan;
        expect(planStats(noCountry).countries).toEqual([{ name: "Japan", count: 1 }]);
    });

    it("summarizes group size", () => {
        expect(planStats(plan).groupSize).toEqual({ min: 1, average: 2, max: 3, values: [1, 3] });
    });

    it("summarizes countries per group, ignoring case", () => {
        // group A has India and Japan (india counts once), group B has Japan
        expect(planStats(plan).countriesPerGroup).toEqual({ min: 1, average: 1.5, max: 2, values: [1, 2] });
    });

    it("summarizes group overlap hours", () => {
        expect(planStats(plan).groupOverlap).toEqual({ min: 2, average: 4, max: 6, values: [2, 6] });
    });

    it("uses the real shared time of the saved windows, not the saved duration", () => {
        // one window of 4 hours is saved with a duration of 5, but its shared time is 4
        const single = { ...plan, groups: [group("A", [a1], 4), group("B", [b1], 2)] } as Plan;
        expect(single.groups[0].duration).toBe(5);
        expect(planStats(single).groupOverlap).toEqual({ min: 2, average: 3, max: 4, values: [2, 4] });
    });

    it("adds up a group's windows without an extra hour for each", () => {
        // 2 hours and 1.5 hours is 3.5 hours; the counting rule would save 5.5
        const several = { ...plan, groups: [group("A", [a1], [2, 1.5])] } as Plan;
        expect(several.groups[0].duration).toBe(5.5);
        expect(planStats(several).groupOverlap).toEqual({ min: 3.5, average: 3.5, max: 3.5, values: [3.5] });
    });

    it("keeps half hours", () => {
        const half = { ...plan, groups: [group("A", [a1], 0.5)] } as Plan;
        expect(planStats(half).groupOverlap!.min).toBe(0.5);
    });

    it("counts a group that shares no time as 0", () => {
        const none = { ...plan, groups: [group("A", [a1], 0), group("B", [b1], 3)] } as Plan;
        expect(planStats(none).groupOverlap).toEqual({ min: 0, average: 1.5, max: 3, values: [0, 3] });
    });

    it("skips groups without an overlap value", () => {
        const partial = {
            ...plan,
            groups: [group("A", [a1], 5), group("B", [b1])]
        } as Plan;
        expect(planStats(partial).groupOverlap).toEqual({ min: 5, average: 5, max: 5, values: [5] });
    });

    it("returns empty summaries for a plan without groups", () => {
        const empty = { id: "plan", placements: [waitlisted], groups: [] } as unknown as Plan;
        const stats = planStats(empty);
        expect(stats.groupCount).toBe(0);
        expect(stats.waitlistedCount).toBe(1);
        expect(stats.groupSize).toBeNull();
        expect(stats.countriesPerGroup).toBeNull();
        expect(stats.groupOverlap).toBeNull();
    });
});
