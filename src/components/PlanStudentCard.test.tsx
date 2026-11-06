/**
 *  PlanStudentCard.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Placement, Student } from "../api/types";
import { PlanStudentCard } from "./PlanStudentCard";

const placementOf = (overrides: Partial<Placement> = {}, country = "Peru"): Placement => ({
    plan_id: "plan",
    student_id: "s1",
    anchor: false,
    priority: 0,
    student: { id: "s1", name: "Alejandra D", country } as Student,
    ...overrides
} as Placement);

describe("PlanStudentCard", () => {
    it("shows the student's name and country", () => {
        render(<PlanStudentCard placement={placementOf()} />);
        expect(screen.getByText("Alejandra D")).toBeTruthy();
        expect(screen.getByText(/Peru/)).toBeTruthy();
    });

    it("shows the country's flag, and a globe for a country it does not know", () => {
        const { rerender } = render(<PlanStudentCard placement={placementOf()} />);
        expect(screen.getByText(/🇵🇪/)).toBeTruthy();
        rerender(<PlanStudentCard placement={placementOf({}, "Atlantis")} />);
        expect(screen.getByText(/🌐/)).toBeTruthy();
    });

    it("has an Anchor badge, with an anchor icon, only for an anchor student", () => {
        const { rerender } = render(<PlanStudentCard placement={placementOf()} />);
        expect(screen.queryByText("Anchor")).toBeNull();
        rerender(<PlanStudentCard placement={placementOf({ anchor: true })} />);
        const badge = screen.getByText("Anchor").closest(".MuiChip-root")!;
        expect(badge.querySelector("svg")).toBeTruthy();
    });

    it("has no menu when there is nothing to choose", () => {
        render(<PlanStudentCard placement={placementOf()} />);
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("has a three dot menu, named for the student, with See details and Change group", () => {
        render(<PlanStudentCard placement={placementOf()} onSeeDetails={vi.fn()} onChangeGroup={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: "More actions for Alejandra D" }));
        expect(screen.getAllByRole("menuitem").map(item => item.textContent)).toEqual(["See details", "Change group"]);
    });

    it("passes the student on, and closes the menu, when See details is chosen", () => {
        const onSeeDetails = vi.fn();
        const placement = placementOf();
        render(<PlanStudentCard placement={placement} onSeeDetails={onSeeDetails} onChangeGroup={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: /more actions/i }));
        fireEvent.click(screen.getByRole("menuitem", { name: "See details" }));
        expect(onSeeDetails).toHaveBeenCalledWith(placement);
    });

    it("passes the student on when Change group is chosen", () => {
        const onChangeGroup = vi.fn();
        const placement = placementOf();
        render(<PlanStudentCard placement={placement} onSeeDetails={vi.fn()} onChangeGroup={onChangeGroup} />);
        fireEvent.click(screen.getByRole("button", { name: /more actions/i }));
        fireEvent.click(screen.getByRole("menuitem", { name: "Change group" }));
        expect(onChangeGroup).toHaveBeenCalledWith(placement);
    });

    it("sets or removes the anchor flag from the menu", () => {
        const onToggleAnchor = vi.fn();
        const { rerender } = render(<PlanStudentCard placement={placementOf()} onToggleAnchor={onToggleAnchor} />);
        fireEvent.click(screen.getByRole("button", { name: /more actions/i }));
        expect(screen.getByRole("menuitem", { name: "Set as anchor" })).toBeTruthy();
        fireEvent.click(screen.getByRole("menuitem", { name: "Set as anchor" }));
        expect(onToggleAnchor).toHaveBeenCalledTimes(1);
        rerender(<PlanStudentCard placement={placementOf({ anchor: true })} onToggleAnchor={onToggleAnchor} />);
        fireEvent.click(screen.getByRole("button", { name: /more actions/i }));
        expect(screen.getByRole("menuitem", { name: "Remove anchor" })).toBeTruthy();
    });

    describe("the Anchor badge beside the name", () => {
        // there is no screen in the test runtime, so sizes are made up: letters 8 wide, a whole badge 70, the row set by each test
        let rowWidth = 165;
        let resized: () => void = () => { };
        const originals = ["offsetWidth", "scrollWidth", "clientWidth"].map(name => [name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)] as const);

        beforeEach(() => {
            rowWidth = 165;
            Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return this.hasAttribute("data-anchor-badge") ? 70 : 0; } });
            Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get() { return this.tagName === "P" && this.title ? this.title.length * 8 : 0; } });
            Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return this.querySelector(":scope > p[title]") ? rowWidth : 0; } });
            vi.stubGlobal("ResizeObserver", class {
                constructor(callback: () => void) { resized = callback; }
                observe() { }
                disconnect() { }
            });
        });
        afterEach(() => {
            originals.forEach(([name, descriptor]) => descriptor ? Object.defineProperty(HTMLElement.prototype, name, descriptor) : delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name]);
            vi.unstubAllGlobals();
        });

        const anchorOf = (name: string) => placementOf({ anchor: true, student: { id: "s1", name, country: "Peru" } as Student });
        const badge = () => document.querySelector("[data-anchor-badge]")!;

        it("is on the same line as the name, to the right of it", () => {
            render(<PlanStudentCard placement={anchorOf("Ana")} />);
            const name = screen.getByText("Ana");
            expect(badge().parentElement!.parentElement).toBe(name.parentElement);
            expect(Boolean(name.compareDocumentPosition(badge()) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        });

        it("is the whole badge, with the word, when the name and the badge fit", () => {
            render(<PlanStudentCard placement={anchorOf("Ana")} />);
            expect(badge().getAttribute("data-anchor-badge")).toBe("full");
            expect(screen.getByText("Anchor")).toBeTruthy();
        });

        it("is just the icon, still named Anchor, when the name and the badge do not fit", () => {
            render(<PlanStudentCard placement={anchorOf("Aisha Dubois")} />);
            expect(badge().getAttribute("data-anchor-badge")).toBe("icon");
            expect(screen.queryByText("Anchor")).toBeNull();
            expect(screen.getByRole("img", { name: "Anchor" }).getAttribute("title")).toBe("Anchor");
            expect(badge().querySelector("svg")).toBeTruthy();
        });

        it("fits by a hair: the whole badge when the row is exactly as wide as the name, the gap and the badge", () => {
            rowWidth = 3 * 8 + 6 + 70;
            render(<PlanStudentCard placement={anchorOf("Ana")} />);
            expect(badge().getAttribute("data-anchor-badge")).toBe("full");
        });

        it("goes to the icon, and back to the whole badge, as the card is made narrower and wider", () => {
            render(<PlanStudentCard placement={anchorOf("Aisha Dubois")} />);
            expect(badge().getAttribute("data-anchor-badge")).toBe("icon");
            rowWidth = 220;
            act(() => resized());
            expect(badge().getAttribute("data-anchor-badge")).toBe("full");
            rowWidth = 140;
            act(() => resized());
            expect(badge().getAttribute("data-anchor-badge")).toBe("icon");
        });

        it("has no badge for a student who is not an anchor", () => {
            render(<PlanStudentCard placement={placementOf()} />);
            expect(document.querySelector("[data-anchor-badge]")).toBeNull();
        });
    });
});
