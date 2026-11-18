/**
 *  PlanSettingsDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@digitalaidseattle/core", () => ({ useNotifications: () => notifications }));

import { Placement, Plan, Student, TimeWindow } from "../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import { ARRANGEMENTS_TO_COMPARE } from "../services/plan/planGeneration";
import PlanSettingsDialog from "./PlanSettingsDialog";

const service = CETimeWindowService.getInstance();
const window = (day: 0 | 1 | 2) => ({
    start_date_time: service.localTimeToUTC(day, "07:00:00", DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, "22:00:00", DEFAULT_TIMEZONE)
}) as TimeWindow;

const placement = (id: string, group_id: string | null): Placement =>
    ({ plan_id: "p", student_id: id, group_id, anchor: false, priority: 0, student: { id, name: id, country: "Kenya", anchor: false, timeWindows: [window(0), window(1), window(2)] } as Student }) as Placement;

// twelve students free all weekend, as they sit in a plan already grouped in threes: four groups
const planOf = (group_size?: number) => {
    const placements = Array.from({ length: 12 }, (_, i) => placement(`s${String(i).padStart(2, "0")}`, `g${i % 4}`));
    const groups = [0, 1, 2, 3].map(i => ({ id: `g${i}`, name: `Group ${i + 1}`, time_windows: [], placements: placements.filter(p => p.group_id === `g${i}`) }));
    return { id: "p", name: "Plan", group_size, groups, placements } as unknown as Plan;
};

const slider = (name: string) => screen.getByRole("slider", { name }) as HTMLInputElement;
const total = (label: string) => Number(screen.getByText(label).previousElementSibling!.textContent);
const button = (name: RegExp) => screen.getByRole("button", { name }) as HTMLButtonElement;

const renderDialog = (props: Partial<React.ComponentProps<typeof PlanSettingsDialog>> = {}) => {
    const handlers = { onClose: vi.fn(), onSubmit: vi.fn().mockResolvedValue(undefined) };
    render(<PlanSettingsDialog plan={planOf(6)} isOpen {...handlers} {...props} />);
    return handlers;
};

describe("PlanSettingsDialog", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("has the generation sliders, starting from the plan's group size", () => {
        renderDialog();
        expect(screen.getByRole("heading", { name: "Plan settings" })).toBeTruthy();
        expect(slider("Minimum overlap").value).toBe("0");
        expect(slider("Minimum group size").value).toBe("1");
        expect(slider("Maximum group size").value).toBe("6");
    });

    it("has the summary stats, first of the plan as it is now", () => {
        renderDialog();
        expect(total("Groups")).toBe(4);
        expect(total("Students")).toBe(12);
        expect(total("Waitlisted students")).toBe(0);
        expect(screen.getByText(/This is the plan as it is now/)).toBeTruthy();
    });

    it("shows the groups the settings would make once a setting is changed", () => {
        renderDialog();
        // twelve free students in groups of at most seven: two groups, nobody waitlisted
        fireEvent.change(slider("Maximum group size"), { target: { value: 7 } });
        expect(total("Groups")).toBe(2);
        expect(total("Students")).toBe(12);
        fireEvent.change(slider("Maximum group size"), { target: { value: 4 } });
        expect(total("Groups")).toBe(3);
        expect(screen.queryByText(/This is the plan as it is now/)).toBeNull();
        expect(screen.getByText(/Updates as you change the settings/)).toBeTruthy();
    });

    it("has Cancel, Optimize and Update plan", () => {
        renderDialog();
        expect(button(/^cancel$/i)).toBeTruthy();
        expect(button(/optimize/i)).toBeTruthy();
        expect(button(/^update plan$/i)).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
    });

    it("Cancel closes without updating", () => {
        const { onClose, onSubmit } = renderDialog();
        fireEvent.click(button(/^cancel$/i));
        expect(onClose).toHaveBeenCalled();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("Optimize only changes the preview: it does not update the plan", async () => {
        const { onSubmit } = renderDialog();
        fireEvent.click(button(/optimize/i));
        await waitFor(() => expect(screen.getByText(/No other grouping waitlisted fewer students than 0\./)).toBeTruthy(), { timeout: 5000 });
        await waitFor(() => expect(button(/optimize/i).disabled).toBe(false), { timeout: 5000 });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("Update plan hands over the settings, and the arrangement Optimize chose, and stays busy until done", async () => {
        let finish: () => void = () => { };
        const onSubmit = vi.fn().mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
        renderDialog({ onSubmit });
        fireEvent.change(slider("Minimum overlap"), { target: { value: 2 } });
        fireEvent.change(slider("Maximum group size"), { target: { value: 5 } });
        fireEvent.click(button(/^update plan$/i));
        expect(onSubmit).toHaveBeenCalledWith({ minOverlapHours: 2, minGroupSize: 1, maxGroupSize: 5, optimizationStyle: "largest_first", shuffleSeed: undefined });
        expect(button(/updating plan/i).disabled).toBe(true);
        expect(button(/^cancel$/i).disabled).toBe(true);
        finish();
        await waitFor(() => expect(button(/^update plan$/i).disabled).toBe(false));
    });

    it("has a Generation method, starting from the plan's own, and hands over the one chosen", () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(<PlanSettingsDialog plan={{ ...planOf(6), optimization_style: "smallest_first" } as Plan} isOpen onClose={vi.fn()} onSubmit={onSubmit} />);
        const method = screen.getByRole("combobox", { name: "Generation Method" });
        expect(method.textContent).toBe("Least Availability");
        fireEvent.mouseDown(method);
        fireEvent.click(screen.getByRole("option", { name: "Balanced Groups" }));
        // the preview is now of the new method, no longer of the plan as it is
        expect(screen.queryByText(/This is the plan as it is now/)).toBeNull();
        fireEvent.click(button(/^update plan$/i));
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ optimizationStyle: "balanced" }));
    });

    it("starts a plan with a method it does not know on the default one", () => {
        render(<PlanSettingsDialog plan={{ ...planOf(6), optimization_style: "mystery" } as Plan} isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);
        expect(screen.getByRole("combobox", { name: "Generation Method" }).textContent).toBe("Most Availability");
    });

    it("starts again from the plan's settings each time it opens", () => {
        const { rerender } = render(<PlanSettingsDialog plan={planOf(6)} isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);
        fireEvent.change(slider("Maximum group size"), { target: { value: 3 } });
        rerender(<PlanSettingsDialog plan={planOf(6)} isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
        rerender(<PlanSettingsDialog plan={planOf(6)} isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);
        expect(slider("Maximum group size").value).toBe("6");
        expect(screen.getByText(/This is the plan as it is now/)).toBeTruthy();
    });

    it("names the button Optimize Waitlist", () => {
        renderDialog();
        expect(button(/optimize waitlist/i).textContent).toMatch(/Optimize Waitlist$/);
    });

    it("says under Preview what Optimize Waitlist does, and that the plan is not changed until Update Plan", () => {
        renderDialog();
        const help = screen.getByText(/Optimize Waitlist tries \d+ configurations/);
        expect(help.textContent).toMatch(/tries 50 configurations based on your settings to find a grouping with a smaller waitlist/);
        expect(help.textContent).toMatch(/not changed until you press Update Plan/);
    });

    it("says it tries as many configurations as Optimize compares", () => {
        renderDialog();
        expect(screen.getByText(/Optimize Waitlist tries/).textContent).toContain(`tries ${ARRANGEMENTS_TO_COMPARE} configurations`);
    });

    it("says that updating replaces moves made by hand", () => {
        renderDialog();
        expect(screen.getByText(/regroups all of its students/)).toBeTruthy();
    });
});
