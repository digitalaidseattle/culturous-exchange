/**
 *  PlanSummary.test.tsx
 *
 *  Container queries are not run by the test browser, so these check what is in the page: the pieces
 *  and their order, what the charts are given, the container, and the rule that moves the totals
 *  beside the charts.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanStats } from "../services/plan/planStats";
import { SIDE_BY_SIDE_WIDTH } from "./PlanCharts";
import { PlanSummary } from "./PlanSummary";
import { CHART_MIN_WIDTH, TOTALS_BESIDE_WIDTH, TOTALS_COLUMN_WIDTH } from "./PlanTotals";

const stats = {
    groupCount: 3,
    studentCount: 20,
    waitlistedCount: 4,
    countries: [],
    groupSize: null,
    countriesPerGroup: null,
    groupOverlap: null,
    perGroup: [
        { name: "Group 1", students: 7, countries: 3, hours: 4 },
        { name: "Group 2", students: 6, countries: 2, hours: 2.5 },
        { name: "Group 3", students: 7, countries: 4, hours: 6 }
    ]
} as PlanStats;

const allCss = () => Array.from(document.querySelectorAll("style")).map(style => style.textContent).join("\n");
const chartProps = () => screen.getAllByTestId("bar-chart").map(chart => JSON.parse(chart.dataset.props!));

describe("PlanSummary", () => {
    it("shows the three totals and the two bar charts", () => {
        render(<PlanSummary stats={stats} />);
        expect(screen.getByText("Groups").previousElementSibling!.textContent).toBe("3");
        expect(screen.getByText("Students").previousElementSibling!.textContent).toBe("20");
        expect(screen.getByText("Waitlisted students").previousElementSibling!.textContent).toBe("4");
        expect(screen.getAllByRole("heading", { level: 4 }).map(heading => heading.textContent))
            .toEqual(["Time Overlap per Group (hrs)", "Students & Countries per Group"]);
        expect(screen.getAllByTestId("bar-chart")).toHaveLength(2);
    });

    it("draws a bar for each group, named by the group, of its hours of shared time", () => {
        render(<PlanSummary stats={stats} />);
        const overlap = chartProps()[0];
        expect(overlap.xAxis[0].data).toEqual(["Group 1", "Group 2", "Group 3"]);
        expect(overlap.series).toEqual([{ data: [4, 2.5, 6], label: "hours" }]);
        // one measure needs no key
        expect(overlap.hideLegend).toBe(true);
    });

    it("draws the students and the countries of each group side by side, with a key", () => {
        render(<PlanSummary stats={stats} />);
        const both = chartProps()[1];
        expect(both.xAxis[0].data).toEqual(["Group 1", "Group 2", "Group 3"]);
        expect(both.series).toEqual([
            { data: [7, 6, 7], label: "Students" },
            { data: [3, 2, 4], label: "Countries" }
        ]);
        expect(both.hideLegend).toBe(false);
    });

    it("rounds the bars, and keeps the charts short", () => {
        render(<PlanSummary stats={stats} />);
        chartProps().forEach(chart => expect(chart.borderRadius).toBe(4));
        // the chart with a key is 130 tall under it; the one without fills its box, which is no less than 130
        const [overlap, both] = chartProps();
        expect(both.height).toBe(130);
        expect(overlap.height).toBeUndefined();
        const box = screen.getAllByTestId("bar-chart")[0].closest('[data-part="fill"]') as HTMLElement;
        expect(getComputedStyle(box).minHeight).toBe("130px");
    });

    it("lets the chart with no key fill the height left in its section, so two charts side by side end at one baseline", () => {
        render(<PlanSummary stats={stats} />);
        const [overlap, both] = Array.from(document.querySelectorAll("section"));
        // both sections are a column, and the first one's box takes the height left under its title
        expect(getComputedStyle(overlap).display).toBe("flex");
        expect(getComputedStyle(overlap).flexDirection).toBe("column");
        const box = overlap.querySelector('[data-part="fill"]') as HTMLElement;
        expect(getComputedStyle(box).flexGrow).toBe("1");
        // the chart sits inside it without adding to its height
        expect((box.firstElementChild as HTMLElement).style.position || getComputedStyle(box.firstElementChild as HTMLElement).position).toBe("absolute");
        // the second has no such box: it keeps its own 130, under its key
        expect(both.querySelector('[data-part="fill"]')).toBeNull();
        // the grid stretches both to the same height
        expect(allCss()).not.toMatch(/align-items:start/);
    });

    it("sits the chart with a key at the bottom of its room, so its baseline is the same as the other's", () => {
        render(<PlanSummary stats={stats} />);
        const [overlap, both] = chartProps();
        expect(both.sx).toEqual({ alignItems: "end" });
        expect(overlap.sx).toBeUndefined();
    });

    it("runs each vertical axis from 0 to a labeled round number at or above its tallest bar", () => {
        render(<PlanSummary stats={stats} />);
        const [overlap, both] = chartProps();
        // the tallest bar is 6 hours, and 7 students
        expect(overlap.yAxis[0]).toMatchObject({ min: 0, max: 6, tickInterval: [0, 2, 4, 6] });
        expect(both.yAxis[0]).toMatchObject({ min: 0, max: 8, tickInterval: [0, 2, 4, 6, 8] });
    });

    it("puts the charts one above the other to begin with, in the order hours and then students and countries", () => {
        render(<PlanSummary stats={stats} />);
        const [first, second] = Array.from(document.querySelectorAll("section"));
        expect(first.getAttribute("aria-label")).toBe("Time Overlap per Group (hrs)");
        expect(second.getAttribute("aria-label")).toBe("Students & Countries per Group");
        expect(Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        // they share one column of a grid, not a row
        const grid = first.parentElement!;
        expect(second.parentElement).toBe(grid);
        expect(getComputedStyle(grid).display).toBe("grid");
        expect(getComputedStyle(grid).gridTemplateColumns).toBe("minmax(0, 1fr)");
    });

    it("puts them side by side, sharing the width evenly, from 960 pixels of the space they are in", () => {
        render(<PlanSummary stats={stats} />);
        expect(SIDE_BY_SIDE_WIDTH).toBe(960);
        expect(allCss()).toMatch(new RegExp("@container \\(min-width: " + SIDE_BY_SIDE_WIDTH + "px\\)\\{[^}]*grid-template-columns:repeat\\(2, minmax\\(0, 1fr\\)\\)"));
    });

    it("stays stacked in the New Plan window, which is narrower than that", () => {
        // 900 wide with 24 pixels of padding each side
        expect(900 - 48).toBeLessThan(SIDE_BY_SIDE_WIDTH);
    });

    it("says there are no groups yet, and draws no chart, for a plan with none", () => {
        render(<PlanSummary stats={{ ...stats, groupCount: 0, perGroup: [] }} />);
        expect(screen.getByText("No groups yet")).toBeTruthy();
        expect(screen.queryAllByTestId("bar-chart")).toHaveLength(0);
        // the totals are still there
        expect(within(document.body).getByText("Waitlisted students")).toBeTruthy();
    });

    it("puts the totals before the charts, so they are above them when narrow and to the left when wide", () => {
        render(<PlanSummary stats={stats} />);
        const totals = screen.getByText("Groups");
        const firstChart = screen.getAllByTestId("bar-chart")[0];
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

    it("moves the totals beside the charts once the space has room for the column, a gap and a chart", () => {
        expect(TOTALS_BESIDE_WIDTH).toBe(TOTALS_COLUMN_WIDTH + 16 + CHART_MIN_WIDTH);
        // the New Plan window is 900 wide with 24 pixels of padding each side, and should have room
        expect(TOTALS_BESIDE_WIDTH).toBeLessThanOrEqual(900 - 48);
    });

    it("is one column to begin with, and puts a column of totals beside the charts from that width", () => {
        render(<PlanSummary stats={stats} />);
        const css = allCss();
        expect(css).toMatch(/grid-template-columns:minmax\(0, 1fr\)/);
        const beside = "@container \\(min-width: " + TOTALS_BESIDE_WIDTH + "px\\)";
        expect(css).toMatch(new RegExp(beside + "\\{[^}]*grid-template-columns:minmax\\(190px, 210px\\) minmax\\(0, 1fr\\)"));
        // a column of totals, with lines across between them, each label to the right of its number
        expect(css).toMatch(new RegExp(beside + "\\{[^}]*flex-direction:column"));
        expect(css).toMatch(new RegExp(beside + "\\{[^}]*border-top:1px solid"));
        expect(css).toMatch(new RegExp(beside + "\\{[^}]*flex-direction:row[^}]*align-items:center[^}]*justify-content:center"));
        expect(css).toMatch(new RegExp(beside + "\\{[^}]*width:min-content"));
    });

    it("keeps each label under its number when the totals are a row", () => {
        render(<PlanSummary stats={stats} />);
        // nothing outside the container query wraps a label or makes a total a row
        const outsideQueries = allCss().replace(/@container[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, "");
        expect(outsideQueries).not.toMatch(/width:min-content/);
        expect(outsideQueries).not.toMatch(/min-width:2ch/);
    });

    it("has the totals and the charts as the two things in the grid, the totals first", () => {
        const { container } = render(<PlanSummary stats={stats} />);
        const grid = container.firstElementChild!.firstElementChild as HTMLElement;
        expect(grid.children).toHaveLength(2);
        expect(grid.children[0].textContent).toContain("Groups");
        expect(grid.children[1].querySelectorAll("section")).toHaveLength(2);
    });
});
