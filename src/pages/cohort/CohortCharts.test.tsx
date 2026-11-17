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
// cities are looked up over the network; nothing is placed here
vi.mock("../../services/geo/usePlaceCoordinates", () => ({
    usePlaceCoordinates: () => ({ coordinates: new Map(), missing: 0, loading: false })
}));

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

    it("shows where the students are from on the globe, with a key of the countries and how many", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        expect(screen.getByRole("img", { name: /^Fall 2026 cities/ })).toBeTruthy();
        const countries = within(screen.getByRole("list", { name: "Fall 2026 countries" })).getAllByRole("listitem").map(li => li.textContent);
        expect(countries).toEqual(["Peru 2", "Egypt 2"]);
    });

    it("draws no pie chart of countries: the globe is where that is shown", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        // one pie, for gender
        expect(pie).toHaveBeenCalledTimes(1);
        expect(screen.getAllByTestId("pie-chart")).toHaveLength(1);
    });

    it("charts the ages from youngest, each with its number of students, and leaves out students with no age", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        const props = bar.mock.calls[0][0] as { xAxis: { data: number[] }[], series: { data: number[] }[] };
        expect(props.xAxis[0].data).toEqual([15, 17]);
        expect(props.series[0].data).toEqual([1, 2]);
    });

    it("charts the genders, most first, with students who gave none as Unknown", () => {
        render(<CohortCharts cohort={cohortOf(ENROLLED)} />);
        const props = pie.mock.calls[0][0] as { series: { data: { label: string, value: number }[] }[] };
        expect(props.series[0].data.map(({ label, value }) => [label, value])).toEqual([["Female", 2], ["Male", 1], ["Unknown", 1]]);
    });

    it("leaves the age panel out when no student has an age", () => {
        render(<CohortCharts cohort={cohortOf([enrollment("a", "Peru"), enrollment("b", "Peru")])} />);
        expect(screen.queryByRole("heading", { name: "Students by age" })).toBeNull();
        expect(bar).not.toHaveBeenCalled();
        expect(screen.getByRole("heading", { name: "Students by gender" })).toBeTruthy();
    });
});
