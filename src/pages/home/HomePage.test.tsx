/**
 *  HomePage.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAll = vi.hoisted(() => vi.fn());
vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return { RefreshContext: React.createContext({ refresh: 0, setRefresh: vi.fn() }) };
});
vi.mock("../../api/ceCohortDao", () => ({ CECohortDao: { getInstance: () => ({ getAll }) } }));
// the rest of the page is tested on its own; stand in for it, showing which cohorts are given a card and as current
vi.mock("./WelcomeBanner", () => ({ WelcomeBanner: () => null }));
vi.mock("./GetStartedCard", () => ({ GetStartedCard: () => null }));
vi.mock("./HomeActions", () => ({ HomeActions: () => null }));
vi.mock("../../components/CreateCohortDialog", () => ({ CreateCohortDialog: () => null }));
vi.mock("./CohortCard", () => ({
    CohortCard: (props: { cohort: { name: string }, isCurrent?: boolean }) =>
        <div data-testid="cohort-card" data-current={props.isCurrent ? "yes" : "no"}>{props.cohort.name}</div>
}));

import { Cohort } from "../../api/types";
import HomePage from "./index";

const cohort = (name: string, created_at: string) => ({ id: name, name, created_at, plans: [], enrollments: [] }) as unknown as Cohort;

// the stack holding the heading and the cards below it; All Other Cohorts has its heading in a row with the New Cohort button
const currentSection = () => screen.getByRole("heading", { name: "Current Cohort" }).parentElement!;
const othersSection = () => screen.getByRole("heading", { name: "All Other Cohorts" }).parentElement!.parentElement!;

describe("HomePage", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("shows the newest cohort as the current one, and lists the others under All Other Cohorts, newest first", async () => {
        getAll.mockResolvedValue([cohort("Spring", "2026-03-01"), cohort("Winter", "2026-01-01"), cohort("Fall", "2026-09-01")]);
        render(<HomePage />);
        await screen.findByText("Fall");
        const current = within(currentSection()).getAllByTestId("cohort-card");
        expect(current.map(card => [card.textContent, card.dataset.current])).toEqual([["Fall", "yes"]]);
        const others = within(othersSection()).getAllByTestId("cohort-card");
        expect(others.map(card => [card.textContent, card.dataset.current])).toEqual([["Spring", "no"], ["Winter", "no"]]);
    });

    it("does not list the current cohort a second time", async () => {
        getAll.mockResolvedValue([cohort("Spring", "2026-03-01"), cohort("Fall", "2026-09-01")]);
        render(<HomePage />);
        await screen.findAllByText("Fall");
        expect(screen.getAllByText("Fall")).toHaveLength(1);
        expect(screen.queryByRole("heading", { name: "All Cohorts" })).toBeNull();
    });

    it("says there are no other cohorts when the current one is the only one, and keeps the New Cohort button", async () => {
        getAll.mockResolvedValue([cohort("Fall", "2026-09-01")]);
        render(<HomePage />);
        await screen.findByText("Fall");
        expect(screen.getByText("No other cohorts yet.")).toBeTruthy();
        expect(screen.getByRole("button", { name: /new cohort/i })).toBeTruthy();
    });

    it("has no Current Cohort section, and no other cohorts, when there are no cohorts", async () => {
        getAll.mockResolvedValue([]);
        render(<HomePage />);
        await waitFor(() => expect(getAll).toHaveBeenCalled());
        expect(screen.queryByRole("heading", { name: "Current Cohort" })).toBeNull();
        expect(screen.getByText("No other cohorts yet.")).toBeTruthy();
    });
});
