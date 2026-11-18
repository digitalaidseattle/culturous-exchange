/**
 *  CountryPieChart.test.tsx
 *
 *  The chart's layout is the browser's, so these check what the chart is given: its data and the layout it is asked for.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Student } from "../api/types";
import { CountryPieChart, PIE_WIDTH_SHARE, SMALLEST_PIE } from "./CountryPieChart";

type PieProps = {
    height: number, hideLegend?: boolean,
    sx: Record<string, string>,
    series: { data: { label: string, value: number }[] }[],
    slotProps: { legend: { direction: string, sx: Record<string, string | number> } }
};
const from = (...countries: (string | undefined)[]) => countries.map((country, i) => ({ id: String(i), name: `s${i}`, country }) as Student);
const pie = () => JSON.parse(screen.getByTestId("pie-chart").dataset.props!) as PieProps;

describe("CountryPieChart", () => {
    it("draws a slice for each country, with how many students are from it", () => {
        render(<CountryPieChart students={from("Peru", "Egypt", "Egypt", "peru ", "Kenya")} />);
        expect(pie().series[0].data.map(({ label, value }) => [label, value])).toEqual([["Peru", 2], ["Egypt", 2], ["Kenya", 1]]);
    });

    it("draws nothing for no students", () => {
        const { container } = render(<CountryPieChart students={[]} />);
        expect(container.textContent).toBe("");
        expect(screen.queryByTestId("pie-chart")).toBeNull();
    });

    it("uses the chart's own legend", () => {
        render(<CountryPieChart students={from("Peru")} />);
        expect(pie().hideLegend).toBeUndefined();
    });

    it("lets the countries of the legend flow across in rows that wrap onto new rows, not one tall column", () => {
        render(<CountryPieChart students={from("Peru", "Egypt")} />);
        expect(pie().slotProps.legend.direction).toBe("horizontal");
        expect(pie().slotProps.legend.sx.flexWrap).toBe("wrap");
    });

    const PIE_WIDTH = `clamp(110px, ${PIE_WIDTH_SHARE}cqw, 200px)`;

    it("puts the legend beside the pie, taking all the width after the pie's column", () => {
        render(<CountryPieChart students={from("Peru")} height={200} />);
        expect(pie().sx.gridTemplateAreas).toBe('"chart legend"');
        expect(pie().sx.gridTemplateColumns).toBe(`${PIE_WIDTH} minmax(0, 1fr)`);
    });

    it("lets the pie shrink with the space it is in: a share of the chart's width, from its full size down to a little over half", () => {
        render(<CountryPieChart students={from("Peru")} height={200} />);
        const columns = pie().sx.gridTemplateColumns;
        // not a fixed width: it is bounded below and above, and follows the chart's width in between
        expect(columns).toMatch(/^clamp\(110px, \d+cqw, 200px\) /);
        expect(SMALLEST_PIE).toBeGreaterThan(0.5);
        expect(SMALLEST_PIE).toBeLessThan(1);
    });

    it("shrinks a smaller pie in proportion", () => {
        render(<CountryPieChart students={from("Peru")} height={132} />);
        expect(pie().sx.gridTemplateColumns).toMatch(/^clamp\(73px, \d+cqw, 132px\) /);
    });

    it("lets the legend grow to all of the space beside the pie, the width of the chart less the pie and the gap", () => {
        render(<CountryPieChart students={from("Peru")} height={200} />);
        expect(String(pie().slotProps.legend.sx.maxWidth)).toBe(`calc(100cqw - ${PIE_WIDTH} - 16px)`);
    });

    it("is not capped in width: it fills the space it is given, and measures that space", () => {
        const { container } = render(<CountryPieChart students={from("Peru")} height={200} />);
        const box = container.firstElementChild as HTMLElement;
        expect(getComputedStyle(box).maxWidth).not.toMatch(/px/);
        expect(Array.from(document.querySelectorAll("style")).map(style => style.textContent).join("\n")).toContain("container-type:inline-size");
    });
});
