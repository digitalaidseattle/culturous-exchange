/**
 *  groupFit.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { Group, Placement, Student, TimeWindow } from "../../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../time/ceTimeWindowService";
import { countriesOf, genderSplit, groupFit, placementsInGroup } from "./groupFit";

const service = CETimeWindowService.getInstance();
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({
    start_date_time: service.localTimeToUTC(day, `${from}:00`, DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, `${to}:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;
const placement = (id: string, groupId: string | null, country: string): Placement =>
    ({ plan_id: "p", student_id: id, group_id: groupId, anchor: false, priority: 0, student: { id, name: id, country } as Student }) as Placement;

describe("placementsInGroup", () => {
    it("is the students placed in the group", () => {
        const placements = [placement("a", "g1", "Peru"), placement("b", "g2", "Peru"), placement("c", null, "Peru")];
        expect(placementsInGroup(placements, "g1").map(p => p.student_id)).toEqual(["a"]);
    });
});

describe("countriesOf", () => {
    it("lists each country once, however it was spelled", () => {
        const placements = [placement("a", "g", "Peru"), placement("b", "g", "Perú "), placement("c", "g", "PERU"), placement("d", "g", "Egypt")];
        expect(countriesOf(placements)).toEqual(["Peru", "Egypt"]);
    });

    it("leaves out students with no country", () => {
        expect(countriesOf([placement("a", "g", ""), placement("b", "g", "Egypt")])).toEqual(["Egypt"]);
    });
});

describe("groupFit", () => {
    const group = { id: "g1", name: "Group 1", time_windows: [pt(0, "09:00", "15:00"), pt(1, "09:00", "12:00")] } as Group;

    it("counts the group's students and countries", () => {
        const placements = [placement("a", "g1", "Peru"), placement("b", "g1", "Egypt"), placement("c", "g2", "Spain")];
        const fit = groupFit(undefined, group, placements);
        expect(fit.size).toBe(2);
        expect(fit.countries).toEqual(["Peru", "Egypt"]);
    });

    it("finds the time the student has in common with the group", () => {
        const student = { id: "s", timeWindows: [pt(0, "12:00", "18:00"), pt(2, "09:00", "10:00")] } as Student;
        const fit = groupFit(student, group, []);
        expect(fit.sharedHours).toBe(3);
    });

    it("has no shared time when the student's time does not meet the group's", () => {
        const student = { id: "s", timeWindows: [pt(2, "09:00", "12:00")] } as Student;
        expect(groupFit(student, group, []).sharedHours).toBe(0);
    });

    it("has no shared time for a student with no availability", () => {
        expect(groupFit({ id: "s", timeWindows: [] } as unknown as Student, group, []).sharedHours).toBe(0);
        expect(groupFit(undefined, group, []).sharedHours).toBe(0);
    });
});

describe("genderSplit", () => {
    const withGender = (gender?: string) => ({ student: { gender } }) as Placement;

    it("counts female, male and other, in that order", () => {
        expect(genderSplit([withGender("Female"), withGender(" male "), withGender("F"), withGender("Nonbinary"), withGender(undefined)]))
            .toEqual([{ kind: "female", count: 2 }, { kind: "male", count: 1 }, { kind: "other", count: 2 }]);
    });

    it("is all zero for no students", () => {
        expect(genderSplit([]).map(part => part.count)).toEqual([0, 0, 0]);
    });
});
