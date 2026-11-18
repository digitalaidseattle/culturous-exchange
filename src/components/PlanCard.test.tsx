/**
 *  PlanCard.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.hoisted(() => vi.fn());
const setRefresh = vi.hoisted(() => vi.fn());
const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const getById = vi.hoisted(() => vi.fn());
const applyPlanSettings = vi.hoisted(() => vi.fn());
const dialog = vi.hoisted(() => vi.fn());

vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return {
        LoadingContext: React.createContext({ loading: false, setLoading: vi.fn() }),
        RefreshContext: React.createContext({ refresh: 3, setRefresh }),
        useNotifications: () => notifications
    };
});
vi.mock("react-router", () => ({ useNavigate: () => navigate }));
vi.mock("@digitalaidseattle/mui", () => ({ ConfirmationDialog: () => null }));
vi.mock("../api/cePlanDao", () => ({ CEPlanDao: { getInstance: () => ({ getById }) } }));
vi.mock("../services/plan/planSettings", () => ({ applyPlanSettings }));
// the other windows the card opens are tested on their own; the settings window is a stand-in that can be submitted
vi.mock("./EditPlanNameDialog", () => ({ EditPlanNameDialog: () => null }));
vi.mock("./PlanSettingsDialog", () => ({
    default: (props: { isOpen: boolean, plan: { id: string }, onClose: () => void, onSubmit: (settings: object) => Promise<void> }) => {
        dialog(props);
        return props.isOpen
            ? <div role="dialog" aria-label="Plan settings">
                <button onClick={() => props.onSubmit({ minOverlapHours: 1, minGroupSize: 2, maxGroupSize: 7 })}>Submit settings</button>
                <button onClick={props.onClose}>Close settings</button>
            </div>
            : null;
    }
}));

import { Plan } from "../api/types";
import { PlanCard } from "./PlanCard";

const PLAN = { id: "p1", name: "Plan 1", cohort_id: "c", active: false, note: "", groups: [], placements: [] } as unknown as Plan;
const isDialogOpen = () => dialog.mock.calls.at(-1)![0].isOpen as boolean;

const renderCard = async () => {
    render(<PlanCard planId="p1" />);
    await screen.findByRole("heading", { name: "Plan 1" });
};

describe("PlanCard plan settings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getById.mockResolvedValue(PLAN);
        applyPlanSettings.mockImplementation(async (plan: Plan) => ({ ...plan, name: "Plan 1" }));
    });

    it("has a Plan settings button among the plan's buttons, between Edit Students and Open Plan", async () => {
        await renderCard();
        const names = ["Edit Groups", "Edit Students", "Plan settings", "Open Plan"];
        const buttons = names.map(name => screen.getByRole("button", { name: new RegExp(name, "i") }));
        buttons.slice(1).forEach((button, i) =>
            expect(Boolean(buttons[i].compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true));
    });

    it("opens the Plan settings window on the plan, without opening the plan", async () => {
        await renderCard();
        expect(isDialogOpen()).toBe(false);
        fireEvent.click(screen.getByRole("button", { name: /plan settings/i }));
        expect(isDialogOpen()).toBe(true);
        expect(dialog.mock.calls.at(-1)![0].plan.id).toBe("p1");
        // the whole card opens the plan, so the button must not also pass its click on
        expect(navigate).not.toHaveBeenCalled();
    });

    it("closes the window when it asks to", async () => {
        await renderCard();
        fireEvent.click(screen.getByRole("button", { name: /plan settings/i }));
        fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
        expect(isDialogOpen()).toBe(false);
    });

    it("updates the plan with the settings, says so, closes the window, and has the page read it again", async () => {
        await renderCard();
        fireEvent.click(screen.getByRole("button", { name: /plan settings/i }));
        fireEvent.click(screen.getByRole("button", { name: "Submit settings" }));
        await waitFor(() => expect(notifications.success).toHaveBeenCalledWith("Plan Plan 1 updated successfully"));
        expect(applyPlanSettings).toHaveBeenCalledWith(PLAN, { minOverlapHours: 1, minGroupSize: 2, maxGroupSize: 7 });
        expect(isDialogOpen()).toBe(false);
        expect(setRefresh).toHaveBeenCalledWith(4);
    });

    it("says so when the plan cannot be updated, and keeps the window open to try again", async () => {
        applyPlanSettings.mockRejectedValue(new Error("offline"));
        await renderCard();
        fireEvent.click(screen.getByRole("button", { name: /plan settings/i }));
        fireEvent.click(screen.getByRole("button", { name: "Submit settings" }));
        await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Failed to update plan: offline"));
        expect(isDialogOpen()).toBe(true);
        expect(setRefresh).not.toHaveBeenCalled();
        expect(notifications.success).not.toHaveBeenCalled();
    });
});
