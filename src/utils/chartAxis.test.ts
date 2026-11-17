/**
 *  chartAxis.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { axisTicks } from "./chartAxis";

describe("axisTicks", () => {
    it("ends on a labeled tick at or above the tallest bar", () => {
        expect(axisTicks(12)).toEqual({ ticks: [0, 5, 10, 15], max: 15 });
        expect(axisTicks(15)).toEqual({ ticks: [0, 5, 10, 15], max: 15 });
    });

    it("steps by 1 for small numbers, and does not go past the top it needs", () => {
        expect(axisTicks(3)).toEqual({ ticks: [0, 1, 2, 3], max: 3 });
        expect(axisTicks(4)).toEqual({ ticks: [0, 1, 2, 3, 4], max: 4 });
    });

    it("steps by 2 and then by 5 as the numbers grow, with no more than five ticks", () => {
        expect(axisTicks(8)).toEqual({ ticks: [0, 2, 4, 6, 8], max: 8 });
        expect(axisTicks(9)).toEqual({ ticks: [0, 5, 10], max: 10 });
        expect(axisTicks(20).ticks).toEqual([0, 5, 10, 15, 20]);
    });

    it("goes on to steps of 10, 20 and 50 for big numbers", () => {
        expect(axisTicks(35).ticks).toEqual([0, 10, 20, 30, 40]);
        expect(axisTicks(95)).toEqual({ ticks: [0, 50, 100], max: 100 });
    });

    it("rounds a fraction up, so half hours fit", () => {
        expect(axisTicks(2.5)).toEqual({ ticks: [0, 1, 2, 3], max: 3 });
    });

    it("is 0 to 1 when there is nothing to show, or only zeros", () => {
        expect(axisTicks(0)).toEqual({ ticks: [0, 1], max: 1 });
        expect(axisTicks(-3)).toEqual({ ticks: [0, 1], max: 1 });
        expect(axisTicks(Number.NaN)).toEqual({ ticks: [0, 1], max: 1 });
        expect(axisTicks(-Infinity)).toEqual({ ticks: [0, 1], max: 1 });
    });

    it("always has a tick for 0 and one for the maximum, and at most five in all", () => {
        for (let largest = 0.5; largest <= 200; largest += 0.5) {
            const { ticks, max } = axisTicks(largest);
            expect(ticks[0]).toBe(0);
            expect(ticks[ticks.length - 1]).toBe(max);
            expect(max).toBeGreaterThanOrEqual(largest);
            expect(ticks.length).toBeLessThanOrEqual(5);
        }
    });
});
