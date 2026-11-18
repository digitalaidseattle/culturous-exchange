/**
 *  CohortFacts.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cohort, Plan } from "../../api/types";
import { CohortFacts } from "./CohortFacts";

const cohortOf = (extra: Partial<Cohort> = {}) => ({
    id: "c", name: "Fall", enrollments: [{}, {}, {}], plans: [{ name: "Plan 1", active: false }, { name: "Plan 2", active: true }] as Plan[],
    created_at: "2026-11-06T12:00:00Z", ...extra
}) as unknown as Cohort;

describe("CohortFacts", () => {
    it("says how many students and plans the cohort has, its active plan, and when it was made", () => {
        render(<CohortFacts cohort={cohortOf()} />);
        expect(screen.getByText("Students: 3")).toBeTruthy();
        expect(screen.getByText("Plans: 2")).toBeTruthy();
        expect(screen.getByText("Active plan: Plan 2")).toBeTruthy();
        expect(screen.getByText(/^Created: Nov 6, 2026$/)).toBeTruthy();
    });

    it("says there is no active plan when no plan is active", () => {
        render(<CohortFacts cohort={cohortOf({ plans: [{ name: "Plan 1", active: false }] as Plan[] })} />);
        expect(screen.getByText("Active plan: None")).toBeTruthy();
    });

    it("counts none for a cohort with no students or plans, and leaves out a date it does not have", () => {
        render(<CohortFacts cohort={cohortOf({ enrollments: undefined, plans: undefined, created_at: undefined })} />);
        expect(screen.getByText("Students: 0")).toBeTruthy();
        expect(screen.getByText("Plans: 0")).toBeTruthy();
        expect(screen.queryByText(/^Created/)).toBeNull();
    });
});
