/**
 *  distribution.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";

import { AXIS_MARGIN, distributionShape } from "./distribution";

describe("distributionShape", () => {
    it("returns null for no values", () => {
        expect(distributionShape([])).toBeNull();
    });

    describe("axis", () => {
        it("runs from the minimum minus two to the maximum plus two", () => {
            const shape = distributionShape([5, 7, 12])!;
            expect(AXIS_MARGIN).toBe(2);
            expect(shape.axisStart).toBe(3);
            expect(shape.axisEnd).toBe(14);
        });

        it("starts at 0 when the minimum minus two would be negative", () => {
            expect(distributionShape([1, 4])!.axisStart).toBe(0);
            expect(distributionShape([2, 4])!.axisStart).toBe(0);
            expect(distributionShape([0, 4])!.axisStart).toBe(0);
        });

        it("places the average along the axis", () => {
            // axis is 3 to 14 and the average is 8
            const shape = distributionShape([5, 7, 12])!;
            expect(shape.averageX).toBeCloseTo((8 - 3) / 11, 10);
        });

        it("labels both ends of the axis and keeps the ticks in order", () => {
            const shape = distributionShape([3, 10])!;
            const values = shape.ticks.map(tick => tick.value);
            expect(values[0]).toBe(1);
            expect(values[values.length - 1]).toBe(12);
            expect(shape.ticks[0].x).toBe(0);
            expect(shape.ticks[shape.ticks.length - 1].x).toBe(1);
            expect(values).toEqual([...values].sort((a, b) => a - b));
            expect(values.length).toBeLessThanOrEqual(8);
            // 3 to 10 leaves an axis of 1 to 12, so the label at 11 would sit on top of the one at 12
            expect(values).not.toContain(11);
        });

        it("labels every whole number on a short axis", () => {
            expect(distributionShape([2, 3])!.ticks.map(tick => tick.value)).toEqual([0, 1, 2, 3, 4, 5]);
        });

        it("does not crowd the end labels", () => {
            const shape = distributionShape([3, 10])!;
            for (let i = 1; i < shape.ticks.length; i++) {
                expect(shape.ticks[i].x - shape.ticks[i - 1].x).toBeGreaterThanOrEqual(0.14 - 1e-9);
            }
        });
    });

    describe("stacks", () => {
        it("has one stack for each value that a group has, and none for values no group has", () => {
            // axis is 1 to 12, so the value v is at (v - 1) / 11
            const shape = distributionShape([3, 4, 7, 9, 10])!;
            expect(shape.stacks.map(stack => stack.value)).toEqual([3, 4, 7, 9, 10]);
            shape.stacks.forEach(stack => expect(stack.x).toBeCloseTo((stack.value - 1) / 11, 10));
        });

        it("puts one dot on a value that belongs to one group", () => {
            expect(distributionShape([3, 4, 7, 9, 10])!.stacks.map(stack => stack.count)).toEqual([1, 1, 1, 1, 1]);
        });

        it("stacks groups that share a value", () => {
            // two groups of 3, one of 5, three of 8
            const shape = distributionShape([8, 3, 5, 3, 8, 8])!;
            expect(shape.stacks).toEqual([
                expect.objectContaining({ value: 3, count: 2 }),
                expect.objectContaining({ value: 5, count: 1 }),
                expect.objectContaining({ value: 8, count: 3 })
            ]);
        });

        it("counts every group, so the dots add up to the number of groups", () => {
            const values = [2, 2, 2, 4, 6, 6, 9];
            const shape = distributionShape(values)!;
            expect(shape.stacks.reduce((total, stack) => total + stack.count, 0)).toBe(values.length);
        });

        it("keeps the stacks in order from left to right", () => {
            const shape = distributionShape([9, 2, 4, 4, 5, 12])!;
            const xs = shape.stacks.map(stack => stack.x);
            expect(xs).toEqual([...xs].sort((a, b) => a - b));
        });

        it("keeps half hours and quarter hours apart", () => {
            const shape = distributionShape([0.5, 1, 1, 2.25])!;
            expect(shape.stacks.map(stack => [stack.value, stack.count])).toEqual([[0.5, 1], [1, 2], [2.25, 1]]);
        });

        it("stacks values that are the same once rounded to two decimals", () => {
            const shape = distributionShape([1.5, 1.5000000001, 2])!;
            expect(shape.stacks).toHaveLength(2);
            expect(shape.stacks[0].count).toBe(2);
        });

        it("puts a group with 0 at the left end of the axis", () => {
            const shape = distributionShape([0, 3])!;
            expect(shape.axisStart).toBe(0);
            expect(shape.stacks[0].x).toBe(0);
        });

        it("keeps every stack inside the axis", () => {
            const shape = distributionShape([10, 70, 33])!;
            shape.stacks.forEach(stack => {
                expect(stack.x).toBeGreaterThanOrEqual(0);
                expect(stack.x).toBeLessThanOrEqual(1);
            });
        });
    });

    describe("when every value is the same", () => {
        it("makes one stack with a dot for each group, centered on the axis", () => {
            const shape = distributionShape([4, 4, 4])!;
            expect(shape.axisStart).toBe(2);
            expect(shape.axisEnd).toBe(6);
            expect(shape.stacks).toHaveLength(1);
            expect(shape.stacks[0]).toEqual({ value: 4, x: 0.5, count: 3 });
            expect(shape.averageX).toBe(0.5);
        });

        it("handles a single value", () => {
            const shape = distributionShape([7])!;
            expect(shape.stacks).toEqual([{ value: 7, x: 0.5, count: 1 }]);
        });
    });
});
