/**
 *  DistributionChart.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { rangeStats } from "../services/plan/planStats";
import { DistributionChart } from "./DistributionChart";

const hours = { one: "hour", other: "hours" };

// The chart is 200 wide when it has not been measured, as in these tests. How tall it is, and where
// its axis line sits, depends on the number of groups, so read them from the drawing.
const baselineOf = (root: HTMLElement) => Number(root.querySelector("line")!.getAttribute("y1"));
const heightOf = (root: HTMLElement) => Number(root.querySelector("svg")!.getAttribute("height"));
// the space kept clear above the tallest stack, and between the axis and the bottom dot
const TOP = 4;
const LIFT = 1;

const dotsOf = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("circle")).map(dot => ({
        x: Number(dot.getAttribute("cx")),
        y: Number(dot.getAttribute("cy")),
        r: Number(dot.getAttribute("r")),
        fill: dot.getAttribute("fill")
    }));

describe("DistributionChart", () => {
    describe("readouts", () => {
        it("gives the minimum and maximum with their units, and leaves the average out by default", () => {
            render(<DistributionChart title="Group overlap" unit={hours} stats={rangeStats([2, 3, 4, 7])} />);

            expect(screen.getByText("Group overlap")).toBeTruthy();
            expect(screen.getByText("Min")).toBeTruthy();
            expect(screen.getByText("Max")).toBeTruthy();
            expect(screen.queryByText("Avg")).toBeNull();
            // two readouts, each with its unit
            expect(screen.getAllByText("hours")).toHaveLength(2);
        });

        it("also gives the average when asked to", () => {
            render(<DistributionChart title="Group overlap" unit={hours} showAverage stats={rangeStats([2, 3, 4, 7])} />);
            expect(screen.getByText("Min")).toBeTruthy();
            expect(screen.getByText("Avg")).toBeTruthy();
            expect(screen.getByText("Max")).toBeTruthy();
            expect(screen.getAllByText("hours")).toHaveLength(3);
        });

        it("describes the chart for screen readers, without the average", () => {
            render(<DistributionChart title="Group size" stats={rangeStats([2, 4])} />);
            expect(screen.getByRole("img", { name: "Group size: Min 2, Max 4" })).toBeTruthy();
        });

        it("includes the average in the description when it is shown", () => {
            render(<DistributionChart title="Group size" showAverage stats={rangeStats([2, 4])} />);
            expect(screen.getByRole("img", { name: "Group size: Min 2, Avg 3, Max 4" })).toBeTruthy();
        });

        it("uses the singular unit for one", () => {
            render(<DistributionChart title="Group overlap" unit={hours} stats={rangeStats([1, 3])} />);
            expect(screen.getAllByText("hour")).toHaveLength(1);
            expect(screen.getAllByText("hours")).toHaveLength(1);
        });

        it("shows a single readout when every value is the same", () => {
            render(<DistributionChart title="Group size" stats={rangeStats([5, 5, 5])} />);
            expect(screen.getByText("Min = Max")).toBeTruthy();
            expect(screen.queryByText("Min")).toBeNull();
            expect(screen.queryByText("Max")).toBeNull();
            expect(screen.queryByText("Min = Avg = Max")).toBeNull();
        });

        it("names the average in that single readout when the average is shown", () => {
            render(<DistributionChart title="Group size" showAverage stats={rangeStats([5, 5, 5])} />);
            expect(screen.getByText("Min = Avg = Max")).toBeTruthy();
        });

        it("says there are no groups yet when there is nothing to chart", () => {
            const { container } = render(<DistributionChart title="Group size" stats={null} />);
            expect(screen.getByText("No groups yet")).toBeTruthy();
            expect(screen.queryByText("Avg")).toBeNull();
            expect(container.querySelectorAll("circle")).toHaveLength(0);
        });
    });

    describe("chart panel", () => {
        it("puts the dots, axis, and axis numbers on a white panel with rounded corners", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 4, 7, 9, 10])} />);
            const panel = screen.getByTestId("chart-area");
            const style = getComputedStyle(panel);
            expect(style.backgroundColor).toMatch(/^(#fff|#ffffff|rgb\(255, 255, 255\))$/i);
            expect(parseFloat(style.borderRadius)).toBeGreaterThan(0);
            // the drawing and its numbers are inside the panel
            expect(panel.querySelector("svg")).toBeTruthy();
            expect(panel.textContent).toContain("12");
            // the title and the readouts are outside it, on the tinted box
            expect(panel.textContent).not.toContain("Group size");
            expect(panel.textContent).not.toContain("Min");
            expect(container.contains(panel)).toBe(true);
        });

        it("gives the panel a light border", () => {
            render(<DistributionChart title="Group size" stats={rangeStats([3, 4, 7, 9, 10])} />);
            const style = getComputedStyle(screen.getByTestId("chart-area"));
            expect(parseFloat(style.borderTopWidth)).toBe(1);
            expect(style.borderTopStyle).toBe("solid");
            // the theme's divider color, a light grey, not black
            expect(style.borderTopColor).not.toBe("");
            expect(style.borderTopColor).not.toMatch(/^(black|#000|#000000|rgb\(0, 0, 0\))$/i);
        });

        it("has one panel for each chart", () => {
            render(<>
                <DistributionChart title="A" stats={rangeStats([3, 4])} />
                <DistributionChart title="B" stats={rangeStats([5, 6])} />
            </>);
            expect(screen.getAllByTestId("chart-area")).toHaveLength(2);
        });

        it("leaves room inside the panel, so a dot on the very edge is not cut off", () => {
            render(<DistributionChart title="Group overlap" stats={rangeStats([0, 1, 3])} />);
            const style = getComputedStyle(screen.getByTestId("chart-area"));
            expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(8);
            expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(8);
        });
    });

    describe("height", () => {
        // the most dots the chart gives full size to; past this the dots shrink instead of the chart growing
        const FULL_SIZE_STACK = 12;

        it("is just tall enough for a stack of one dot for every group in the plan", () => {
            // 5 groups: a stack of 5 dots at full size, 10 pixels each, plus the space above and the lift off the axis
            const { container } = render(<DistributionChart title="Group size" groupCount={5} stats={rangeStats([3, 4, 7, 9, 10])} />);
            const baseline = baselineOf(container);
            expect(baseline).toBe(TOP + 5 * 10 + LIFT);
            expect(heightOf(container)).toBe(baseline + 4);
        });

        it("gets taller with more groups, and shorter with fewer", () => {
            const heights = [3, 5, 8].map(count => {
                const { container } = render(<DistributionChart title="Group size" groupCount={count} stats={rangeStats([3, 4])} />);
                return heightOf(container);
            });
            expect(heights[0]).toBeLessThan(heights[1]);
            expect(heights[1]).toBeLessThan(heights[2]);
            // each group adds one full dot of height
            expect(heights[1] - heights[0]).toBe(2 * 10);
            expect(heights[2] - heights[1]).toBe(3 * 10);
        });

        it("fits every group stacked on one value at full dot size", () => {
            // the worst case: all 5 groups have the same value
            const { container } = render(<DistributionChart title="Group size" groupCount={5} stats={rangeStats([6, 6, 6, 6, 6])} />);
            const dots = dotsOf(container);
            expect(dots).toHaveLength(5);
            dots.forEach(dot => expect(dot.r).toBe(5));
            const baseline = baselineOf(container);
            const lowest = Math.max(...dots.map(dot => dot.y + dot.r));
            const highest = Math.min(...dots.map(dot => dot.y - dot.r));
            expect(lowest).toBeLessThanOrEqual(baseline);
            // the top dot is right at the top of the room: no space is wasted
            expect(highest).toBeCloseTo(TOP, 5);
        });

        it("makes charts of the same plan the same height, whatever their values", () => {
            const a = render(<DistributionChart title="A" groupCount={5} stats={rangeStats([3, 4, 7, 9, 10])} />);
            const b = render(<DistributionChart title="B" groupCount={5} stats={rangeStats([2, 2, 2, 8, 8])} />);
            const c = render(<DistributionChart title="C" groupCount={5} stats={rangeStats([0.5, 1, 1, 2, 2])} />);
            expect(heightOf(b.container)).toBe(heightOf(a.container));
            expect(heightOf(c.container)).toBe(heightOf(a.container));
        });

        it("uses the number of values when no group count is given", () => {
            const alone = render(<DistributionChart title="A" stats={rangeStats([3, 4, 7, 9, 10])} />);
            const given = render(<DistributionChart title="B" groupCount={5} stats={rangeStats([3, 4, 7, 9, 10])} />);
            expect(heightOf(alone.container)).toBe(heightOf(given.container));
        });

        it("counts groups that have no value too, when the plan has more groups than values", () => {
            // 5 groups in the plan, but only 2 have a value to chart: the chart is still tall enough for all 5
            const { container } = render(<DistributionChart title="Group overlap" groupCount={5} stats={rangeStats([1, 2])} />);
            expect(baselineOf(container)).toBe(TOP + 5 * 10 + LIFT);
        });

        it("stops growing at the cap and shrinks the dots instead, so every group still fits", () => {
            const atCap = render(<DistributionChart title="A" groupCount={FULL_SIZE_STACK} stats={rangeStats([5, 7])} />);
            const beyond = render(<DistributionChart title="B" groupCount={40} stats={rangeStats(Array(40).fill(5))} />);
            expect(heightOf(beyond.container)).toBe(heightOf(atCap.container));
            const dots = dotsOf(beyond.container);
            expect(dots).toHaveLength(40);
            // smaller than a full size dot, and all inside the chart
            expect(dots[0].r).toBeLessThan(5);
            const baseline = baselineOf(beyond.container);
            dots.forEach(dot => {
                expect(dot.y - dot.r).toBeGreaterThanOrEqual(TOP - 1e-6);
                expect(dot.y + dot.r).toBeLessThanOrEqual(baseline + 1e-6);
            });
        });

        it("still fits when a plan reports fewer groups than there are values, by shrinking the dots", () => {
            const { container } = render(<DistributionChart title="A" groupCount={2} stats={rangeStats([5, 5, 5, 5, 5, 5])} />);
            const baseline = baselineOf(container);
            dotsOf(container).forEach(dot => {
                expect(dot.y - dot.r).toBeGreaterThanOrEqual(TOP - 1e-6);
                expect(dot.y + dot.r).toBeLessThanOrEqual(baseline);
            });
        });

        it("is never shorter than room for one dot", () => {
            const { container } = render(<DistributionChart title="A" groupCount={0} stats={rangeStats([5])} />);
            expect(baselineOf(container)).toBe(TOP + 10 + LIFT);
        });
    });

    describe("axis", () => {
        it("numbers the axis from 0 when the minimum is small, to the maximum plus two", () => {
            render(<DistributionChart title="Group size" stats={rangeStats([2, 3])} />);
            const label = (text: string) => screen.getAllByText(text).length;
            // axis 0 to 5, one number per whole step, which also repeats the value 2 and 3 in the readouts
            expect(label("0")).toBeGreaterThanOrEqual(1);
            expect(label("5")).toBeGreaterThanOrEqual(1);
            expect(screen.queryByText("6")).toBeNull();
        });

        it("starts the axis two below the minimum when that is above 0", () => {
            render(<DistributionChart title="Group size" stats={rangeStats([6, 9])} />);
            expect(screen.getByText("4")).toBeTruthy();
            expect(screen.getByText("11")).toBeTruthy();
            expect(screen.queryByText("3")).toBeNull();
        });
    });

    describe("dots", () => {
        it("draws one dot for each group", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 4, 7, 9, 10])} />);
            expect(dotsOf(container)).toHaveLength(5);
        });

        it("puts each dot above its value, lowest value on the left", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 4, 7, 9, 10])} />);
            const xs = dotsOf(container).map(dot => dot.x);
            expect(xs).toEqual([...xs].sort((a, b) => a - b));
            // axis is 1 to 12 across 200 pixels, so the value 3 is at 2/11 of the width
            expect(xs[0]).toBeCloseTo(200 * 2 / 11, 1);
            expect(xs[4]).toBeCloseTo(200 * 9 / 11, 1);
        });

        it("sits each lone dot just above the axis", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 4, 7, 9, 10])} />);
            const baseline = baselineOf(container);
            dotsOf(container).forEach(dot => {
                expect(dot.y).toBeLessThan(baseline);
                expect(dot.y + dot.r).toBeLessThanOrEqual(baseline);
            });
            // all five are at the same height, because each value has one group
            expect(new Set(dotsOf(container).map(dot => dot.y)).size).toBe(1);
        });

        it("stacks groups that share a value, one dot on top of the other", () => {
            // three groups of 5 and one of 8
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([5, 5, 5, 8])} />);
            const dots = dotsOf(container);
            expect(dots).toHaveLength(4);
            const stack = dots.filter(dot => dot.x === dots[0].x);
            expect(stack).toHaveLength(3);
            // each is one dot width above the one below, with no gaps between
            const ys = stack.map(dot => dot.y).sort((a, b) => b - a);
            expect(ys[0] - ys[1]).toBeCloseTo(stack[0].r * 2, 5);
            expect(ys[1] - ys[2]).toBeCloseTo(stack[0].r * 2, 5);
            // and the single group is a one-dot stack at the bottom
            const alone = dots.filter(dot => dot.x !== dots[0].x);
            expect(alone).toHaveLength(1);
            expect(alone[0].y).toBeCloseTo(ys[0], 5);
        });

        it("stacks two groups into a two-dot stack", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([4, 4, 9])} />);
            const dots = dotsOf(container);
            const stack = dots.filter(dot => dot.x === dots[0].x);
            expect(stack).toHaveLength(2);
            expect(Math.abs(stack[0].y - stack[1].y)).toBeCloseTo(stack[0].r * 2, 5);
        });

        it("gives the minimum and maximum no dots of their own", () => {
            // one dot per group and nothing else: the number of dots is the number of groups
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 5, 8])} />);
            expect(dotsOf(container)).toHaveLength(3);
        });

        it("draws every dot the same size", () => {
            const { container } = render(<DistributionChart title="A" stats={rangeStats([5, 5, 7, 9])} />);
            expect(new Set(dotsOf(container).map(dot => dot.r)).size).toBe(1);
        });

        it("keeps a tall stack inside the chart", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats(Array(12).fill(5).concat([7]))} />);
            const baseline = baselineOf(container);
            dotsOf(container).forEach(dot => {
                expect(dot.y - dot.r).toBeGreaterThanOrEqual(TOP - 1e-6);
                expect(dot.y + dot.r).toBeLessThanOrEqual(baseline);
            });
        });

        it("keeps neighbors from overlapping when values are close together", () => {
            // a quarter of an hour apart on a short axis
            const { container } = render(<DistributionChart title="Group overlap" stats={rangeStats([0.25, 0.5, 4])} />);
            const dots = dotsOf(container);
            expect(dots[1].x - dots[0].x).toBeGreaterThanOrEqual(dots[0].r * 2 - 1e-6);
        });

        it("puts a group with 0 on the left end of the axis", () => {
            const { container } = render(<DistributionChart title="Group overlap" stats={rangeStats([0, 1, 3])} />);
            expect(dotsOf(container)[0].x).toBe(0);
        });

        it("stacks every group in one stack when every value is the same", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([5, 5, 5])} />);
            const dots = dotsOf(container);
            expect(dots).toHaveLength(3);
            expect(new Set(dots.map(dot => dot.x)).size).toBe(1);
            expect(dots[0].x).toBeCloseTo(100, 5);
        });

        it("outlines each dot in white so stacked dots stay apart", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([5, 5])} />);
            container.querySelectorAll("circle").forEach(dot => expect(dot.getAttribute("stroke")).toBe("#fff"));
        });

        it("draws no bars, fill, or outline", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 4, 7, 9, 10])} />);
            expect(container.querySelectorAll("path")).toHaveLength(0);
            expect(container.querySelectorAll("rect")).toHaveLength(0);
            expect(container.querySelectorAll("linearGradient")).toHaveLength(0);
        });
    });

    describe("average line", () => {
        const dashedLines = (root: HTMLElement) =>
            Array.from(root.querySelectorAll("line")).filter(line => line.getAttribute("stroke-dasharray"));

        it("is hidden by default", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 5, 8])} />);
            expect(dashedLines(container)).toHaveLength(0);
        });

        it("is a dashed vertical line from the top down to the axis when shown", () => {
            const { container } = render(<DistributionChart title="Group size" showAverage stats={rangeStats([3, 5, 8])} />);
            const lines = dashedLines(container);
            expect(lines).toHaveLength(1);
            expect(lines[0].getAttribute("x1")).toBe(lines[0].getAttribute("x2"));
            expect(Number(lines[0].getAttribute("y1"))).toBe(0);
            expect(Number(lines[0].getAttribute("y2"))).toBe(baselineOf(container));
        });

        it("is at the average, between the lowest and highest dots, when shown", () => {
            const { container } = render(<DistributionChart title="Group size" showAverage stats={rangeStats([3, 5, 8])} />);
            const xs = dotsOf(container).map(dot => dot.x);
            const average = Number(dashedLines(container)[0].getAttribute("x1"));
            expect(average).toBeGreaterThan(Math.min(...xs));
            expect(average).toBeLessThan(Math.max(...xs));
            // axis 1 to 10 across 200 pixels, average 5.33
            expect(average).toBeCloseTo(200 * (16 / 3 - 1) / 9, 1);
        });

        it("is there even when it falls between dots, when shown", () => {
            const { container } = render(<DistributionChart title="Group size" showAverage stats={rangeStats([2, 10])} />);
            expect(dashedLines(container)).toHaveLength(1);
        });

        it("is over the one stack when every value is the same and the average is shown", () => {
            const { container } = render(<DistributionChart title="Group size" showAverage stats={rangeStats([5, 5, 5])} />);
            expect(dashedLines(container)).toHaveLength(1);
            expect(Number(dashedLines(container)[0].getAttribute("x1"))).toBeCloseTo(100, 5);
        });

        it("leaves the dots where they are whether or not the average is shown", () => {
            const hidden = render(<DistributionChart title="A" stats={rangeStats([3, 3, 8])} />);
            const shown = render(<DistributionChart title="B" showAverage stats={rangeStats([3, 3, 8])} />);
            expect(dotsOf(hidden.container)).toEqual(dotsOf(shown.container));
        });
    });

    describe("color scale", () => {
        const scale = [
            { value: 0, color: "#ff0000" },
            { value: 2, color: "#ffff00" },
            { value: 4, color: "#ffff00" },
            { value: 5, color: "#00ff00" }
        ];

        it("draws every dot one color by default", () => {
            const { container } = render(<DistributionChart title="Group size" stats={rangeStats([3, 5, 8])} />);
            expect(new Set(dotsOf(container).map(dot => dot.fill)).size).toBe(1);
        });

        it("colors each dot by its value when given a scale", () => {
            const { container } = render(<DistributionChart title="Group overlap" colorStops={scale} stats={rangeStats([0, 3, 6])} />);
            expect(dotsOf(container).map(dot => dot.fill)).toEqual(["rgb(255, 0, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)"]);
        });

        it("blends between colors for values between the points of the scale", () => {
            const { container } = render(<DistributionChart title="Group overlap" colorStops={scale} stats={rangeStats([1, 4.5, 6])} />);
            // halfway from red to yellow, halfway from yellow to green, then green
            expect(dotsOf(container).map(dot => dot.fill)).toEqual(["rgb(255, 128, 0)", "rgb(128, 255, 0)", "rgb(0, 255, 0)"]);
        });

        it("gives dots in the same stack the same color", () => {
            const { container } = render(<DistributionChart title="Group overlap" colorStops={scale} stats={rangeStats([1, 1, 6])} />);
            const dots = dotsOf(container);
            expect(dots[0].fill).toBe(dots[1].fill);
            expect(dots[0].fill).not.toBe(dots[2].fill);
        });

        it("does not depend on where the axis starts", () => {
            // 6 on an axis from 4 to 8 and 6 on an axis from 0 to 8 are the same color
            const narrow = render(<DistributionChart title="A" colorStops={scale} stats={rangeStats([6, 6])} />);
            const wide = render(<DistributionChart title="B" colorStops={scale} stats={rangeStats([0, 6])} />);
            expect(dotsOf(narrow.container)[0].fill).toBe(dotsOf(wide.container)[1].fill);
        });

        it("leaves the average line the theme color", () => {
            const { container } = render(<DistributionChart title="Group overlap" colorStops={scale} showAverage stats={rangeStats([0, 3, 6])} />);
            const line = Array.from(container.querySelectorAll("line")).find(l => l.getAttribute("stroke-dasharray"))!;
            expect(line.getAttribute("stroke")).not.toMatch(/^rgb\(255/);
        });
    });
});
