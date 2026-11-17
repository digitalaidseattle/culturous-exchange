/**
 *  CohortCard.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return {
        RefreshContext: React.createContext({ refresh: 0, setRefresh: vi.fn() }),
        useNotifications: () => ({ success: vi.fn(), error: vi.fn() })
    };
});
vi.mock("react-router", () => ({ useNavigate: () => navigate }));
vi.mock("@digitalaidseattle/mui", () => ({ ConfirmationDialog: () => null }));
vi.mock("../../api/ceCohortDao", () => ({ CECohortDao: { getInstance: () => ({ delete: vi.fn() }) } }));
// the windows the card opens are tested on their own
vi.mock("../../components/NewPlanDialog", () => ({ NewPlanDialog: () => null }));
vi.mock("../../components/EditCohortNameDialog", () => ({ EditCohortNameDialog: () => null }));

import { Cohort, Enrollment, Plan, Student } from "../../api/types";
import { CohortCard } from "./CohortCard";

const enrollment = (id: string, country: string, age: number, gender: string): Enrollment =>
    ({ cohort_id: "c", student_id: id, anchor: false, student: { id, name: id, country, age, gender } as Student }) as Enrollment;

const cohortOf = (extra: Partial<Cohort> = {}) => ({
    id: "c", name: "Fall 2026", created_at: "2026-11-06T12:00:00Z",
    plans: [{ name: "Plan 1", active: true }] as Plan[],
    enrollments: [enrollment("a", "Peru", 16, "Female"), enrollment("b", "Egypt", 17, "Male"), enrollment("c", "Peru", 16, "Female")],
    ...extra
}) as unknown as Cohort;

describe("CohortCard", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("shows the cohort's name, with a Current Cohort tag for the current one", () => {
        render(<CohortCard cohort={cohortOf()} isCurrent />);
        expect(screen.getByRole("heading", { name: "Fall 2026" })).toBeTruthy();
        expect(screen.getByText("Current Cohort")).toBeTruthy();
    });

    it("has no Current Cohort tag on the others", () => {
        render(<CohortCard cohort={cohortOf()} />);
        expect(screen.queryByText("Current Cohort")).toBeNull();
    });

    it("shows the same facts as the cohort's page: students, plans, active plan and when it was made", () => {
        render(<CohortCard cohort={cohortOf()} />);
        expect(screen.getByText("Students: 3")).toBeTruthy();
        expect(screen.getByText("Plans: 1")).toBeTruthy();
        expect(screen.getByText("Active plan: Plan 1")).toBeTruthy();
        expect(screen.getByText("Created: Nov 6, 2026")).toBeTruthy();
    });

    it("shows the same charts as the cohort's page: students by country, age and gender", () => {
        render(<CohortCard cohort={cohortOf()} />);
        const charts = screen.getByRole("region", { name: "Cohort charts" });
        ["Students by country", "Students by age", "Students by gender"].forEach(title =>
            expect(within(charts).getByRole("heading", { name: title })).toBeTruthy());
        expect(within(charts).getAllByTestId("pie-chart")).toHaveLength(2);
        expect(within(charts).getAllByTestId("bar-chart")).toHaveLength(1);
    });

    it("puts the facts and the charts above the buttons", () => {
        render(<CohortCard cohort={cohortOf()} />);
        const charts = screen.getByRole("region", { name: "Cohort charts" });
        const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
        expect(after(screen.getByText("Students: 3"), charts)).toBe(true);
        expect(after(charts, screen.getByRole("button", { name: /go to students/i }))).toBe(true);
    });

    it("has no charts for a cohort with no students", () => {
        render(<CohortCard cohort={cohortOf({ enrollments: [] })} />);
        expect(screen.queryByRole("region", { name: "Cohort charts" })).toBeNull();
        expect(screen.getByText("Students: 0")).toBeTruthy();
    });

    it("still has its shortcuts into the cohort", () => {
        render(<CohortCard cohort={cohortOf()} />);
        ["Go to students", "Go to plans", "New plan", "Open Cohort"].forEach(name =>
            expect(screen.getByRole("button", { name: new RegExp(name, "i") })).toBeTruthy());
    });
});
