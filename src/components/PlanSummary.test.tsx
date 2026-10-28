/**
 *  PlanSummary.test.tsx
 *
 *  Container queries are not run by the test browser, so these check what is in the page:
 *  the pieces and their order, the container, and the rule that moves the totals beside the charts.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanStats } from "../services/plan/planStats";
import { PlanSummary } from "./PlanSummary";
import { TWO_CHARTS_WIDTH, THREE_CHARTS_WIDTH, TOTALS_BESIDE_WIDTH } from "./PlanTotals";

const range = (values: number[]) => ({ min: Math.min(...values), max: Math.max(...values), average: 0, values });
const stats = {
    groupCount: 3,
    studentCount: 20,
    waitlistedCount: 4,
    countries: [],
    groupSize: range([5, 6, 7]),
    countriesPerGroup: range([2, 3, 4]),
    groupOverlap: range([1, 2, 3])
} as PlanStats;

const allCss = () => Array.from(document.querySelectorAll("style")).map(style => style.textContent).join("\n");

describe("PlanSummary", () => {
    it("shows the three totals and the three charts", () => {
        render(<PlanSummary stats={stats} />);
        expect(screen.getByText("Groups").previousElementSibling!.textContent).toBe("3");
        expect(screen.getByText("Students").previousElementSibling!.textContent).toBe("20");
        expect(screen.getByText("Waitlisted students").previousElementSibling!.textContent).toBe("4");
        const charts = screen.getAllByRole("img").map(chart => chart.getAttribute("aria-label")!);
        expect(charts.map(label => label.split(":")[0])).toEqual(["Group size", "Countries per group", "Time overlap per group"]);
    });

    it("puts the totals before the charts, so they are above them when narrow and to the left when wide", () => {
        render(<PlanSummary stats={stats} />);
        const totals = screen.getByText("Groups");
        const firstChart = screen.getAllByRole("img")[0];
        expect(Boolean(totals.compareDocumentPosition(firstChart) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    });

    it("keeps a line between each pair of totals", () => {
        render(<PlanSummary stats={stats} />);
        expect(screen.getAllByRole("separator")).toHaveLength(2);
    });

    it("measures the space it is in, not the screen", () => {
        render(<PlanSummary stats={stats} />);
        expect(allCss()).toContain("container-type:inline-size");
    });

    it("switches layout at three widths of its own space: room for two charts, for three, and for the totals beside them", () => {
        // two charts at their narrowest (200 pixels) and a gap of 16
        expect(TWO_CHARTS_WIDTH).toBe(2 * 200 + 16);
        // three charts at their narrowest (200 pixels) and two gaps of 16
        expect(THREE_CHARTS_WIDTH).toBe(3 * 200 + 2 * 16);
        // and a column of at least 190 pixels beside them, with a gap
        expect(TOTALS_BESIDE_WIDTH).toBe(3 * 200 + 2 * 16 + 16 + 192);
        expect(TWO_CHARTS_WIDTH).toBeLessThan(THREE_CHARTS_WIDTH);
        expect(THREE_CHARTS_WIDTH).toBeLessThan(TOTALS_BESIDE_WIDTH);
        // the New Plan window is 900 wide with 24 pixels of padding each side, and should have room
        expect(TOTALS_BESIDE_WIDTH).toBeLessThanOrEqual(900 - 48);
    });

    // the band where two charts fit side by side but three do not
    const BAND = "@container \\(min-width: 416px\\) and \\(max-width: 631\\.98px\\)";
    const BESIDE = "@container \\(min-width: 840px\\)";

    it("stacks the totals in a column in a 2 by 2 grid with the charts, while two charts fit but three do not", () => {
        render(<PlanSummary stats={stats} />);
        const css = allCss();
        // the grid has two equal columns from 416 pixels
        expect(css).toMatch(/@container \(min-width: 416px\)\{[^}]*grid-template-columns:repeat\(2, minmax\(0, 1fr\)\)/);
        // in the band the totals are one cell of the grid, a column, with lines across between them
        expect(css).toMatch(new RegExp(BAND + "\\{[^}]*grid-column:auto"));
        expect(css).toMatch(new RegExp(BAND + "\\{[^}]*flex-direction:column"));
        expect(css).toMatch(new RegExp(BAND + "\\{[^}]*border-top:1px solid"));
    });

    it("puts the three charts in a row, with the totals in a row across the top, once all three fit", () => {
        render(<PlanSummary stats={stats} />);
        const css = allCss();
        expect(css).toMatch(/@container \(min-width: 632px\)\{[^}]*grid-template-columns:repeat\(3, minmax\(0, 1fr\)\)/);
        // nothing at that width turns the totals into a column or a cell
        expect(css).not.toMatch(/@container \(min-width: 632px\)\{[^}]*(flex-direction:column|grid-column:auto)/);
        // the totals run across the whole grid except in the band and the widest case
        expect(css).toMatch(/grid-column:1 ?\/ ?-1/);
    });

    it("moves the totals to the left of the three charts on the widest spaces", () => {
        render(<PlanSummary stats={stats} />);
        const css = allCss();
        expect(css).toMatch(new RegExp(BESIDE + "\\{[^}]*grid-template-columns:minmax\\(190px, 210px\\) repeat\\(3, minmax\\(0, 1fr\\)\\)"));
        expect(css).toMatch(new RegExp(BESIDE + "\\{[^}]*grid-column:auto"));
        // a column of totals, with lines across between them
        expect(css).toMatch(new RegExp(BESIDE + "\\{[^}]*flex-direction:column"));
        expect(css).toMatch(new RegExp(BESIDE + "\\{[^}]*border-top:1px solid"));
    });

    // both places where the totals are a column in the grid with the charts: the 2 by 2 grid, and beside the charts
    for (const [name, query] of [["in the 2 by 2 grid", BAND], ["beside the charts", BESIDE]]) {
        it(`puts each label to the right of its number, wrapped, and centers the pair ${name}`, () => {
            render(<PlanSummary stats={stats} />);
            const css = allCss();
            // each total is a row, with the label after the number, centered on it, and the pair centered in the panel
            expect(css).toMatch(new RegExp(query + "\\{[^}]*flex-direction:row[^}]*align-items:center[^}]*justify-content:center"));
            // numbers are right aligned so the labels line up, and labels are left aligned next to them
            expect(css).toMatch(new RegExp(query + "\\{[^}]*min-width:2ch[^}]*text-align:right"));
            expect(css).toMatch(new RegExp(query + "\\{[^}]*text-align:left"));
            // a label wraps at its spaces, so "Waitlisted students" is on two lines
            expect(css).toMatch(new RegExp(query + "\\{[^}]*width:min-content"));
            // each total runs the full width of the panel, so it can center its pair
            expect(css).toMatch(new RegExp(query + "\\{[^}]*flex-direction:column[^}]*align-items:stretch"));
        });
    }

    it("keeps each label under its number when the totals are a row", () => {
        render(<PlanSummary stats={stats} />);
        const css = allCss();
        // nothing outside the two column cases makes a total a row, or wraps its label
        const outsideQueries = css.replace(/@container[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, "");
        expect(outsideQueries).not.toMatch(/width:min-content/);
        expect(outsideQueries).not.toMatch(/min-width:2ch/);
        // and none of the in between sizes (three charts, no room beside them) change them
        expect(css).not.toMatch(/@container \(min-width: 632px\)\{[^}]*(flex-direction:row|min-content)/);
    });

    it("stacks the totals and the charts in one column when two charts do not fit side by side", () => {
        render(<PlanSummary stats={stats} />);
        const css = allCss();
        // one column to begin with, the totals across it, and two or three columns only from the widths above
        expect(css).toMatch(/grid-template-columns:minmax\(0, 1fr\)/);
        expect(css).not.toMatch(/auto-fit/);
        // the totals are a row there: nothing outside a container query makes them a column
        const outsideQueries = css.replace(/@container[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, "");
        expect(outsideQueries).not.toMatch(/flex-direction:column;[^}]*justify-content:space-around/);
    });

    it("has the totals and the three charts as the four things in the grid, the totals first", () => {
        const { container } = render(<PlanSummary stats={stats} />);
        const grid = container.firstElementChild!.firstElementChild as HTMLElement;
        expect(grid.children).toHaveLength(4);
        expect(grid.children[0].textContent).toContain("Groups");
        expect(Array.from(grid.children).slice(1).map(child => child.getAttribute("aria-label")!.split(":")[0]))
            .toEqual(["Group size", "Countries per group", "Time overlap per group"]);
    });
});
