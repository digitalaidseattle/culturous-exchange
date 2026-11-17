/**
 *  AvailabilityCalendar.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { createTheme, ThemeProvider } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimeWindow } from "../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const service = CETimeWindowService.getInstance();
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({
    start_date_time: service.localTimeToUTC(day, `${from}:00`, DEFAULT_TIMEZONE),
    end_date_time: service.localTimeToUTC(day, `${to}:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;

const bars = (container: HTMLElement, kind: string) =>
    Array.from(container.querySelectorAll(`[data-kind="${kind}"]`)).map(bar => ({
        day: bar.closest("[data-day]")!.getAttribute("data-day"),
        start: Number(bar.getAttribute("data-start")),
        end: Number(bar.getAttribute("data-end"))
    }));

describe("AvailabilityCalendar", () => {
    it("shows Friday, Saturday and Sunday", () => {
        const { container } = render(<AvailabilityCalendar label="Group 1" highlight={[]} />);
        expect(Array.from(container.querySelectorAll("[data-day]")).map(d => d.getAttribute("data-day"))).toEqual(["Fri", "Sat", "Sun"]);
        expect(screen.getByText("Fri")).toBeTruthy();
        expect(screen.getByText("Sat")).toBeTruthy();
        expect(screen.getByText("Sun")).toBeTruthy();
    });

    it("draws shared time as solid bars on the days they fall on", () => {
        const { container } = render(<AvailabilityCalendar label="Group 1" highlight={[pt(0, "17:00", "21:00"), pt(2, "08:00", "10:30")]} />);
        expect(bars(container, "shared")).toEqual([
            { day: "Fri", start: 17, end: 21 },
            { day: "Sun", start: 8, end: 10.5 }
        ]);
        expect(bars(container, "free")).toEqual([]);
    });

    it("draws free time as a pale band under the shared time", () => {
        // the shared time spans the morning and afternoon, so both are shown; the evening is not, and the band stops where it starts
        const { container } = render(<AvailabilityCalendar label="Student" windows={[pt(1, "08:00", "20:00")]} highlight={[pt(1, "10:00", "14:00")]} />);
        expect(bars(container, "free")).toEqual([{ day: "Sat", start: 8, end: 17 }]);
        expect(bars(container, "shared")).toEqual([{ day: "Sat", start: 10, end: 14 }]);
    });

    it("describes the shared time to screen readers, with the time zone", () => {
        render(<AvailabilityCalendar label="Group 1 shared time" highlight={[pt(0, "09:00", "13:00"), pt(2, "14:00", "16:00")]} />);
        expect(screen.getByRole("img", { name: "Group 1 shared time: Fri 9am to 1pm, Sun 2pm to 4pm (Pacific time)" })).toBeTruthy();
    });

    it("says so in words when nothing is shared", () => {
        render(<AvailabilityCalendar label="Group 2" highlight={[]} noneLabel="No shared time" />);
        expect(screen.getByRole("img", { name: "Group 2: No shared time (Pacific time)" })).toBeTruthy();
    });

    it("describes the free time when there is nothing to highlight against", () => {
        render(<AvailabilityCalendar label="Maria availability" windows={[pt(1, "08:00", "12:00")]} />);
        expect(screen.getByRole("img", { name: "Maria availability: Sat 8am to 12pm (Pacific time)" })).toBeTruthy();
    });

    it("shows an hour scale and a key in the larger sizes, and neither in mini", () => {
        const { rerender } = render(<AvailabilityCalendar label="G" size="full" windows={[]} highlight={[]} windowsLabel="Free" highlightLabel="Shared" />);
        expect(screen.getByText("Free")).toBeTruthy();
        expect(screen.getByText("Shared")).toBeTruthy();
        expect(screen.getByText("7am")).toBeTruthy();
        expect(screen.getByText("10pm")).toBeTruthy();
        rerender(<AvailabilityCalendar label="G" size="mini" windows={[]} highlight={[]} windowsLabel="Free" highlightLabel="Shared" />);
        expect(screen.queryByText("Free")).toBeNull();
        expect(screen.queryByText("7am")).toBeNull();
    });

    describe("days with no shared time", () => {
        const widths = (container: HTMLElement) => Array.from(container.querySelectorAll("[data-width]")).map(day => day.getAttribute("data-width"));
        const weights = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-width]")).map(day => day.style.flexGrow || getComputedStyle(day).flexGrow);

        it("are drawn narrow, and the days with time in them full width", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "09:00", "11:00"), pt(2, "09:00", "11:00")]} />);
            expect(widths(container)).toEqual(["full", "narrow", "full"]);
        });

        it("are a quarter as wide as a day with shared time", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "09:00", "11:00")]} />);
            expect(weights(container)).toEqual(["4", "1", "1"]);
        });

        it("leave every day full width when they all have time", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "09:00", "11:00"), pt(1, "09:00", "11:00"), pt(2, "09:00", "11:00")]} />);
            expect(widths(container)).toEqual(["full", "full", "full"]);
        });

        it("leave every day the same width when none has time", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[]} />);
            expect(weights(container)).toEqual(["1", "1", "1"]);
        });

        it("are judged by the free time when there is no shared time to point at", () => {
            const { container } = render(<AvailabilityCalendar label="Student" windows={[pt(1, "09:00", "11:00")]} />);
            expect(widths(container)).toEqual(["narrow", "full", "narrow"]);
        });

        it("keep their width in the smallest calendar, which has no room to spare", () => {
            const { container } = render(<AvailabilityCalendar label="G" size="mini" highlight={[pt(0, "09:00", "11:00")]} />);
            expect(widths(container)).toEqual(["full", "full", "full"]);
        });
    });

    it("draws the shared time in the theme's blue", () => {
        const { container } = render(<ThemeProvider theme={createTheme({ palette: { primary: { main: "#1677ff" } } })}><AvailabilityCalendar label="G" highlight={[pt(0, "09:00", "11:00")]} /></ThemeProvider>);
        const bar = container.querySelector('[data-kind="shared"]')!;
        expect(getComputedStyle(bar).backgroundColor).toBe("rgb(22, 119, 255)");
    });

    describe("parts of the day with no shared time", () => {
        const bandsOf = (container: HTMLElement) => container.querySelector("[data-bands]")!.getAttribute("data-bands");
        const labelsOf = (container: HTMLElement) => Array.from(container.querySelectorAll("[data-hour]")).map(label => label.textContent);
        const px = (element: Element, property: "top" | "height") => parseFloat(getComputedStyle(element)[property]);

        it("are left out, and the parts with time are kept", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "08:00", "10:00"), pt(2, "17:00", "20:00")]} />);
            expect(bandsOf(container)).toBe("morning,evening");
        });

        it("are judged across all three days", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "08:00", "10:00"), pt(1, "13:00", "14:00"), pt(2, "19:00", "20:00")]} />);
            expect(bandsOf(container)).toBe("morning,afternoon,evening");
        });

        it("show the hours that are left larger, in the same height", () => {
            // 7am to noon is a third of the full day, so it gets the whole strip instead of a third of it
            const { container } = render(<AvailabilityCalendar label="G" size="compact" highlight={[pt(0, "07:00", "12:00")]} />);
            expect(bandsOf(container)).toBe("morning");
            const bar = container.querySelector('[data-kind="shared"]')!;
            expect(px(bar, "top")).toBe(0);
            expect(px(bar, "height")).toBe(84);
        });

        it("name the hours down the side more finely when they are drawn larger", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "07:00", "12:00")]} />);
            expect(labelsOf(container)).toEqual(["7am", "8am", "9am", "10am", "11am", "12pm"]);
        });

        it("name only the edges of the parts of the day when all of them are shown", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[]} />);
            expect(bandsOf(container)).toBe("morning,afternoon,evening");
            expect(labelsOf(container)).toEqual(["7am", "12pm", "5pm", "10pm"]);
        });

        it("are all shown when there is no shared time at all", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[]} />);
            expect(bandsOf(container)).toBe("morning,afternoon,evening");
            expect(container.querySelectorAll("[data-break]")).toHaveLength(0);
        });

        it("leave a mark between two parts that are shown with a part left out between them", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "08:00", "10:00"), pt(0, "18:00", "20:00")]} />);
            // 3 break marks, one for each day's strip
            expect(container.querySelectorAll("[data-break]")).toHaveLength(3);
            // the labels on either side of the mark do not sit on top of each other
            expect(labelsOf(container)).toEqual(expect.arrayContaining(["12pm", "5pm"]));
        });

        it("leave no mark between parts that touch", () => {
            const { container } = render(<AvailabilityCalendar label="G" highlight={[pt(0, "10:00", "14:00")]} />);
            expect(bandsOf(container)).toBe("morning,afternoon");
            expect(container.querySelectorAll("[data-break]")).toHaveLength(0);
        });

        it("keep every part of the day in the smallest calendar", () => {
            const { container } = render(<AvailabilityCalendar label="G" size="mini" highlight={[pt(0, "08:00", "10:00")]} />);
            expect(bandsOf(container)).toBe("morning,afternoon,evening");
        });

        it("are judged by the free time when there is no shared time to point at", () => {
            const { container } = render(<AvailabilityCalendar label="Student" windows={[pt(1, "13:00", "16:00")]} />);
            expect(bandsOf(container)).toBe("afternoon");
        });

        it("still read out the times, whatever is shown", () => {
            render(<AvailabilityCalendar label="Group 1 shared time" highlight={[pt(0, "08:00", "10:00")]} />);
            expect(screen.getByRole("img", { name: "Group 1 shared time: Fri 8am to 10am (Pacific time)" })).toBeTruthy();
        });
    });

    describe("filling its container", () => {
        // no screen in the test runtime, so the height of a strip is made up and passed to the resize watcher
        let stripHeight = 160;
        let resized: () => void = () => { };
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
        beforeEach(() => {
            stripHeight = 160;
            Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return this.hasAttribute("data-day") ? stripHeight : 0; } });
            vi.stubGlobal("ResizeObserver", class {
                constructor(callback: () => void) { resized = callback; }
                observe() { }
                disconnect() { }
            });
        });
        afterEach(() => {
            if (original) { Object.defineProperty(HTMLElement.prototype, "clientHeight", original); }
            vi.unstubAllGlobals();
        });
        const px = (element: Element, property: "top" | "height") => parseFloat(getComputedStyle(element)[property]);

        it("draws the hours at the height the strips really are", () => {
            const { container } = render(<AvailabilityCalendar label="G" fill highlight={[pt(0, "07:00", "12:00")]} />);
            const bar = container.querySelector('[data-kind="shared"]')!;
            expect(px(bar, "top")).toBe(0);
            expect(px(bar, "height")).toBe(160);
        });

        it("draws the hours again when the container changes height", () => {
            const { container } = render(<AvailabilityCalendar label="G" fill highlight={[pt(0, "07:00", "12:00")]} />);
            stripHeight = 220;
            act(() => resized());
            expect(px(container.querySelector('[data-kind="shared"]')!, "height")).toBe(220);
        });

        it("names the hours down the side against the new height", () => {
            const { container } = render(<AvailabilityCalendar label="G" fill highlight={[pt(0, "07:00", "12:00")]} />);
            const tops = Array.from(container.querySelectorAll("[data-hour]")).map(label => px(label, "top"));
            expect(tops[0]).toBe(0);
            expect(tops[tops.length - 1]).toBe(160);
        });

        it("stretches its container, and does not just keep its least height", () => {
            const { container } = render(<AvailabilityCalendar label="G" fill highlight={[]} />);
            const root = container.firstElementChild as HTMLElement;
            expect(getComputedStyle(root).height).toBe("100%");
            expect(getComputedStyle(container.querySelector("[data-day]")!).flexGrow).toBe("1");
        });

        it("is a fixed height when it is not asked to fill", () => {
            const { container } = render(<AvailabilityCalendar label="G" size="compact" highlight={[]} />);
            expect(getComputedStyle(container.querySelector("[data-day]")!).height).toBe("84px");
        });
    });
});
