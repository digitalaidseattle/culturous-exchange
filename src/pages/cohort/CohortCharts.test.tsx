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
import { CohortCharts } from "./CohortCharts";

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
});
