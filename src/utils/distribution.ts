/**
 *  distribution.ts
 *
 *  Geometry for the distribution summary charts, which are dot plots: each group
 *  is one dot above a horizontal axis, and groups with the same value stack.
 *  Given the values of a few groups it works out:
 *
 *  - the horizontal axis: it starts at 0 or the minimum minus two, whichever is
 *    larger, and ends at the maximum plus two, with a few numbered ticks
 *  - the stacks: for each value that at least one group has, where it sits on
 *    the axis and how many groups have it, so the drawing can stack that many dots
 *  - where the average falls on the axis
 *
 *  Positions are returned as 0 to 1 fractions of the axis, so any drawing code
 *  can scale them. Nothing is estimated: every dot is a group.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

/** How far past the minimum and maximum the axis reaches, in the unit of the values. */
export const AXIS_MARGIN = 2;

export type AxisTick = {
    value: number;
    /** 0 is the left end of the axis, 1 the right end */
    x: number;
};

export type Stack = {
    value: number;
    /** 0 is the left end of the axis, 1 the right end */
    x: number;
    /** how many groups have this value, which is how many dots are stacked here */
    count: number;
};

export type DistributionShape = {
    /** first and last value on the axis */
    axisStart: number;
    axisEnd: number;
    ticks: AxisTick[];
    /** one for each value a group has, left to right */
    stacks: Stack[];
    /** where the average falls on the axis, 0 to 1 */
    averageX: number;
};

const TICK_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const TICK_TARGET = 7;
/** Share of the axis an inner tick must keep clear of the two end ticks. */
const TICK_CROWDING = 0.14;

function axisTicks(start: number, end: number): AxisTick[] {
    const range = end - start;
    const step = TICK_STEPS.find(candidate => range / candidate <= TICK_TARGET) ?? TICK_STEPS[TICK_STEPS.length - 1];

    const values: number[] = [];
    for (let value = start; value < end - 1e-9; value += step) {
        values.push(value);
    }
    values.push(end);

    // both ends always get a label; inner labels give way when they would crowd an end
    return values
        .filter((value, i) => i === 0 || i === values.length - 1
            || (value - start >= range * TICK_CROWDING && end - value >= range * TICK_CROWDING))
        .map(value => ({ value, x: (value - start) / range }));
}

export function distributionShape(values: number[]): DistributionShape | null {
    if (values.length === 0) {
        return null;
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((total, value) => total + value, 0) / values.length;

    const axisStart = Math.max(0, min - AXIS_MARGIN);
    const axisEnd = max + AXIS_MARGIN;
    const toX = (value: number) => (value - axisStart) / (axisEnd - axisStart);

    // count the groups at each value; values are saved to two decimals, so equal values stack
    const counts = new Map<number, number>();
    values.forEach(value => {
        const key = Math.round(value * 100);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const stacks: Stack[] = Array.from(counts.entries())
        .sort(([a], [b]) => a - b)
        .map(([key, count]) => ({ value: key / 100, x: toX(key / 100), count }));

    return {
        axisStart,
        axisEnd,
        ticks: axisTicks(axisStart, axisEnd),
        stacks,
        averageX: toX(average)
    };
}
