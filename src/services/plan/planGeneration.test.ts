/**
 *  planGeneration.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";

import { Group, Placement, Student, TimeWindow } from "../../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../time/ceTimeWindowService";
import { ARRANGEMENTS_TO_COMPARE, generatePlan, optimizeGrouping } from "./planGeneration";

const timeWindowService = CETimeWindowService.getInstance();
const DAYS = ["Friday", "Saturday", "Sunday"];

// a window on Friday (0), Saturday (1) or Sunday (2), in program time
const window = (day: 0 | 1 | 2, from: string, to: string): TimeWindow => ({
    day_in_week: DAYS[day],
    start_date_time: timeWindowService.localTimeToUTC(day, `${from}:00:00`, DEFAULT_TIMEZONE),
    end_date_time: timeWindowService.localTimeToUTC(day, `${to}:00:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;

// free all of the program weekend
const WHOLE_WEEKEND = () => [window(0, "07", "22"), window(1, "07", "22"), window(2, "07", "22")];

const placementFor = (id: string, windows: TimeWindow[], options: { anchor?: boolean, country?: string } = {}): Placement => {
    const student = { id, name: id, country: options.country ?? "Country", timeWindows: windows, anchor: options.anchor ?? false } as Student;
    return { plan_id: "plan", student_id: id, anchor: student.anchor, priority: 0, student } as Placement;
};

const ids = (group: Group) => group.placements!.map(placement => String(placement.student_id)).sort();
const sizes = (groups: Group[]) => groups.map(group => group.placements!.length).sort((a, b) => a - b);
const waitlisted = (placements: Placement[]) => placements.filter(placement => !placement.group_id);
const sharedHours = (group: Group) => timeWindowService.totalHours(group.time_windows ?? []);

// a small repeatable random number generator
const random = (seed: number) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

describe("generatePlan", () => {
    describe("making groups", () => {
        it("makes enough groups for everyone, splitting evenly", () => {
            const placements = Array.from({ length: 25 }, (_, i) => placementFor(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND()));
            const { groups, placements: out } = generatePlan(placements);
            // 25 students at 10 per group needs 3 groups
            expect(groups).toHaveLength(3);
            expect(sizes(groups)).toEqual([8, 8, 9]);
            expect(waitlisted(out)).toHaveLength(0);
        });

        it("uses the largest group size it is given", () => {
            const placements = Array.from({ length: 12 }, (_, i) => placementFor(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND()));
            const { groups } = generatePlan(placements, { maxGroupSize: 4 });
            expect(groups).toHaveLength(3);
            groups.forEach(group => expect(group.placements!.length).toBeLessThanOrEqual(4));
        });

        it("gives no groups when there are no students", () => {
            const { groups, placements } = generatePlan([]);
            expect(groups).toEqual([]);
            expect(placements).toEqual([]);
        });

        it("names the groups Group 1, Group 2, and so on", () => {
            const placements = Array.from({ length: 12 }, (_, i) => placementFor(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND()));
            expect(generatePlan(placements, { maxGroupSize: 5 }).groups.map(group => group.name)).toEqual(["Group 1", "Group 2", "Group 3"]);
        });

        it("starts each group with the whole program weekend and narrows it to what the members share", () => {
            const placements = [
                placementFor("a1", [window(0, "08", "12")]),
                placementFor("a2", [window(0, "10", "14")])
            ];
            const { groups } = generatePlan(placements);
            expect(groups).toHaveLength(1);
            // 8 to 12 and 10 to 14 share 10 to 12, which is 2 hours
            expect(sharedHours(groups[0])).toBe(2);
        });
    });

    describe("the waitlist", () => {
        it("waitlists students who share no time with anyone", () => {
            const friday = ["f1", "f2", "f3", "f4", "f5", "f6"].map(id => placementFor(id, [window(0, "08", "12")]));
            const saturday = ["s1", "s2"].map(id => placementFor(id, [window(1, "08", "12")]));
            const { groups, placements } = generatePlan([...friday, ...saturday]);
            expect(groups).toHaveLength(1);
            expect(ids(groups[0])).toEqual(["f1", "f2", "f3", "f4", "f5", "f6"]);
            expect(waitlisted(placements).map(p => p.student_id).sort()).toEqual(["s1", "s2"]);
        });

        it("waitlists a student who is never available at the program times", () => {
            const placements = [placementFor("a", WHOLE_WEEKEND()), placementFor("b", [window(0, "05", "06")])];
            const { placements: out } = generatePlan(placements);
            expect(waitlisted(out).map(p => p.student_id)).toEqual(["b"]);
        });

        it("waitlists a student who has no time windows at all", () => {
            const { placements } = generatePlan([placementFor("a", WHOLE_WEEKEND()), placementFor("b", [])]);
            expect(waitlisted(placements).map(p => p.student_id)).toEqual(["b"]);
        });

        it("gives a student on the waitlist a group_id of null", () => {
            const { placements } = generatePlan([placementFor("a", WHOLE_WEEKEND()), placementFor("b", [])]);
            expect(placements.find(p => p.student_id === "b")!.group_id).toBeNull();
            expect(placements.find(p => p.student_id === "a")!.group_id).toBeTruthy();
        });
    });

    describe("minimum overlap", () => {
        // a1 and a2 share Friday 8 to 12, 4 hours. b1 is free Friday 11 to 14, so joining them would leave only 11 to 12, 1 hour.
        const crowd = () => [
            placementFor("a1", [window(0, "08", "12")]),
            placementFor("a2", [window(0, "08", "12")]),
            placementFor("b1", [window(0, "11", "14")])
        ];

        it("places a student with any shared time when there is no minimum", () => {
            const { groups, placements } = generatePlan(crowd());
            expect(ids(groups[0])).toEqual(["a1", "a2", "b1"]);
            expect(waitlisted(placements)).toHaveLength(0);
        });

        it("accepts a group that leaves exactly the minimum", () => {
            const { groups } = generatePlan(crowd(), { minOverlapHours: 1 });
            expect(ids(groups[0])).toEqual(["a1", "a2", "b1"]);
        });

        it("keeps a student out of a group that would leave less than the minimum", () => {
            const { groups, placements } = generatePlan(crowd(), { minOverlapHours: 1.5 });
            expect(ids(groups[0])).toEqual(["a1", "a2"]);
            expect(waitlisted(placements).map(p => p.student_id)).toEqual(["b1"]);
            expect(sharedHours(groups[0])).toBe(4);
        });

        it("waitlists a student whose own availability is less than the minimum", () => {
            const placements = [placementFor("a1", WHOLE_WEEKEND()), placementFor("b1", [window(0, "08", "09")])];
            const { placements: out } = generatePlan(placements, { minOverlapHours: 2 });
            expect(waitlisted(out).map(p => p.student_id)).toEqual(["b1"]);
        });

        it("measures real shared time, not the count that adds an hour for each window", () => {
            // a 1 hour shared window is 1 hour of shared time, even though the counting rule would call it 2
            const placements = [placementFor("a1", [window(0, "08", "09")]), placementFor("a2", [window(0, "08", "09")])];
            expect(generatePlan(placements, { minOverlapHours: 1 }).groups[0].placements).toHaveLength(2);
            expect(generatePlan(placements, { minOverlapHours: 1.5 }).placements.filter(p => !p.group_id)).toHaveLength(2);
        });

        it("leaves every group sharing at least the minimum, whatever the students are like", () => {
            for (const seed of [1, 2, 3, 4, 5]) {
                const next = random(seed);
                const placements = Array.from({ length: 30 }, (_, i) => {
                    const windows = [0, 1, 2]
                        .filter(() => next() < 0.7)
                        .map(day => {
                            const from = 7 + Math.floor(next() * 10);
                            return window(day as 0 | 1 | 2, String(from).padStart(2, "0"), String(from + 1 + Math.floor(next() * 4)).padStart(2, "0"));
                        });
                    return placementFor(`s${String(i).padStart(2, "0")}`, windows);
                });
                for (const minOverlapHours of [0, 1, 2, 3.5]) {
                    const { groups } = generatePlan(placements, { minOverlapHours });
                    groups.filter(group => group.placements!.length > 0).forEach(group => {
                        expect(sharedHours(group)).toBeGreaterThan(0);
                        expect(sharedHours(group)).toBeGreaterThanOrEqual(minOverlapHours);
                    });
                }
            }
        });
    });

    describe("minimum group size", () => {
        const twelve = () => Array.from({ length: 12 }, (_, i) => placementFor(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND()));

        it("leaves groups as they are when there is no minimum", () => {
            expect(sizes(generatePlan(twelve()).groups)).toEqual([6, 6]);
        });

        it("leaves groups that already meet the minimum", () => {
            expect(sizes(generatePlan(twelve(), { minGroupSize: 6 }).groups)).toEqual([6, 6]);
        });

        it("breaks up a group that is too small and moves its students into the others", () => {
            // 12 students make two groups of 6; a minimum of 7 cannot be met by two groups, so one goes
            const { groups, placements } = generatePlan(twelve(), { minGroupSize: 7 });
            expect(groups).toHaveLength(1);
            // the one group fills to the largest size, and the rest are waitlisted
            expect(groups[0].placements).toHaveLength(10);
            expect(waitlisted(placements)).toHaveLength(2);
        });

        it("renumbers the groups that are left", () => {
            const { groups } = generatePlan(twelve(), { minGroupSize: 7 });
            expect(groups.map(group => group.name)).toEqual(["Group 1"]);
        });

        it("leaves every group at least the minimum size", () => {
            for (const seed of [1, 2, 3]) {
                const next = random(seed);
                const placements = Array.from({ length: 40 }, (_, i) => {
                    const windows = [0, 1, 2].filter(() => next() < 0.8)
                        .map(day => window(day as 0 | 1 | 2, "08", String(10 + Math.floor(next() * 8)).padStart(2, "0")));
                    return placementFor(`s${String(i).padStart(2, "0")}`, windows);
                });
                for (const minGroupSize of [1, 3, 5, 8]) {
                    const { groups } = generatePlan(placements, { minGroupSize });
                    groups.forEach(group => expect(group.placements!.length).toBeGreaterThanOrEqual(minGroupSize));
                }
            }
        });

        it("ignores a minimum that is larger than the largest group, rather than waitlisting everyone", () => {
            const { groups } = generatePlan(twelve(), { minGroupSize: 50, maxGroupSize: 10 });
            // the minimum is held to 10, so one full group remains
            expect(groups).toHaveLength(1);
            expect(groups[0].placements).toHaveLength(10);
        });

        it("meets both minimums together", () => {
            const placements = [
                ...["a1", "a2", "a3"].map(id => placementFor(id, [window(0, "08", "12")])),
                ...["b1", "b2"].map(id => placementFor(id, [window(1, "08", "12")]))
            ];
            // the Friday students make one group of 3, the Saturday students one of 2; a minimum of 3 breaks up the 2
            const { groups, placements: out } = generatePlan(placements, { minGroupSize: 3, minOverlapHours: 2, maxGroupSize: 3 });
            expect(groups).toHaveLength(1);
            expect(ids(groups[0])).toEqual(["a1", "a2", "a3"]);
            expect(waitlisted(out).map(p => p.student_id).sort()).toEqual(["b1", "b2"]);
        });
    });

    describe("keeping everyone accounted for", () => {
        it("puts every student in exactly one place: a group or the waitlist", () => {
            const next = random(7);
            const placements = Array.from({ length: 35 }, (_, i) =>
                placementFor(`s${String(i).padStart(2, "0")}`, [0, 1, 2].filter(() => next() < 0.6).map(day => window(day as 0 | 1 | 2, "08", "13"))));
            const { groups, placements: out } = generatePlan(placements, { minGroupSize: 4, minOverlapHours: 2 });

            expect(out).toHaveLength(35);
            const inGroups = groups.flatMap(group => ids(group));
            const onWaitlist = waitlisted(out).map(p => String(p.student_id));
            expect([...inGroups, ...onWaitlist].sort()).toEqual(placements.map(p => String(p.student_id)).sort());
            expect(new Set([...inGroups, ...onWaitlist]).size).toBe(35);
        });

        it("agrees with itself: each placement's group_id matches the group that lists it", () => {
            const placements = Array.from({ length: 15 }, (_, i) => placementFor(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND()));
            const { groups, placements: out } = generatePlan(placements, { maxGroupSize: 5, minGroupSize: 5 });
            groups.forEach(group => group.placements!.forEach(placement => {
                expect(placement.group_id).toBe(group.id);
                expect(out).toContain(placement);
            }));
        });

        it("leaves what was passed in as it was", () => {
            const placements = Array.from({ length: 12 }, (_, i) => placementFor(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND()));
            const before = JSON.stringify(placements);
            const windowsBefore = placements.map(p => p.student!.timeWindows);
            const { placements: out } = generatePlan(placements, { minGroupSize: 7 });
            expect(JSON.stringify(placements)).toBe(before);
            placements.forEach((p, i) => expect(p.student!.timeWindows).toBe(windowsBefore[i]));
            // the results are copies
            out.forEach(copy => expect(placements).not.toContain(copy));
        });
    });

    describe("order", () => {
        it("gives the same groups however the students are listed", () => {
            const next = random(11);
            const placements = Array.from({ length: 24 }, (_, i) =>
                placementFor(`s${String(i).padStart(2, "0")}`, [0, 1, 2].filter(() => next() < 0.7).map(day => window(day as 0 | 1 | 2, "08", String(10 + Math.floor(next() * 6)).padStart(2, "0")))));
            const shuffled = [...placements].sort(() => next() - 0.5);

            const summary = (list: Placement[]) => {
                const { groups, placements: out } = generatePlan(list, { minGroupSize: 3, minOverlapHours: 1 });
                return {
                    groups: groups.map(group => ids(group)).sort((a, b) => a[0].localeCompare(b[0])),
                    waitlist: waitlisted(out).map(p => String(p.student_id)).sort()
                };
            };
            expect(summary(shuffled)).toEqual(summary(placements));
        });

        it("places anchor students first, even when that costs other students their place", () => {
            const placements = [
                ...["a1", "a2", "a3"].map(id => placementFor(id, [window(0, "08", "12")])),
                ...["z1", "z2"].map(id => placementFor(id, [window(1, "08", "12")], { anchor: true }))
            ];
            // 5 students at 5 per group is one group, so the anchors z1 and z2 are placed first and set its time; the Friday students then fit nowhere
            const { groups, placements: out } = generatePlan(placements, { maxGroupSize: 5 });
            const zGroup = groups.find(group => ids(group).includes("z1"))!;
            expect(ids(zGroup)).toEqual(["z1", "z2"]);
            expect(out.filter(p => p.anchor).every(p => p.group_id)).toBe(true);
        });
    });

    describe("optimization style", () => {
        // a1 is free 8 to 12 and a2 10 to 14, so a2 shares 2 hours with a1, or 4 starting a group of its own.
        // a3 is free 10 to 12 and fits either. Two groups of up to 2.
        const trio = () => [
            placementFor("a1", [window(0, "08", "12")]),
            placementFor("a2", [window(0, "10", "14")]),
            placementFor("a3", [window(0, "10", "12")])
        ];

        it("by default joins the group with the most shared time, starting a new group when that is more", () => {
            const { groups } = generatePlan(trio(), { maxGroupSize: 2 });
            expect(groups.map(ids).sort()).toEqual([["a1", "a3"], ["a2"]]);
        });

        it("uses a group with no students yet first, whatever the style", () => {
            const { groups } = generatePlan(trio(), { maxGroupSize: 2, optimizationStyle: "smallest_first" });
            expect(groups.map(ids).sort()).toEqual([["a1", "a3"], ["a2"]]);
        });

        // Saturday only, up to 3 in a group, two groups. a1 starts one and a2 the other (an empty group is used first).
        // a3 shares 6 hours with a1 and 2 with a2. a4 shares 6 with a1's group and 2 with a2.
        const saturday = () => [
            placementFor("a1", [window(1, "08", "14")]),
            placementFor("a2", [window(1, "12", "14")]),
            placementFor("a3", [window(1, "08", "14")]),
            placementFor("a4", [window(1, "08", "14")])
        ];

        it("once every group has someone, 'largest first' keeps joining the group with the most shared time", () => {
            const { groups } = generatePlan(saturday(), { maxGroupSize: 3, optimizationStyle: "largest_first" });
            expect(groups.map(ids).sort()).toEqual([["a1", "a3", "a4"], ["a2"]]);
        });

        it("once every group has someone, 'smallest first' joins the group with the least shared time", () => {
            const { groups } = generatePlan(saturday(), { maxGroupSize: 3, optimizationStyle: "smallest_first" });
            expect(groups.map(ids).sort()).toEqual([["a1"], ["a2", "a3", "a4"]]);
        });

        it("'balanced' fills the smallest group, even where another has more shared time", () => {
            const { groups } = generatePlan(saturday(), { maxGroupSize: 3, optimizationStyle: "balanced" });
            expect(groups.map(ids).sort()).toEqual([["a1", "a3"], ["a2", "a4"]]);
        });

        it("'random' gives the same groups for the same shuffle seed, and puts everyone somewhere or on the waitlist", () => {
            const first = generatePlan(mixedStudents(), { maxGroupSize: 6, optimizationStyle: "random", shuffleSeed: 7 });
            const again = generatePlan(mixedStudents(), { maxGroupSize: 6, optimizationStyle: "random", shuffleSeed: 7 });
            expect(first.groups.map(ids)).toEqual(again.groups.map(ids));
            expect(first.groups.flatMap(ids).length + waitlisted(first.placements).length).toBe(30);
        });
    });
});

// 30 students with different free time, in groups of up to 6, so the order they are placed in changes the result
const mixedStudents = (seed = 5) => {
    const next = random(seed);
    return Array.from({ length: 30 }, (_, i) =>
        placementFor(`s${String(i).padStart(2, "0")}`, [0, 1, 2].filter(() => next() < 0.6).map(day => window(day as 0 | 1 | 2, "08", String(10 + Math.floor(next() * 8)).padStart(2, "0")))));
};
const summary = (list: Placement[], options: Parameters<typeof generatePlan>[1]) => {
    const { groups, placements: out } = generatePlan(list, options);
    return { groups: groups.map(group => ids(group)).sort((a, b) => a[0].localeCompare(b[0])), waitlist: waitlisted(out).map(p => String(p.student_id)).sort() };
};
const waitlistAt = (list: Placement[], options: Parameters<typeof generatePlan>[1]) => waitlisted(generatePlan(list, options).placements).length;

describe("shuffle seed", () => {
    it("gives the same groups for the same seed", () => {
        const students = mixedStudents();
        expect(summary(students, { maxGroupSize: 6, shuffleSeed: 42 })).toEqual(summary(students, { maxGroupSize: 6, shuffleSeed: 42 }));
    });

    it("gives the fixed order's groups when there is no seed, and other groups for some seeds", () => {
        const students = mixedStudents();
        const fixed = summary(students, { maxGroupSize: 6 });
        expect(summary(students, { maxGroupSize: 6, shuffleSeed: undefined })).toEqual(fixed);
        const others = Array.from({ length: 20 }, (_, i) => summary(students, { maxGroupSize: 6, shuffleSeed: i + 1 }));
        expect(others.some(other => JSON.stringify(other) !== JSON.stringify(fixed))).toBe(true);
    });

    it("gives the same groups for a seed however the students are listed", () => {
        const students = mixedStudents();
        const reversed = [...students].reverse();
        expect(summary(reversed, { maxGroupSize: 6, shuffleSeed: 7 })).toEqual(summary(students, { maxGroupSize: 6, shuffleSeed: 7 }));
    });

    it("still places every student exactly once", () => {
        const students = mixedStudents();
        for (const shuffleSeed of [1, 2, 3, 99]) {
            const { groups, placements } = generatePlan(students, { maxGroupSize: 6, minGroupSize: 3, shuffleSeed });
            const inGroups = groups.flatMap(group => ids(group));
            const everyone = [...inGroups, ...waitlisted(placements).map(p => String(p.student_id))].sort();
            expect(everyone).toEqual(students.map(p => String(p.student_id)).sort());
            expect(groups.every(group => group.placements!.length >= 3 && group.placements!.length <= 6)).toBe(true);
        }
    });

    it("still places anchor students first", () => {
        const placements = [
            ...["a1", "a2", "a3"].map(id => placementFor(id, [window(0, "08", "12")])),
            ...["z1", "z2"].map(id => placementFor(id, [window(1, "08", "12")], { anchor: true }))
        ];
        for (const shuffleSeed of [1, 2, 3, 4, 5, 6]) {
            const { groups, placements: out } = generatePlan(placements, { maxGroupSize: 5, shuffleSeed });
            expect(ids(groups.find(group => ids(group).includes("z1"))!)).toEqual(["z1", "z2"]);
            expect(out.filter(p => p.anchor).every(p => p.group_id)).toBe(true);
        }
    });

    it("leaves the students and placements that were passed in as they were", () => {
        const students = mixedStudents();
        const before = JSON.stringify(students);
        generatePlan(students, { maxGroupSize: 6, shuffleSeed: 3 });
        expect(JSON.stringify(students)).toBe(before);
    });
});

describe("optimizeGrouping", () => {
    const options = { maxGroupSize: 6 };

    it("compares 50 arrangements by default", async () => {
        const progress: number[] = [];
        await optimizeGrouping(mixedStudents(), options, { onProgress: p => progress.push(p.compared) });
        expect(ARRANGEMENTS_TO_COMPARE).toBe(50);
        expect(progress).toHaveLength(50);
    });

    it("reports progress after each arrangement, counting up to the total", async () => {
        const reports: { compared: number, total: number }[] = [];
        await optimizeGrouping(mixedStudents(), options, { attempts: 10, onProgress: p => reports.push({ ...p }) });
        expect(reports.map(r => r.compared)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(reports.every(r => r.total === 10)).toBe(true);
    });

    it("waits after each arrangement, so the screen can show the progress", async () => {
        let pauses = 0;
        const seenWhenPaused: number[] = [];
        const progress: number[] = [];
        await optimizeGrouping(mixedStudents(), options, {
            attempts: 5,
            onProgress: p => progress.push(p.compared),
            pause: async () => { pauses++; seenWhenPaused.push(progress.length); }
        });
        expect(pauses).toBe(5);
        expect(seenWhenPaused).toEqual([1, 2, 3, 4, 5]);
    });

    it("finds the arrangement that waitlists the fewest of the ones it compared", async () => {
        const students = mixedStudents();
        const firstSeed = 100;
        const result = await optimizeGrouping(students, options, { firstSeed });
        const fixed = waitlistAt(students, options);
        const everySeed = Array.from({ length: 50 }, (_, i) => waitlistAt(students, { ...options, shuffleSeed: firstSeed + i }));
        expect(result.waitlistedBefore).toBe(fixed);
        expect(result.waitlistedAfter).toBe(Math.min(fixed, ...everySeed));
        // and the seed it returns really gives that waitlist
        expect(waitlistAt(students, { ...options, shuffleSeed: result.shuffleSeed })).toBe(result.waitlistedAfter);
    });

    it("finds a better arrangement than the fixed order on this cohort", async () => {
        const result = await optimizeGrouping(mixedStudents(), options, { firstSeed: 1 });
        expect(result.improved).toBe(true);
        expect(result.waitlistedAfter).toBeLessThan(result.waitlistedBefore);
        expect(result.shuffleSeed).toBeDefined();
    });

    it("is never worse than what it was given, and keeps the given seed when nothing is better", async () => {
        const students = mixedStudents();
        for (const given of [undefined, 3, 17]) {
            const result = await optimizeGrouping(students, { ...options, shuffleSeed: given }, { attempts: 5, firstSeed: 1000 });
            expect(result.waitlistedAfter).toBeLessThanOrEqual(result.waitlistedBefore);
        }
        const none = await optimizeGrouping(students, { ...options, shuffleSeed: 9 }, { attempts: 0 });
        expect(none.shuffleSeed).toBe(9);
        expect(none.improved).toBe(false);
        expect(none.waitlistedAfter).toBe(none.waitlistedBefore);
    });

    it("gives the same answer for the same first seed", async () => {
        const students = mixedStudents();
        expect(await optimizeGrouping(students, options, { firstSeed: 55 })).toEqual(await optimizeGrouping(students, options, { firstSeed: 55 }));
    });

    it("searches different arrangements from a different first seed", async () => {
        const students = mixedStudents();
        const seeds = new Set<number | undefined>();
        for (const firstSeed of [1, 500, 90000]) {
            seeds.add((await optimizeGrouping(students, options, { firstSeed })).shuffleSeed);
        }
        expect(seeds.size).toBeGreaterThan(1);
    });

    it("keeps to the settings it was given", async () => {
        const students = mixedStudents();
        const settings = { maxGroupSize: 6, minGroupSize: 4, minOverlapHours: 1 };
        const result = await optimizeGrouping(students, settings, { firstSeed: 1 });
        const { groups } = generatePlan(students, { ...settings, shuffleSeed: result.shuffleSeed });
        expect(groups.every(group => group.placements!.length >= 4 && group.placements!.length <= 6)).toBe(true);
        expect(groups.every(group => sharedHours(group) >= 1)).toBe(true);
    });

    it("prefers more shared time when two arrangements waitlist the same number of students", async () => {
        // nobody is ever waitlisted, so only the shared time can tell the arrangements apart
        const next = random(3);
        const students = Array.from({ length: 12 }, (_, i) =>
            placementFor(`s${String(i).padStart(2, "0")}`, [window(0, "08", String(12 + Math.floor(next() * 6)).padStart(2, "0"))]));
        const result = await optimizeGrouping(students, { maxGroupSize: 4 }, { firstSeed: 1 });
        const total = (seed?: number) => generatePlan(students, { maxGroupSize: 4, shuffleSeed: seed }).groups.reduce((sum, group) => sum + sharedHours(group), 0);
        expect(result.waitlistedBefore).toBe(0);
        expect(total(result.shuffleSeed)).toBeGreaterThanOrEqual(total(undefined));
        const every = Array.from({ length: 50 }, (_, i) => total(1 + i));
        expect(total(result.shuffleSeed)).toBeCloseTo(Math.max(total(undefined), ...every), 6);
    });

    it("does nothing for an empty cohort", async () => {
        const result = await optimizeGrouping([], options, { attempts: 3 });
        expect(result).toEqual({ shuffleSeed: undefined, waitlistedBefore: 0, waitlistedAfter: 0, improved: false });
    });
});

