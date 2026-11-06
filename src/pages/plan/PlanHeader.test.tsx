/**
 *  PlanHeader.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlanNotes } from "./PlanNotes";
import { PlanTitle } from "./PlanTitle";

describe("PlanTitle", () => {
    it("is the page's heading, with a Name label above it", () => {
        render(<PlanTitle name="Best Plan" onChange={vi.fn()} />);
        const heading = screen.getByRole("heading", { level: 1, name: "Best Plan" });
        const label = screen.getByText("Name");
        expect(label.tagName).toBe("P");
        expect(Boolean(label.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        expect(screen.queryByText("Name:")).toBeNull();
    });

    it("renames in place with the pencil, and saves with Enter", () => {
        const onChange = vi.fn();
        render(<PlanTitle name="Best Plan" onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
        const input = screen.getByRole("textbox", { name: "Edit Name" });
        fireEvent.change(input, { target: { value: "  Better Plan " } });
        fireEvent.keyDown(input, { key: "Enter" });
        expect(onChange).toHaveBeenCalledWith("Better Plan");
        expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    });

    it("does not save an empty or unchanged name, and Escape cancels", () => {
        const onChange = vi.fn();
        render(<PlanTitle name="Best Plan" onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
        fireEvent.change(screen.getByRole("textbox"), { target: { value: " " } });
        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "Other" } });
        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("heading", { name: "Best Plan" })).toBeTruthy();
    });
});

describe("PlanNotes", () => {
    it("is a text entry field showing the notes", () => {
        render(<PlanNotes note="Remember the anchors" onChange={vi.fn()} />);
        expect((screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement).value).toBe("Remember the anchors");
    });

    it("is there to type in even when the plan has no notes, and saves when left", () => {
        const onChange = vi.fn();
        render(<PlanNotes note={undefined} onChange={onChange} />);
        const field = screen.getByRole("textbox", { name: "Notes" });
        fireEvent.change(field, { target: { value: "New note" } });
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.blur(field);
        expect(onChange).toHaveBeenCalledWith("New note");
    });

    it("does not save when nothing changed", () => {
        const onChange = vi.fn();
        render(<PlanNotes note="Same" onChange={onChange} />);
        fireEvent.blur(screen.getByRole("textbox", { name: "Notes" }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("saves with Control+Enter, and follows the plan when the notes change elsewhere", () => {
        const onChange = vi.fn();
        const { rerender } = render(<PlanNotes note="A" onChange={onChange} />);
        const field = screen.getByRole("textbox", { name: "Notes" });
        fireEvent.change(field, { target: { value: "B" } });
        fireEvent.keyDown(field, { key: "Enter", ctrlKey: true });
        expect(onChange).toHaveBeenCalledWith("B");
        rerender(<PlanNotes note="C" onChange={onChange} />);
        expect((screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement).value).toBe("C");
    });
});
