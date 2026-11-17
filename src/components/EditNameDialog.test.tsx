/**
 *  EditNameDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const setRefresh = vi.hoisted(() => vi.fn());

// the notification and refresh helpers come from the shared library; stand in for them
vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return {
        RefreshContext: React.createContext({ refresh: 0, setRefresh }),
        useNotifications: () => notifications
    };
});

import { EditNameDialog } from "./EditNameDialog";

const renderDialog = (overrides: Partial<React.ComponentProps<typeof EditNameDialog>> = {}) => {
    const props = {
        title: "Edit Plan Name",
        label: "Plan name",
        name: "Spring Plan",
        open: true,
        onClose: vi.fn(),
        onSave: vi.fn().mockResolvedValue(undefined),
        errorMessage: "Could not update.",
        ...overrides
    };
    render(<EditNameDialog {...props} />);
    return props;
};

const field = () => screen.getByLabelText("Plan name") as HTMLInputElement;
const save = () => screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
const type = (text: string) => fireEvent.change(field(), { target: { value: text } });

describe("EditNameDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows the title and the current name, with Save and Cancel", () => {
        renderDialog();
        expect(screen.getByText("Edit Plan Name")).toBeTruthy();
        expect(field().value).toBe("Spring Plan");
        expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
        expect(save()).toBeTruthy();
    });

    it("has Save off until the name changes", () => {
        renderDialog();
        expect(save().disabled).toBe(true);
        type("Spring Plan B");
        expect(save().disabled).toBe(false);
    });

    it("has Save off when the name is blank or only spaces", () => {
        renderDialog();
        type("");
        expect(save().disabled).toBe(true);
        type("    ");
        expect(save().disabled).toBe(true);
    });

    it("has Save off when only spaces around the name differ", () => {
        renderDialog();
        type("  Spring Plan  ");
        expect(save().disabled).toBe(true);
    });

    it("saves the trimmed name, closes, and refreshes", async () => {
        const props = renderDialog();
        type("  Fall Plan  ");
        fireEvent.click(save());
        await waitFor(() => expect(props.onClose).toHaveBeenCalled());
        expect(props.onSave).toHaveBeenCalledWith("Fall Plan");
        expect(setRefresh).toHaveBeenCalledWith(1);
    });

    it("saves with the Enter key (form submit) when Save is available", async () => {
        const props = renderDialog();
        type("Fall Plan");
        fireEvent.submit(field().closest("form")!);
        await waitFor(() => expect(props.onSave).toHaveBeenCalledWith("Fall Plan"));
    });

    it("does not save on Enter when Save is off", () => {
        const props = renderDialog();
        fireEvent.submit(field().closest("form")!);
        expect(props.onSave).not.toHaveBeenCalled();
    });

    it("closes without saving on Cancel", () => {
        const props = renderDialog();
        type("Fall Plan");
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(props.onClose).toHaveBeenCalled();
        expect(props.onSave).not.toHaveBeenCalled();
    });

    it("reports a failed save and stays open", async () => {
        const props = renderDialog({ onSave: vi.fn().mockRejectedValue(new Error("offline")) });
        type("Fall Plan");
        fireEvent.click(save());
        await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Could not update. offline"));
        expect(props.onClose).not.toHaveBeenCalled();
        expect(setRefresh).not.toHaveBeenCalled();
    });
});
