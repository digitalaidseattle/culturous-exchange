/**
 *  PlanGroupCard.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const facilitatorMenu = vi.hoisted(() => vi.fn());
// the facilitator menu reads facilitators from the database; stand in for it
vi.mock("../pages/plan/FacilitatorMenu", () => ({
    FacilitatorMenu: (props: { anchorElement: HTMLElement | null }) => {
        facilitatorMenu(props);
        return props.anchorElement ? <div data-testid="facilitator-menu" /> : null;
    }
}));

import { rainbowSurgePalette } from "@mui/x-charts/colorPalettes";
import { Group, Placement, Student, TimeWindow } from "../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import { PlanGroupCard } from "./PlanGroupCard";

const service = CETimeWindowService.getInstance();
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({
    start_date_time: service.localTimeToUTC(day, `${from}:00`, DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, `${to}:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;

const member = (id: string, name: string, city: string, country: string, anchor = false): Placement =>
    ({ plan_id: "p", student_id: id, group_id: "g1", anchor, priority: 0, student: { id, name, city, country } as Student }) as Placement;

const group = (overrides: Partial<Group> = {}) =>
    ({ id: "g1", name: "Group 1", time_windows: [pt(0, "17:00", "21:00"), pt(2, "08:00", "10:00")], assignments: [], ...overrides }) as Group;

const members = [
    member("a", "Zoe Ng", "Lima", "Peru"),
    member("b", "Ali Hassan", "Cairo", "Egypt"),
    member("c", "Maria Lopez", "Lima", "Peru", true),
    member("d", "Omar K", "Giza", "Egypt")
];

/** The big number above the label, in the summary. */
const statOf = (summary: HTMLElement, label: string) =>
    (within(summary).getByText(label).parentElement!.querySelector("p")!.textContent);

const renderCard = (props: Partial<React.ComponentProps<typeof PlanGroupCard>> = {}) => {
    const handlers = { onSeeDetails: vi.fn(), onChangeGroup: vi.fn(), onToggleAnchor: vi.fn() };
    render(<PlanGroupCard group={group()} placements={members} {...handlers} {...props} />);
    return handlers;
};

describe("PlanGroupCard", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("is a card named for the group, with its facilitators", () => {
        renderCard({ group: group({ assignments: [{ facilitator: { name: "Sam" } }, { facilitator: { name: "Priya" } }] as Group["assignments"] }) });
        const card = screen.getByRole("article", { name: "Group 1" });
        expect(within(card).getByRole("heading", { name: "Group 1" })).toBeTruthy();
        expect(within(card).getByText("Facilitator: Sam, Priya")).toBeTruthy();
    });

    it("says when there is no facilitator yet", () => {
        renderCard();
        expect(screen.getByText("No facilitator yet")).toBeTruthy();
    });

    it("summarizes the group: students, countries, and shared time", () => {
        renderCard();
        const summary = screen.getByRole("region", { name: "Group summary" });
        expect(statOf(summary, "students")).toBe("4");
        expect(statOf(summary, "countries")).toBe("2");
        expect(statOf(summary, "hours shared")).toBe("6");
    });

    it("no longer shows the numbers as chips in the header", () => {
        renderCard();
        const header = screen.getByRole("heading", { name: "Group 1" }).parentElement!.parentElement!;
        expect(header.querySelector(".MuiChip-root")).toBeNull();
        expect(within(header).queryByText(/shared/)).toBeNull();
    });

    it("has the summary in its own tinted container, in the same row as the countries chart and calendar, to the right of them", () => {
        renderCard();
        const summary = screen.getByRole("region", { name: "Group summary" });
        const row = document.querySelector('[data-part="summary-row"]')!;
        expect(row.contains(summary)).toBe(true);
        const calendar = screen.getByRole("img", { name: /^Group 1 shared time/ });
        expect(Boolean(calendar.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        // the same tint as the totals of a plan
        expect(getComputedStyle(summary).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    });

    it("shows a bar of the gender split, in the order female, male, other", () => {
        const genders = ["Female", "Male", "female", "Nonbinary"];
        renderCard({ placements: members.map((m, i) => ({ ...m, student: { ...m.student, gender: genders[i] } }) as Placement) });
        const bar = screen.getByRole("img", { name: "Gender split: 2 female, 1 male, 1 other" });
        const parts = Array.from(bar.querySelectorAll("[data-gender]")).map(part => `${part.getAttribute("data-gender")}:${part.getAttribute("data-count")}`);
        expect(parts).toEqual(["female:2", "male:1", "other:1"]);
        expect(within(screen.getByRole("list", { name: "Gender counts" })).getAllByRole("listitem").map(li => li.textContent)).toEqual(["Female 2", "Male 1", "Other 1"]);
    });

    it("colors the gender bar and its key with the same colors as the MUI X charts: blue, orange, red", () => {
        const genders = ["Female", "Male", "Nonbinary", "Female"];
        renderCard({ placements: members.map((m, i) => ({ ...m, student: { ...m.student, gender: genders[i] } }) as Placement) });
        const rgb = (hex: string) => {
            const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
            return `rgb(${r}, ${g}, ${b})`;
        };
        const [blue, orange, red] = rainbowSurgePalette("light");
        const bar = screen.getByRole("img", { name: /^Gender split/ });
        const fills = Array.from(bar.querySelectorAll("[data-gender]")).map(part => getComputedStyle(part).backgroundColor);
        expect(fills).toEqual([rgb(blue), rgb(orange), rgb(red)]);
        // each dot in the key is the color of its part of the bar
        const dots = within(screen.getByRole("list", { name: "Gender counts" })).getAllByRole("listitem").map(li => getComputedStyle(li.firstElementChild!).backgroundColor);
        expect(dots).toEqual(fills);
    });

    it("leaves out a gender nobody in the group has, and says so for an empty group", () => {
        renderCard({ placements: members.map(m => ({ ...m, student: { ...m.student, gender: "Male" } }) as Placement) });
        expect(screen.getByRole("img", { name: "Gender split: 4 male" }).querySelectorAll("[data-gender]").length).toBe(1);
        cleanup();
        renderCard({ placements: [] });
        expect(screen.getByRole("img", { name: "Gender split: no students" })).toBeTruthy();
    });

    it("says 1 student and 1 country in the singular", () => {
        renderCard({ placements: [members[0]] });
        const summary = screen.getByRole("region", { name: "Group summary" });
        expect(statOf(summary, "student")).toBe("1");
        expect(statOf(summary, "country")).toBe("1");
    });

    it("lists the students as compact cards, anchors first and then by name", () => {
        renderCard();
        const names = Array.from(document.querySelectorAll("[data-student]")).map(card => within(card as HTMLElement).getAllByText(/.+/)[0].textContent);
        expect(names).toEqual(["Maria Lopez", "Ali Hassan", "Omar K", "Zoe Ng"]);
        expect(screen.getAllByText("Anchor")).toHaveLength(1);
    });

    it("says so when the group has no students", () => {
        renderCard({ placements: [] });
        expect(screen.getByText("No students in this group yet.")).toBeTruthy();
        expect(statOf(screen.getByRole("region", { name: "Group summary" }), "students")).toBe("0");
    });

    it("shows the days available, with their times in brackets, beside the calendar's title", () => {
        renderCard();
        expect(screen.getByText("Days available:").textContent).toBe("Days available: Fri (5pm to 9pm), Sun (8am to 10am)");
        expect(screen.getByText("Shared time")).toBeTruthy();
        expect(screen.getByRole("img", { name: "Group 1 shared time: Fri 5pm to 9pm, Sun 8am to 10am (Pacific time)" })).toBeTruthy();
    });

    it("does not repeat the times in a summary under the calendar", () => {
        renderCard();
        expect(screen.queryByText("Fri 5pm to 9pm, Sun 8am to 10am")).toBeNull();
    });

    it("draws a day with no shared time narrow", () => {
        const { container } = render(<PlanGroupCard group={group()} placements={members} onSeeDetails={vi.fn()} onChangeGroup={vi.fn()} onToggleAnchor={vi.fn()} />);
        const widths = Array.from(container.querySelectorAll("[data-width]")).map(day => day.getAttribute("data-width"));
        expect(widths).toEqual(["full", "narrow", "full"]);
    });

    it("has the countries chart at the left of the shared time, and the students below both", () => {
        renderCard();
        const countries = screen.getByTestId("pie-chart");
        const calendar = screen.getByRole("img", { name: /^Group 1 shared time/ });
        const student = document.querySelector("[data-student]")!;
        expect(Boolean(countries.compareDocumentPosition(calendar) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        expect(Boolean(calendar.compareDocumentPosition(student) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        // the chart and the calendar share a row, and the students are not in it
        const row = document.querySelector('[data-part="summary-row"]')!;
        expect(row.contains(countries)).toBe(true);
        expect(row.contains(calendar)).toBe(true);
        expect(row.contains(student)).toBe(false);
    });

    it("says so, in red, when the group shares no time", () => {
        renderCard({ group: group({ time_windows: [] }) });
        const summary = screen.getByRole("region", { name: "Group summary" });
        const none = within(summary).getByText("No shared time");
        expect(none.parentElement!.getAttribute("data-stat")).toBe("No shared time");
        expect(getComputedStyle(none).color).not.toBe(getComputedStyle(within(summary).getByText("students")).color);
        expect(screen.getByText("Days available:").textContent).toBe("Days available: None");
        expect(screen.getByRole("img", { name: "Group 1 shared time: No shared time (Pacific time)" })).toBeTruthy();
    });

    it("draws a pie chart of the countries, a slice for each with how many students are from it", () => {
        renderCard();
        const pie = JSON.parse(screen.getByTestId("pie-chart").dataset.props!);
        // in the order of the most students, and then as the students are listed: Maria, the anchor, is from Peru
        expect(pie.series[0].data.map((slice: { label: string, value: number }) => [slice.label, slice.value])).toEqual([["Peru", 2], ["Egypt", 2]]);
    });

    it("draws no countries chart for a group with no students", () => {
        renderCard({ placements: [] });
        expect(screen.queryByTestId("pie-chart")).toBeNull();
    });

    it("passes on what is chosen from a student's menu", () => {
        const { onSeeDetails, onChangeGroup } = renderCard();
        fireEvent.click(screen.getByRole("button", { name: "More actions for Zoe Ng" }));
        fireEvent.click(screen.getByRole("menuitem", { name: "See details" }));
        expect(onSeeDetails).toHaveBeenCalledWith(members[0]);
        fireEvent.click(screen.getByRole("button", { name: "More actions for Ali Hassan" }));
        fireEvent.click(screen.getByRole("menuitem", { name: "Change group" }));
        expect(onChangeGroup).toHaveBeenCalledWith(members[1]);
    });

    it("has a menu for the group's facilitators", () => {
        renderCard();
        expect(screen.queryByTestId("facilitator-menu")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Group actions for Group 1" }));
        expect(screen.getByTestId("facilitator-menu")).toBeTruthy();
    });

    describe("Countries and Shared time", () => {
        const section = (name: string) => screen.getByRole("region", { name });

        it("each have a container with a title", () => {
            renderCard();
            expect(within(section("Countries")).getByRole("heading", { name: "Countries" })).toBeTruthy();
            expect(within(section("Shared time")).getByRole("heading", { name: "Shared time" })).toBeTruthy();
            expect(section("Countries").className).toMatch(/MuiPaper-outlined/);
            expect(section("Shared time").className).toMatch(/MuiPaper-outlined/);
        });

        it("have the pie chart in Countries, and the calendar and days available in Shared time", () => {
            renderCard();
            expect(within(section("Countries")).getByTestId("pie-chart")).toBeTruthy();
            expect(within(section("Shared time")).getByRole("img", { name: /^Group 1 shared time/ })).toBeTruthy();
            expect(within(section("Shared time")).getByText("Days available:")).toBeTruthy();
        });

        it("are side by side in one row, with the students below", () => {
            renderCard();
            const row = document.querySelector('[data-part="summary-row"]')!;
            expect(row.contains(section("Countries"))).toBe(true);
            expect(row.contains(section("Shared time"))).toBe(true);
            expect(Boolean(section("Countries").compareDocumentPosition(section("Shared time")) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
            expect(row.contains(document.querySelector("[data-student]")!)).toBe(false);
        });

        it("are both plain white containers", () => {
            renderCard();
            expect(getComputedStyle(section("Countries")).backgroundColor).toBe(getComputedStyle(section("Shared time")).backgroundColor);
            expect(getComputedStyle(section("Countries")).backgroundColor).not.toBe("rgb(42, 45, 50)");
        });

        it("has the calendar fill the height of the Shared time container", () => {
            renderCard();
            const calendar = within(section("Shared time")).getByRole("img", { name: /^Group 1 shared time/ });
            // the calendar is as tall as its container, and its strips take the height left under the days
            expect(getComputedStyle(calendar.parentElement!).height).toBe("100%");
            expect(getComputedStyle(calendar).flexGrow).toBe("1");
            expect(getComputedStyle(calendar.querySelector("[data-day]")!).flexGrow).toBe("1");
        });

        it("shrink the calendar to the parts of the day that have shared time", () => {
            renderCard();
            expect(within(section("Shared time")).getByRole("img", { name: /^Group 1 shared time/ }).getAttribute("data-bands")).toBe("morning,evening");
        });
    });
});
