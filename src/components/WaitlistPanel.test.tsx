/**
 *  WaitlistPanel.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Placement, Student } from "../api/types";
import { WaitlistPanel } from "./WaitlistPanel";

const waiting = (id: string, name: string, country: string, anchor = false): Placement =>
    ({ plan_id: "p", student_id: id, group_id: null, anchor, priority: 0, student: { id, name, country } as Student }) as Placement;

const renderPanel = (placements: Placement[]) => {
    const handlers = { onSeeDetails: vi.fn(), onChangeGroup: vi.fn(), onToggleAnchor: vi.fn() };
    render(<WaitlistPanel placements={placements} {...handlers} />);
    return handlers;
};

describe("WaitlistPanel", () => {
    it("is a side panel titled Waitlisted, with how many are on it", () => {
        renderPanel([waiting("a", "Ana", "Peru"), waiting("b", "Ben", "Egypt")]);
        const panel = screen.getByRole("complementary", { name: "Waitlisted" });
        expect(within(panel).getByRole("heading", { name: "Waitlisted" })).toBeTruthy();
        expect(within(panel).getByLabelText("2 students")).toBeTruthy();
    });

    it("lists the students as compact cards, anchors first and then by name", () => {
        renderPanel([waiting("a", "Zed", "Peru"), waiting("b", "Ben", "Egypt"), waiting("c", "Mia", "Spain", true)]);
        const names = Array.from(document.querySelectorAll("[data-student]")).map(card => within(card as HTMLElement).getAllByText(/.+/)[0].textContent);
        expect(names).toEqual(["Mia", "Ben", "Zed"]);
        expect(screen.getAllByText("Anchor")).toHaveLength(1);
    });

    it("says so when no one is on the waitlist", () => {
        renderPanel([]);
        expect(screen.getByText("No one is on the waitlist.")).toBeTruthy();
        expect(screen.getByLabelText("0 students")).toBeTruthy();
    });

    it("gives each student the same three dot menu as in a group", () => {
        const { onSeeDetails, onChangeGroup } = renderPanel([waiting("a", "Ana", "Peru")]);
        fireEvent.click(screen.getByRole("button", { name: "More actions for Ana" }));
        expect(screen.getAllByRole("menuitem").map(item => item.textContent)).toEqual(["See details", "Change group", "Set as anchor"]);
        fireEvent.click(screen.getByRole("menuitem", { name: "Change group" }));
        expect(onChangeGroup).toHaveBeenCalledTimes(1);
        expect(onSeeDetails).not.toHaveBeenCalled();
    });
});
