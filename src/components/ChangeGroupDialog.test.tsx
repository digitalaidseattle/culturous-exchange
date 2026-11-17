/**
 *  ChangeGroupDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Group, Placement, Plan, Student, TimeWindow } from "../api/types";
import { WAITLIST_ID } from "../constants";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import { ChangeGroupDialog } from "./ChangeGroupDialog";

const service = CETimeWindowService.getInstance();
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({
    start_date_time: service.localTimeToUTC(day, `${from}:00`, DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, `${to}:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;

const student = (id: string, name: string, country: string, windows: TimeWindow[]): Student =>
    ({ id, name, country, timeWindows: windows, anchor: false }) as Student;
const placement = (s: Student, groupId: string | null, anchor = false): Placement =>
    ({ plan_id: "plan", student_id: s.id, group_id: groupId, anchor, priority: 0, student: s }) as Placement;

// Maria is free Friday 9 to 3, and Saturday 9 to noon
const maria = student("maria", "Maria Lopez", "Peru", [pt(0, "09:00", "15:00"), pt(1, "09:00", "12:00")]);
const omar = student("omar", "Omar K", "Egypt", [pt(0, "12:00", "18:00")]);
const noor = student("noor", "Noor S", "Egypt", [pt(2, "09:00", "12:00")]);
const lena = student("lena", "Lena M", "Germany", [pt(0, "09:00", "15:00")]);

const placements = [
    placement(maria, "g1", true),
    placement(omar, "g2"),
    placement(noor, "g3"),
    placement(lena, "g3"),
    placement(student("wait", "Wendy W", "Spain", []), null)
];
const groups = [
    { id: "g2", name: "Group 2", time_windows: [pt(0, "12:00", "18:00")] },
    { id: "g1", name: "Group 1", time_windows: [pt(0, "09:00", "15:00"), pt(1, "09:00", "12:00")] },
    // Noor and Lena share nothing, so Group 3 has no time at all
    { id: "g3", name: "Group 3", time_windows: [] },
    { id: "g10", name: "Group 10", time_windows: [pt(1, "09:00", "11:00")] }
] as Group[];
const plan = { id: "plan", name: "Plan", groups, placements } as unknown as Plan;

const renderDialog = (target: Placement | null = placements[0], onMove = vi.fn().mockResolvedValue(true), onClose = vi.fn()) => {
    const view = render(<ChangeGroupDialog plan={plan} placement={target} onClose={onClose} onMove={onMove} />);
    return { ...view, onMove, onClose };
};
const choice = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;
const card = (name: string) => choice(name).closest("[data-group]") as HTMLElement;
const moveButton = () => screen.getByRole("button", { name: /^move to|^moving/i }) as HTMLButtonElement;

describe("ChangeGroupDialog", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("is closed when there is no student", () => {
        renderDialog(null);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("shows the student's card at the left, with their availability", () => {
        renderDialog();
        expect(screen.getByRole("dialog", { name: "Change group" })).toBeTruthy();
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Maria Lopez")).toBeTruthy();
        expect(within(dialog).getByText("Anchor")).toBeTruthy();
        expect(within(dialog).getByRole("img", { name: /^Maria Lopez availability: Fri 9am to 3pm, Sat 9am to 12pm/ })).toBeTruthy();
        // the card has no menu in here
        expect(within(dialog).queryByRole("button", { name: /more actions/i })).toBeNull();
    });

    it("lists the groups as cards to choose from, in order, and the waitlist last", () => {
        renderDialog();
        const names = screen.getAllByRole("radio").map(radio => radio.getAttribute("aria-label"));
        expect(names).toEqual(["Group 1", "Group 2", "Group 3", "Group 10", "Waitlisted"]);
    });

    it("shows each group's size and countries", () => {
        renderDialog();
        expect(within(card("Group 3")).getByText("2 students")).toBeTruthy();
        expect(within(card("Group 3")).getByText(/Egypt, .*Germany/)).toBeTruthy();
        expect(within(card("Group 2")).getByText("1 student")).toBeTruthy();
        expect(within(card("Group 10")).getByText("0 students")).toBeTruthy();
    });

    it("names the country flags, and says 'and N more' past three countries", () => {
        const many = [
            placement(student("a", "A", "Peru", []), "g1"), placement(student("b", "B", "Egypt", []), "g1"),
            placement(student("c", "C", "Spain", []), "g1"), placement(student("d", "D", "Brazil", []), "g1"),
            placement(student("e", "E", "Iraq", []), "g1")
        ];
        render(<ChangeGroupDialog plan={{ ...plan, placements: [...many, placement(maria, "g2")] } as Plan} placement={placements[1]} onClose={vi.fn()} onMove={vi.fn()} />);
        expect(within(card("Group 1")).getByText(/🇵🇪 Peru, 🇪🇬 Egypt, 🇪🇸 Spain and 2 more/)).toBeTruthy();
    });

    it("shows the time the student shares with each group, by the student's first name", () => {
        renderDialog(placements[1]); // Omar, free Friday noon to 6pm
        expect(within(card("Group 1")).getByText("3 hours shared with Omar")).toBeTruthy();
        expect(within(card("Group 10")).getByText("No shared time with Omar")).toBeTruthy();
    });

    it("marks a group with no shared time clearly, and not the groups with some", () => {
        renderDialog(placements[1]);
        const none = card("Group 10");
        expect(within(none).getByText("No shared time with Omar").closest(".MuiChip-root")!.className).toMatch(/colorError/);
        expect(within(card("Group 1")).queryByText(/No shared time/)).toBeNull();
    });

    it("draws a little calendar for each group, with the shared time on it", () => {
        renderDialog(placements[1]);
        expect(within(card("Group 1")).getByRole("img", { name: /^Group 1 and Omar: Fri 12pm to 3pm/ })).toBeTruthy();
        expect(within(card("Group 10")).getByRole("img", { name: /^Group 10 and Omar: No shared time/ })).toBeTruthy();
    });

    it("marks the student's own group as current, and cannot be moved to", () => {
        renderDialog();
        expect(within(card("Group 1")).getByText("Current group")).toBeTruthy();
        expect(choice("Group 1").disabled).toBe(true);
        expect(choice("Group 2").disabled).toBe(false);
    });

    it("has the move button off, reading 'Move to group', until a group is chosen", () => {
        renderDialog();
        expect(moveButton().textContent).toBe("Move to group");
        expect(moveButton().disabled).toBe(true);
    });

    it("turns the button on, reading 'Move to' and the group's name, once a group is chosen", () => {
        renderDialog();
        fireEvent.click(choice("Group 2"));
        expect(choice("Group 2").checked).toBe(true);
        expect(moveButton().textContent).toBe("Move to Group 2");
        expect(moveButton().disabled).toBe(false);
        fireEvent.click(choice("Group 10"));
        expect(moveButton().textContent).toBe("Move to Group 10");
        expect(choice("Group 2").checked).toBe(false);
    });

    it("moves the student to the chosen group, and closes when it worked", async () => {
        const { onMove, onClose } = renderDialog();
        fireEvent.click(choice("Group 2"));
        fireEvent.click(moveButton());
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
        expect(onMove).toHaveBeenCalledWith(placements[0], "g2");
    });

    it("stays open when the move did not work", async () => {
        const { onMove, onClose } = renderDialog(placements[0], vi.fn().mockResolvedValue(false));
        fireEvent.click(choice("Group 2"));
        fireEvent.click(moveButton());
        await waitFor(() => expect(onMove).toHaveBeenCalled());
        await waitFor(() => expect(moveButton().disabled).toBe(false));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("shows that it is moving, and cannot be cancelled meanwhile", async () => {
        let finish: (ok: boolean) => void = () => { };
        renderDialog(placements[0], vi.fn().mockReturnValue(new Promise<boolean>(resolve => { finish = resolve; })));
        fireEvent.click(choice("Group 2"));
        fireEvent.click(moveButton());
        await waitFor(() => expect(moveButton().disabled).toBe(true));
        expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
        finish(true);
    });

    it("can move a student to the waitlist, reading 'Move to waitlist'", async () => {
        const { onMove } = renderDialog();
        fireEvent.click(choice("Waitlisted"));
        expect(moveButton().textContent).toBe("Move to waitlist");
        fireEvent.click(moveButton());
        await waitFor(() => expect(onMove).toHaveBeenCalledWith(placements[0], WAITLIST_ID));
    });

    it("says how many are waitlisted, and does not offer the waitlist to a student already on it", () => {
        renderDialog(placements[4]);
        expect(within(card("Waitlisted")).getByText("1 student")).toBeTruthy();
        expect(within(card("Waitlisted")).getByText("Current group")).toBeTruthy();
        expect(choice("Waitlisted").disabled).toBe(true);
        // a waitlisted student can go to any group
        expect(choice("Group 1").disabled).toBe(false);
    });

    it("Cancel closes the window without moving anyone", () => {
        const { onMove, onClose } = renderDialog();
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onMove).not.toHaveBeenCalled();
    });

    it("forgets the choice when it is opened for another student", () => {
        const { rerender } = renderDialog();
        fireEvent.click(choice("Group 2"));
        rerender(<ChangeGroupDialog plan={plan} placement={placements[1]} onClose={vi.fn()} onMove={vi.fn()} />);
        expect(moveButton().textContent).toBe("Move to group");
        expect(moveButton().disabled).toBe(true);
    });

    it("copes with a student who has no availability", () => {
        renderDialog(placements[4]);
        expect(within(card("Group 1")).getByText("No shared time with Wendy")).toBeTruthy();
    });
});
