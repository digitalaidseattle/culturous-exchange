/**
 *  chartAxis.ts
 *
 *  The ticks of the vertical axis of a bar chart, chosen so the axis ends on a labeled round number at or
 *  above the tallest bar, rather than at an unlabeled point above it: 0 to 12 in steps of 4, say, not
 *  a 10 with the axis running on to an unmarked 14.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

/** The steps tried, smallest first, and as many ticks as the axis may have, counting 0. */
const STEPS = [1, 2, 5];
const MOST_TICKS = 5;

/**
 * The ticks from 0 up to the first one at or above `largest`, in the smallest round step (1, 2, 5, 10, 20, 50 ...)
 * that keeps them to `MOST_TICKS`. `max` is the last of them. With nothing to show, or only zeros, it is 0 to 1.
 */
export function axisTicks(largest: number): { ticks: number[], max: number } {
    const top = Number.isFinite(largest) && largest > 0 ? largest : 1;
    let step = 0;
    for (let scale = 1; step === 0; scale *= 10) {
        step = STEPS.map(base => base * scale).find(candidate => Math.ceil(top / candidate) + 1 <= MOST_TICKS) ?? 0;
    }
    const count = Math.ceil(top / step);
    const ticks = Array.from({ length: count + 1 }, (_, i) => i * step);
    return { ticks, max: ticks[ticks.length - 1] };
}
