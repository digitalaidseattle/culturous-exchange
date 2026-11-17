/**
 *  GroupsView.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warn: vi.fn() }));
const setRefresh = vi.hoisted(() => vi.fn());
const run = vi.hoisted(() => vi.fn());
const save = vi.hoisted(() => vi.fn());
const updatePlacement = vi.hoisted(() => vi.fn());

vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return {
        RefreshContext: React.createContext({ refresh: 0, setRefresh }),
        useNotifications: () => notifications
    };
});
vi.mock("../../services/plan/studentMover", () => ({ studentMover: { run } }));
vi.mock("../../services/plan/cePlanService", () => ({ CEPlanService: { getInstance: () => ({ save }) } }));
vi.mock("../../services/cePlacementService", () => ({ CEPlacementService: { getInstance: () => ({ updatePlacement }) } }));
// the facilitator menu reads facilitators from the database; stand in for it
vi.mock("./FacilitatorMenu", () => ({ FacilitatorMenu: () => null }));

import { Group, Placement, Plan, Student, TimeWindow } from "../../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../../services/time/ceTimeWindowService";
import { GroupsView } from "./GroupsView";
import { PlanContext } from "./PlanContext";

const service = CETimeWindowService.getInstance();
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({
    start_date_time: service.localTimeToUTC(day, `${from}:00`, DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, `${to}:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;

const student = (id: string, name: string, city: string, country: string, windows: TimeWindow[] = [pt(0, "09:00", "15:00")]) =>
    ({ id, name, city, country, age: 16, gender: "Female", email: `${id}@example.com`, time_zone: "UTC", tz_offset: 0, timeWindows: windows }) as Student;
const placement = (s: Student, groupId: string | null, anchor = false): Placement =>
    ({ plan_id: "plan", student_id: s.id, group_id: groupId, anchor, priority: 0, student: s }) as Placement;

const makePlan = (): Plan => ({
    id: "plan",
    name: "Plan 1",
    groups: [
        { id: "g10", name: "Group 10", time_windows: [pt(0, "09:00", "15:00")] },
        { id: "g2", name: "Group 2", time_windows: [pt(0, "09:00", "15:00")] }
    ] as Group[],
    placements: [
        placement(student("a", "Ana Ruiz", "Lima", "Peru"), "g2", true),
        placement(student("b", "Ben Said", "Cairo", "Egypt"), "g10"),
        placement(student("w", "Wendy Wu", "Wuhan", "China"), null)
    ]
}) as unknown as Plan;

const renderView = (plan: Plan = makePlan()) => {
    const setPlan = vi.fn();
    render(
        <PlanContext.Provider value={{ plan, setPlan }}>
            <GroupsView />
        </PlanContext.Provider>);
    return { plan, setPlan };
};
const group = (name: string) => screen.getByRole("article", { name });
const menuFor = (name: string) => fireEvent.click(screen.getByRole("button", { name: `More actions for ${name}` }));
const choose = (item: string) => fireEvent.click(screen.getByRole("menuitem", { name: item }));

describe("GroupsView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        run.mockImplementation(async (plan: Plan) => plan);
        save.mockImplementation(async (plan: Plan) => ({ ...plan, saved: true }));
        updatePlacement.mockResolvedValue(undefined);
    });
    it("has a card for each group, one under the next, in numeric order", () => {
        renderView();
        const names = screen.getAllByRole("article").map(card => card.getAttribute("aria-label"));
        expect(names).toEqual(["Group 2", "Group 10"]);
    });

    it("puts each student in their group's card, and the waitlisted ones in the side panel", () => {
        renderView();
        expect(within(group("Group 2")).getByText("Ana Ruiz")).toBeTruthy();
        expect(within(group("Group 10")).getByText("Ben Said")).toBeTruthy();
        expect(within(group("Group 2")).queryByText("Wendy Wu")).toBeNull();
        const panel = screen.getByRole("complementary", { name: "Waitlisted" });
        expect(within(panel).getByText("Wendy Wu")).toBeTruthy();
        expect(within(panel).queryByText("Ana Ruiz")).toBeNull();
    });

    it("says so when the plan has no groups", () => {
        renderView({ ...makePlan(), groups: [], placements: [] } as unknown as Plan);
        expect(screen.getByText("This plan has no groups.")).toBeTruthy();
        expect(screen.getByText("No one is on the waitlist.")).toBeTruthy();
    });

    describe("See details", () => {
        it("opens the student's details, with their group", () => {
            renderView();
            menuFor("Ben Said");
            choose("See details");
            const dialog = screen.getByRole("dialog", { name: "Student details" });
            expect(within(dialog).getByText("Ben Said")).toBeTruthy();
            expect(within(within(dialog).getByRole("region", { name: "In this plan" })).getByText("Group 10")).toBeTruthy();
        });

        it("says Waitlisted for a student who is on the waitlist", () => {
            renderView();
            menuFor("Wendy Wu");
            choose("See details");
            expect(within(within(screen.getByRole("dialog")).getByRole("region", { name: "In this plan" })).getByText("Waitlisted")).toBeTruthy();
        });

        it("closes", async () => {
            renderView();
            menuFor("Ben Said");
            choose("See details");
            fireEvent.click(screen.getByRole("button", { name: "Close" }));
            await waitFor(() => expect(screen.queryByRole("dialog", { name: "Student details" })).toBeNull());
        });
    });

    describe("Change group", () => {
        const openFor = (name: string) => { menuFor(name); choose("Change group"); };
        const moveTo = (label: string) => {
            fireEvent.click(screen.getByRole("radio", { name: label }));
            fireEvent.click(screen.getByRole("button", { name: `Move to ${label}` }));
        };

        it("opens with the student's card and the plan's groups", () => {
            renderView();
            openFor("Ana Ruiz");
            const dialog = screen.getByRole("dialog", { name: "Change group" });
            expect(within(dialog).getByText("Ana Ruiz")).toBeTruthy();
            expect(within(dialog).getAllByRole("radio").map(radio => radio.getAttribute("aria-label"))).toEqual(["Group 2", "Group 10", "Waitlisted"]);
        });

        it("moves the student, saves the plan, shows the saved plan, and tells the user", async () => {
            const { plan, setPlan } = renderView();
            openFor("Ana Ruiz");
            moveTo("Group 10");

            await waitFor(() => expect(setPlan).toHaveBeenCalled());
            expect(run).toHaveBeenCalledWith(plan, "a", "g10");
            expect(save).toHaveBeenCalledTimes(1);
            expect(setPlan.mock.calls[0][0]).toMatchObject({ saved: true });
            expect(notifications.success).toHaveBeenCalledWith("Ana Ruiz moved to Group 10.");
            await waitFor(() => expect(screen.queryByRole("dialog", { name: "Change group" })).toBeNull());
        });

        it("moves a student to the waitlist", async () => {
            const { plan } = renderView();
            openFor("Ana Ruiz");
            fireEvent.click(screen.getByRole("radio", { name: "Waitlisted" }));
            fireEvent.click(screen.getByRole("button", { name: "Move to waitlist" }));
            await waitFor(() => expect(run).toHaveBeenCalledWith(plan, "a", "WAITLIST"));
            expect(notifications.success).toHaveBeenCalledWith("Ana Ruiz moved to the waitlist.");
        });

        it("moves a waitlisted student into a group", async () => {
            const { plan } = renderView();
            openFor("Wendy Wu");
            moveTo("Group 2");
            await waitFor(() => expect(run).toHaveBeenCalledWith(plan, "w", "g2"));
        });

        it("says so, and keeps the window open, when the move fails", async () => {
            run.mockRejectedValue(new Error("no placement"));
            const { setPlan } = renderView();
            openFor("Ana Ruiz");
            moveTo("Group 10");

            await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Could not move the student. no placement"));
            expect(setPlan).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();
            expect(screen.getByRole("dialog", { name: "Change group" })).toBeTruthy();
        });

        it("says so when saving the plan fails", async () => {
            save.mockRejectedValue(new Error("database is down"));
            const { setPlan } = renderView();
            openFor("Ana Ruiz");
            moveTo("Group 10");
            await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Could not move the student. database is down"));
            expect(setPlan).not.toHaveBeenCalled();
        });

        it("Cancel moves no one", () => {
            renderView();
            openFor("Ana Ruiz");
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
            expect(run).not.toHaveBeenCalled();
        });
    });

    describe("anchor", () => {
        it("sets and removes the anchor flag from the menu, showing it at once", async () => {
            const { plan, setPlan } = renderView();
            menuFor("Ben Said");
            choose("Set as anchor");
            await waitFor(() => expect(updatePlacement).toHaveBeenCalledWith("plan", "b", { anchor: true }));
            const shown = setPlan.mock.calls[0][0] as Plan;
            expect(shown.placements.find(p => p.student_id === "b")!.anchor).toBe(true);
            // the other students are as they were, and the plan it was given is not changed
            expect(shown.placements.find(p => p.student_id === "a")!.anchor).toBe(true);
            expect(plan.placements.find(p => p.student_id === "b")!.anchor).toBe(false);
        });

        it("offers to remove the flag from an anchor student", async () => {
            const { setPlan } = renderView();
            menuFor("Ana Ruiz");
            choose("Remove anchor");
            await waitFor(() => expect(updatePlacement).toHaveBeenCalledWith("plan", "a", { anchor: false }));
            expect((setPlan.mock.calls[0][0] as Plan).placements.find(p => p.student_id === "a")!.anchor).toBe(false);
        });

        it("puts the plan back, and reloads, when saving the flag fails", async () => {
            updatePlacement.mockRejectedValue(new Error("offline"));
            const { plan, setPlan } = renderView();
            menuFor("Ben Said");
            choose("Set as anchor");
            await waitFor(() => expect(setPlan).toHaveBeenCalledTimes(2));
            expect(setPlan.mock.calls[1][0]).toBe(plan);
            expect(setRefresh).toHaveBeenCalledWith(1);
        });
    });
});
