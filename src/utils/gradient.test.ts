/**
 *  gradient.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { decomposeColor } from "@mui/material/styles";
import { describe, expect, it } from "vitest";

import { colorAt, mixColors } from "./gradient";

const RED = "#ff0000";
const ORANGE = "#ff8000";
const YELLOW = "#ffff00";
const GREEN = "#00ff00";

// red at 0 hours, orange at 1, yellow from 2 to 4, green from 5
const SCALE = [
    { value: 0, color: RED },
    { value: 1, color: ORANGE },
    { value: 2, color: YELLOW },
    { value: 4, color: YELLOW },
    { value: 5, color: GREEN }
];

const rgb = (color: string) => decomposeColor(color).values.slice(0, 3);

describe("mixColors", () => {
    it("returns each end color at 0 and 1", () => {
        expect(rgb(mixColors(RED, GREEN, 0))).toEqual([255, 0, 0]);
        expect(rgb(mixColors(RED, GREEN, 1))).toEqual([0, 255, 0]);
    });

    it("blends halfway", () => {
        expect(rgb(mixColors(RED, YELLOW, 0.5))).toEqual([255, 128, 0]);
    });
});

describe("colorAt", () => {
    it("is red at 0 hours and orange at 1 hour", () => {
        expect(rgb(colorAt(SCALE, 0))).toEqual(rgb(RED));
        expect(rgb(colorAt(SCALE, 1))).toEqual(rgb(ORANGE));
    });

    it("is red below the scale, and green above it", () => {
        expect(rgb(colorAt(SCALE, -3))).toEqual(rgb(RED));
        expect(rgb(colorAt(SCALE, 40))).toEqual(rgb(GREEN));
    });

    it("blends from red to orange to yellow under 2 hours", () => {
        expect(rgb(colorAt(SCALE, 0.5))).toEqual([255, 64, 0]);
        expect(rgb(colorAt(SCALE, 1.5))).toEqual([255, 192, 0]);
        expect(rgb(colorAt(SCALE, 2))).toEqual(rgb(YELLOW));
    });

    it("is yellow all the way from 2 to 4 hours", () => {
        [2, 2.5, 3, 3.5, 4].forEach(hours => expect(rgb(colorAt(SCALE, hours))).toEqual(rgb(YELLOW)));
    });

    it("blends from yellow to green after 4 hours, reaching green at 5", () => {
        expect(rgb(colorAt(SCALE, 4.5))).toEqual([128, 255, 0]);
        expect(rgb(colorAt(SCALE, 5))).toEqual(rgb(GREEN));
    });

    it("changes steadily, with no jumps", () => {
        let previous = rgb(colorAt(SCALE, 0));
        for (let hours = 0.1; hours <= 5.001; hours += 0.1) {
            const current = rgb(colorAt(SCALE, hours));
            current.forEach((channel, i) => expect(Math.abs(channel - previous[i])).toBeLessThanOrEqual(30));
            previous = current;
        }
    });

    it("does not depend on the order the stops are given in", () => {
        expect(rgb(colorAt([...SCALE].reverse(), 3))).toEqual(rgb(YELLOW));
        expect(rgb(colorAt([...SCALE].reverse(), 0.5))).toEqual([255, 64, 0]);
    });

    it("always hands back an rgb() color", () => {
        [0, 0.7, 3, 4.5, 9].forEach(hours => expect(colorAt(SCALE, hours)).toMatch(/^rgb\(\d+, \d+, \d+\)$/));
    });
});
