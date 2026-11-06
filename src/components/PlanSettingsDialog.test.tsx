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
        await waitFor(() => expect(screen.getByText(/waitlist/i, { selector: "span" })).toBeTruthy(), { timeout: 5000 });
        await waitFor(() => expect(button(/optimize/i).disabled).toBe(false), { timeout: 5000 });
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText(/No other grouping waitlisted fewer students than 0\./)).toBeTruthy();
    });

    it("Update plan hands over the settings, and the arrangement Optimize chose, and stays busy until done", async () => {
        let finish: () => void = () => { };
        const onSubmit = vi.fn().mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
        renderDialog({ onSubmit });
        fireEvent.change(slider("Minimum overlap"), { target: { value: 2 } });
        fireEvent.change(slider("Maximum group size"), { target: { value: 5 } });
        fireEvent.click(button(/^update plan$/i));
        expect(onSubmit).toHaveBeenCalledWith({ minOverlapHours: 2, minGroupSize: 1, maxGroupSize: 5, shuffleSeed: undefined });
        expect(button(/updating plan/i).disabled).toBe(true);
        expect(button(/^cancel$/i).disabled).toBe(true);
        finish();
        await waitFor(() => expect(button(/^update plan$/i).disabled).toBe(false));
    });

    it("starts again from the plan's settings each time it opens", () => {
        const { rerender } = render(<PlanSettingsDialog plan={planOf(6)} isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);
        fireEvent.change(slider("Maximum group size"), { target: { value: 3 } });
        rerender(<PlanSettingsDialog plan={planOf(6)} isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
        rerender(<PlanSettingsDialog plan={planOf(6)} isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);
        expect(slider("Maximum group size").value).toBe("6");
        expect(screen.getByText(/This is the plan as it is now/)).toBeTruthy();
    });

    it("says that updating replaces moves made by hand", () => {
        renderDialog();
        expect(screen.getByText(/regroups all of its students/)).toBeTruthy();
    });
});
