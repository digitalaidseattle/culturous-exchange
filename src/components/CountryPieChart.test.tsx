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
import { CountryPieChart, LEGEND_MAX_WIDTH } from "./CountryPieChart";

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

    it("puts the legend beside the pie, in a column after a column the width of the pie", () => {
        render(<CountryPieChart students={from("Peru")} height={200} />);
        expect(pie().sx.gridTemplateAreas).toBe('"chart legend"');
        expect(pie().sx.gridTemplateColumns).toBe("200px minmax(0, auto)");
    });

    it("keeps the legend to what is left beside the pie, and no wider than it needs to be", () => {
        render(<CountryPieChart students={from("Peru")} height={200} />);
        const maxWidth = String(pie().slotProps.legend.sx.maxWidth);
        expect(maxWidth).toContain(`${LEGEND_MAX_WIDTH}px`);
        // the space beside the pie: the width of the chart, less the pie and the gap
        expect(maxWidth).toContain("100cqw - 216px");
    });

    it("hugs its contents: it is no wider than the pie and the widest legend, and measures its own space", () => {
        const { container } = render(<CountryPieChart students={from("Peru")} height={200} />);
        const box = container.firstElementChild as HTMLElement;
        expect(getComputedStyle(box).maxWidth).toBe(`${200 + 16 + LEGEND_MAX_WIDTH}px`);
        expect(Array.from(document.querySelectorAll("style")).map(style => style.textContent).join("\n")).toContain("container-type:inline-size");
    });
});
