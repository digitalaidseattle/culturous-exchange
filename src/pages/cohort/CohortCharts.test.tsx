/**
 *  CohortCharts.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bar = vi.hoisted(() => vi.fn());
const pie = vi.hoisted(() => vi.fn());
// the charts draw with the browser's layout; stand in for them, to see what they are given
vi.mock("@mui/x-charts/BarChart", () => ({ BarChart: (props: object) => { bar(props); return <div data-testid="bar-chart" />; } }));
vi.mock("@mui/x-charts/PieChart", () => ({ PieChart: (props: object) => { pie(props); return <div data-testid="pie-chart" />; } }));

import { Cohort, Enrollment, Student } from "../../api/types";
import { CohortCharts, THREE_ACROSS_WIDTH, TWO_ACROSS_WIDTH } from "./CohortCharts";

const enrollment = (id: string, country: string, extra: Partial<Student> = {}): Enrollment =>
    ({ cohort_id: "c", student_id: id, anchor: false, student: { id, name: id, city: "City", country, ...extra } as Student }) as Enrollment;

const cohortOf = (enrollments: Enrollment[]) => ({ id: "c", name: "Fall 2026", plans: [], enrollments }) as unknown as Cohort;

const ENROLLED = [
    enrollment("a", "Peru", { age: 17, gender: "Female" }),
    enrollment("b", "Egypt", { age: 15, gender: "Male" }),
    enrollment("c", "Peru", { age: 17, gender: "Female" }),
    enrollment("d", "Egypt", { age: undefined, gender: undefined })
];

describe("CohortCharts", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("shows nothing for a cohort with no students", () => {
        const { container } = render(<CohortCharts cohort={cohortOf([])} />);
        expect(container.textContent).toBe("");
    });

    it("has a titled panel each for country, age and gender", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        const region = screen.getByRole("region", { name: "Cohort charts" });
        ["Students by country", "Students by age", "Students by gender"].forEach(title =>
            expect(within(region).getByRole("heading", { name: title })).toBeTruthy());
    });

    it("shows where the students are from as a pie chart of the countries, most students first", () => {
        render(<CohortCharts cohort={cohortOf([...ENROLLED, enrollment("e", "peru ", { age: 16, gender: "Female" })])} />);
        const country = screen.getByRole("region", { name: "Students by country" });
        expect(within(country).getAllByTestId("pie-chart")).toHaveLength(1);
        const [countries] = pie.mock.calls.map(call => call[0] as { series: { data: { label: string, value: number }[] }[] });
        // Peru is counted once however it was typed, and is spelled as first typed
        expect(countries.series[0].data.map(({ label, value }) => [label, value])).toEqual([["Peru", 3], ["Egypt", 2]]);
    });

    it("has no globe: the countries are only a pie chart", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        expect(screen.queryByRole("img", { name: /cities/ })).toBeNull();
    });

    it("draws two pie charts, one for the countries and one for gender", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        expect(pie).toHaveBeenCalledTimes(2);
        expect(screen.getAllByTestId("pie-chart")).toHaveLength(2);
    });

    it("charts the ages from youngest, each with its number of students, and leaves out students with no age", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        const props = bar.mock.calls[0][0] as { xAxis: { data: number[] }[], series: { data: number[] }[] };
        expect(props.xAxis[0].data).toEqual([15, 17]);
        expect(props.series[0].data).toEqual([1, 2]);
    });

    it("charts the genders, most first, with students who gave none as Unknown", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        const props = pie.mock.calls[1][0] as { series: { data: { label: string, value: number }[] }[] };
        expect(props.series[0].data.map(({ label, value }) => [label, value])).toEqual([["Female", 2], ["Male", 1], ["Unknown", 1]]);
    });

    it("leaves the age panel out when no student has an age", () => {
        render(<CohortCharts cohort={cohortOf([enrollment("a", "Peru"), enrollment("b", "Peru")])} />);
        expect(screen.queryByRole("heading", { name: "Students by age" })).toBeNull();
        expect(bar).not.toHaveBeenCalled();
        expect(screen.getByRole("heading", { name: "Students by gender" })).toBeTruthy();
    });

    describe("layout", () => {
        // container queries are not run by the test browser, so these check what is in the page and its styles
        const allCss = () => Array.from(document.querySelectorAll("style")).map(style => style.textContent).join("\n");
        const grid = () => screen.getByRole("region", { name: "Cohort charts" });
        const panel = (title: string) => screen.getByRole("region", { name: title });
        // jsdom writes "1 / -1" as "1/-1"
        const column = (title: string) => getComputedStyle(panel(title)).gridColumn.replace(/\s/g, "");

        it("measures the space it is in, not the screen", () => {
            render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
            expect(allCss()).toContain("container-type:inline-size");
            expect(grid().parentElement!.parentElement).not.toBeNull();
        });

        it("has the countries first, then the age and the gender, in a grid", () => {
            render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
            expect(Array.from(grid().children).map(child => child.getAttribute("data-part"))).toEqual(["country", "age", "gender"]);
            expect(getComputedStyle(grid()).display).toBe("grid");
        });

        it("has the three charts one under the next to begin with", () => {
            render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
            expect(allCss()).toMatch(/grid-template-columns:minmax\(0, 1fr\)/);
        });

        it("puts the age and the gender charts side by side, splitting the width evenly, once they have room", () => {
            render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
            expect(TWO_ACROSS_WIDTH).toBe(2 * 240 + 16);
            expect(allCss()).toMatch(new RegExp("@container \\(min-width: " + TWO_ACROSS_WIDTH + "px\\)\\{[^}]*grid-template-columns:repeat\\(2, minmax\\(0, 1fr\\)\\)"));
        });

        it("has the countries chart across the whole width until all three fit side by side", () => {
            render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
            const css = allCss();
            // the countries span every column ...
            expect(column("Students by country")).toBe("1/-1");
            // ... except at the width where all three fit
            expect(css).toMatch(new RegExp("@container \\(min-width: " + THREE_ACROSS_WIDTH + "px\\)\\{[^}]*grid-column:auto"));
            // the age and gender charts are one column each, not spanning
            expect(column("Students by age")).not.toBe("1/-1");
            expect(column("Students by gender")).not.toBe("1/-1");
        });

        it("puts all three side by side from the width that gives the countries chart room for its pie and key", () => {
            render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
            expect(THREE_ACROSS_WIDTH).toBeGreaterThan(TWO_ACROSS_WIDTH);
            // the countries get 5 of the 13 parts of what is left after the two gaps: about 360 pixels
            expect((THREE_ACROSS_WIDTH - 32) * 5 / 13).toBeGreaterThanOrEqual(355);
            expect(allCss()).toMatch(new RegExp("@container \\(min-width: " + THREE_ACROSS_WIDTH + "px\\)\\{[^}]*grid-template-columns:minmax\\(0, 5fr\\) minmax\\(0, 4fr\\) minmax\\(0, 4fr\\)"));
        });

        it("with no ages, has the countries and the gender, and the gender takes the full width below the countries", () => {
            render(<CohortCharts cohort={cohortOf([enrollment("a", "Peru"), enrollment("b", "Egypt")])} />);
            expect(Array.from(grid().children).map(child => child.getAttribute("data-part"))).toEqual(["country", "gender"]);
            expect(column("Students by gender")).toBe("1/-1");
            // side by side only from the width where the three would have fit, in two columns
            expect(allCss()).toMatch(new RegExp("@container \\(min-width: " + THREE_ACROSS_WIDTH + "px\\)\\{[^}]*grid-template-columns:minmax\\(0, 5fr\\) minmax\\(0, 4fr\\)(?! minmax)"));
        });
    });
});
