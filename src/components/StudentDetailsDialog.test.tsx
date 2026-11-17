/**
 *  StudentDetailsDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Placement, Student, TimeWindow } from "../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import { StudentDetailsDialog } from "./StudentDetailsDialog";

const service = CETimeWindowService.getInstance();
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({
    start_date_time: service.localTimeToUTC(day, `${from}:00`, DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, `${to}:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;

const maria = {
    id: "maria", name: "Maria Lopez", age: 16, gender: "Female", email: "maria@example.com",
    city: "Lima", state: "", country: "Peru", time_zone: "America/Lima", tz_offset: -5,
    timeWindows: [pt(0, "09:00", "15:00"), pt(1, "09:00", "12:00")]
} as Student;
const placementOf = (student: Student, anchor = false): Placement =>
    ({ plan_id: "plan", student_id: student.id, anchor, priority: 0, student }) as Placement;

describe("StudentDetailsDialog", () => {
    it("is closed when there is no student", () => {
        render(<StudentDetailsDialog placement={null} onClose={vi.fn()} />);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("organizes the student's details in cards", () => {
        render(<StudentDetailsDialog placement={placementOf(maria)} groupName="Group 2" onClose={vi.fn()} />);
        expect(screen.getByRole("dialog", { name: "Student details" })).toBeTruthy();
        ["Profile", "In this plan", "Location", "Availability"].forEach(title =>
            expect(screen.getByRole("region", { name: title })).toBeTruthy());
    });

    it("shows who the student is", () => {
        render(<StudentDetailsDialog placement={placementOf(maria)} groupName="Group 2" onClose={vi.fn()} />);
        const profile = screen.getByRole("region", { name: "Profile" });
        expect(within(profile).getByText("Maria Lopez")).toBeTruthy();
        expect(within(profile).getByText("16")).toBeTruthy();
        expect(within(profile).getByText("Female")).toBeTruthy();
        expect(within(profile).getByText("maria@example.com")).toBeTruthy();
    });

    it("shows where the student stands in the plan: their group, and whether they are an anchor", () => {
        const { rerender } = render(<StudentDetailsDialog placement={placementOf(maria, true)} groupName="Group 2" onClose={vi.fn()} />);
        const plan = () => screen.getByRole("region", { name: "In this plan" });
        expect(within(plan()).getByText("Group 2")).toBeTruthy();
        expect(within(plan()).getByText("Yes")).toBeTruthy();
        expect(within(screen.getByRole("region", { name: "Profile" })).getByText("Anchor")).toBeTruthy();
        rerender(<StudentDetailsDialog placement={placementOf(maria)} onClose={vi.fn()} />);
        expect(within(plan()).getByText("Waitlisted")).toBeTruthy();
        expect(within(plan()).getByText("No")).toBeTruthy();
        expect(within(screen.getByRole("region", { name: "Profile" })).queryByText("Anchor")).toBeNull();
    });

    it("shows the city, country with its flag, and time zone", () => {
        render(<StudentDetailsDialog placement={placementOf(maria)} onClose={vi.fn()} />);
        const location = screen.getByRole("region", { name: "Location" });
        expect(within(location).getByText("Lima")).toBeTruthy();
        expect(within(location).getByText(/🇵🇪/)).toBeTruthy();
        expect(within(location).getByText("America/Lima UTC-5")).toBeTruthy();
    });

    it("writes half hour time zones in full", () => {
        render(<StudentDetailsDialog placement={placementOf({ ...maria, time_zone: "Asia/Kolkata", tz_offset: 5.5 } as Student)} onClose={vi.fn()} />);
        expect(screen.getByText("Asia/Kolkata UTC+5:30")).toBeTruthy();
    });

    it("shows the availability on the same little calendar, and in words", () => {
        render(<StudentDetailsDialog placement={placementOf(maria)} onClose={vi.fn()} />);
        const availability = screen.getByRole("region", { name: "Availability" });
        expect(within(availability).getByRole("img", { name: /^Maria Lopez availability: Fri 9am to 3pm, Sat 9am to 12pm/ })).toBeTruthy();
        expect(within(availability).getByText("9 hours: Fri 9am to 3pm, Sat 9am to 12pm")).toBeTruthy();
    });

    it("says so when the student has no availability", () => {
        render(<StudentDetailsDialog placement={placementOf({ ...maria, timeWindows: [] } as unknown as Student)} onClose={vi.fn()} />);
        expect(within(screen.getByRole("region", { name: "Availability" })).getByText("No time")).toBeTruthy();
    });

    it("copes with details that are missing", () => {
        render(<StudentDetailsDialog placement={placementOf({ id: "x", name: "X", country: "", city: "", timeWindows: [] } as unknown as Student)} onClose={vi.fn()} />);
        expect(within(screen.getByRole("region", { name: "Profile" })).getAllByText("—").length).toBeGreaterThanOrEqual(3);
    });

    it("Close closes the window", () => {
        const onClose = vi.fn();
        render(<StudentDetailsDialog placement={placementOf(maria)} onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
