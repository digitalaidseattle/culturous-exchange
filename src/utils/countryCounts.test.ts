/**
 *  countryCounts.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { Student } from "../api/types";
import { countryCounts } from "./countryCounts";

const from = (...countries: (string | undefined)[]) => countries.map((country, i) => ({ id: String(i), name: `s${i}`, country }) as Student);
const summary = (students: Student[]) => countryCounts(students).map(({ label, value }) => [label, value]);

describe("countryCounts", () => {
    it("counts the students from each country, most first", () => {
        expect(summary(from("Peru", "Egypt", "Egypt", "Egypt", "Peru", "Kenya"))).toEqual([["Egypt", 3], ["Peru", 2], ["Kenya", 1]]);
    });

    it("keeps countries with the same count in the order they were first met", () => {
        expect(summary(from("Peru", "Egypt", "Egypt", "Peru"))).toEqual([["Peru", 2], ["Egypt", 2]]);
    });

    it("counts a country once however it was typed, spelled as first typed", () => {
        expect(summary(from("Peru", " peru", "PERU "))).toEqual([["Peru", 3]]);
    });

    it("counts students who gave no country as Unknown", () => {
        expect(summary(from("Peru", undefined, "  ", undefined))).toEqual([["Unknown", 3], ["Peru", 1]]);
    });

    it("gives each slice a number, from 0", () => {
        expect(countryCounts(from("Peru", "Egypt", "Egypt")).map(slice => slice.id)).toEqual([0, 1]);
    });

    it("has no slices for no students", () => {
        expect(countryCounts([])).toEqual([]);
    });
});
