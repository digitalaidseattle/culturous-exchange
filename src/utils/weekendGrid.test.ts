/**
 *  weekendGrid.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { TimeWindow } from "../api/types";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import {
    TIME_BANDS,
    axisLabels,
    bandsWithTime,
    buildScale,
    placeSegments,
    describeDays,
    describeSegments,
    daysWithTime,
    formatHour,
    formatHours,
    gridHours,
    mergeSegments,
    sharedWindows,
    toWeekendSegments
} from "./weekendGrid";

const service = CETimeWindowService.getInstance();
const at = (day: 0 | 1 | 2, time: string, timezone = DEFAULT_TIMEZONE) => service.localTimeToUTC(day, `${time}:00`, timezone);
/** a window on a Pacific time day, from "09:00" to "13:30" */
const pt = (day: 0 | 1 | 2, from: string, to: string) => ({ start_date_time: at(day, from), end_date_time: at(day, to) }) as TimeWindow;

describe("toWeekendSegments", () => {
    it("places a window on its day, in hours since midnight Pacific time", () => {
        const [fri, sat, sun] = toWeekendSegments([pt(0, "09:00", "13:30"), pt(2, "17:00", "21:00")]);
        expect(fri).toEqual([{ start: 9, end: 13.5 }]);
        expect(sat).toEqual([]);
        expect(sun).toEqual([{ start: 17, end: 21 }]);
    });

    it("cuts windows to the 7am to 10pm the calendar shows", () => {
        const [fri] = toWeekendSegments([{ start_date_time: at(0, "05:00"), end_date_time: at(0, "23:30") } as TimeWindow]);
        expect(fri).toEqual([{ start: 7, end: 22 }]);
    });

    it("drops time outside Friday to Sunday", () => {
        // Thursday evening Pacific time, and Monday morning
        const thursday = { start_date_time: new Date(at(0, "07:00").getTime() - 5 * 3600_000), end_date_time: new Date(at(0, "07:00").getTime() - 1 * 3600_000) } as TimeWindow;
        const monday = { start_date_time: at(2, "23:00"), end_date_time: new Date(at(2, "23:00").getTime() + 6 * 3600_000) } as TimeWindow;
        expect(toWeekendSegments([thursday, monday]).flat()).toEqual([]);
    });

    it("places a student's time on the Pacific time day it falls on, not the student's own day", () => {
        // Friday 7am to noon in Cairo is Thursday night to Friday 2am Pacific time: only the part after midnight is Friday, and it is before 7am
        const cairo = { start_date_time: at(0, "07:00", "Africa/Cairo"), end_date_time: at(0, "12:00", "Africa/Cairo") } as TimeWindow;
        expect(toWeekendSegments([cairo]).flat()).toEqual([]);
        // Friday 4pm to 10pm in Cairo is Friday 6am to noon Pacific time
        const evening = { start_date_time: at(0, "16:00", "Africa/Cairo"), end_date_time: at(0, "22:00", "Africa/Cairo") } as TimeWindow;
        expect(toWeekendSegments([evening])[0]).toEqual([{ start: 7, end: 12 }]);
    });

    it("joins windows that touch or overlap, and copes with no windows", () => {
        expect(toWeekendSegments([pt(1, "08:00", "10:00"), pt(1, "10:00", "12:00"), pt(1, "11:00", "13:00")])[1]).toEqual([{ start: 8, end: 13 }]);
        expect(toWeekendSegments(undefined)).toEqual([[], [], []]);
        expect(toWeekendSegments(null)).toEqual([[], [], []]);
    });
});

describe("mergeSegments", () => {
    it("sorts, and leaves a gap between separate stretches", () => {
        expect(mergeSegments([{ start: 14, end: 16 }, { start: 8, end: 10 }])).toEqual([{ start: 8, end: 10 }, { start: 14, end: 16 }]);
    });
});

describe("formatHour", () => {
    it.each([[7, "7am"], [12, "12pm"], [13.5, "1:30pm"], [22, "10pm"], [9.25, "9:15am"], [0, "12am"]])("%s is %s", (hour, text) => {
        expect(formatHour(hour)).toBe(text);
    });
});

describe("describing times", () => {
    it("names the days and hours, and says so when there are none", () => {
        const segments = toWeekendSegments([pt(0, "09:00", "13:00"), pt(2, "08:00", "10:00"), pt(2, "14:00", "16:00")]);
        expect(describeSegments(segments)).toBe("Fri 9am to 1pm, Sun 8am to 10am and 2pm to 4pm");
        expect(describeSegments([[], [], []], "no shared time")).toBe("no shared time");
        expect(daysWithTime(segments)).toEqual(["Fri", "Sun"]);
    });

    it("names the days with their times in brackets", () => {
        const segments = toWeekendSegments([pt(0, "09:00", "13:00"), pt(2, "08:00", "10:00"), pt(2, "14:00", "16:00")]);
        expect(describeDays(segments)).toBe("Fri (9am to 1pm), Sun (8am to 10am, 2pm to 4pm)");
        expect(describeDays([[], [], []])).toBe("None");
        expect(describeDays([[], [], []], "Nothing")).toBe("Nothing");
    });

    it("counts the real hours shown on the calendar", () => {
        expect(gridHours([pt(0, "09:00", "13:30"), pt(1, "10:00", "11:00")])).toBe(5.5);
        expect(gridHours(undefined)).toBe(0);
    });

    it("writes hours in words", () => {
        expect(formatHours(6)).toBe("6 hours");
        expect(formatHours(1)).toBe("1 hour");
        expect(formatHours(0.5)).toBe("30 minutes");
        expect(formatHours(1.5)).toBe("1.5 hours");
        expect(formatHours(0)).toBe("0 hours");
    });
});

describe("sharedWindows", () => {
    it("is the time both have", () => {
        const shared = sharedWindows([pt(0, "09:00", "15:00")], [pt(0, "12:00", "18:00"), pt(1, "09:00", "10:00")]);
        expect(gridHours(shared)).toBe(3);
    });

    it("is nothing when either has no windows, or they do not meet", () => {
        expect(sharedWindows([], [pt(0, "09:00", "10:00")])).toEqual([]);
        expect(sharedWindows(undefined, [pt(0, "09:00", "10:00")])).toEqual([]);
        expect(sharedWindows([pt(0, "09:00", "10:00")], [pt(0, "11:00", "12:00")])).toEqual([]);
    });
});

describe("bandsWithTime", () => {
    const names = (windows: TimeWindow[]) => bandsWithTime(toWeekendSegments(windows)).map(band => band.name);

    it("keeps the parts of the day that have time in them, on any day", () => {
        expect(names([pt(0, "08:00", "10:00")])).toEqual(["morning"]);
        expect(names([pt(0, "08:00", "10:00"), pt(2, "18:00", "20:00")])).toEqual(["morning", "evening"]);
        expect(names([pt(1, "13:00", "14:00")])).toEqual(["afternoon"]);
    });

    it("keeps both parts that a stretch of time runs across", () => {
        expect(names([pt(0, "11:00", "13:00")])).toEqual(["morning", "afternoon"]);
    });

    it("does not count time that only touches a part of the day", () => {
        expect(names([pt(0, "10:00", "12:00")])).toEqual(["morning"]);
        expect(names([pt(0, "12:00", "14:00")])).toEqual(["afternoon"]);
    });

    it("keeps every part when there is no time at all", () => {
        expect(names([])).toEqual(["morning", "afternoon", "evening"]);
    });

    it("has morning, afternoon and evening that fill the day from 7am to 10pm", () => {
        expect(TIME_BANDS.map(band => [band.start, band.end])).toEqual([[7, 12], [12, 17], [17, 22]]);
    });
});

describe("buildScale", () => {
    it("spreads one part of the day over the whole height", () => {
        const scale = buildScale([TIME_BANDS[0]], 100);
        expect(scale.pxPerHour).toBe(20);
        expect(scale.runs).toEqual([{ start: 7, end: 12, top: 0, height: 100 }]);
        expect(scale.breaks).toEqual([]);
    });

    it("joins parts that touch into one stretch, with no mark between them", () => {
        const scale = buildScale([TIME_BANDS[0], TIME_BANDS[1]], 100);
        expect(scale.runs).toEqual([{ start: 7, end: 17, top: 0, height: 100 }]);
        expect(scale.breaks).toEqual([]);
    });

    it("puts a mark between parts with a part left out between them, and still fills the height", () => {
        const scale = buildScale([TIME_BANDS[0], TIME_BANDS[2]], 106);
        expect(scale.breaks).toEqual([{ top: 50, height: 6 }]);
        expect(scale.runs).toEqual([{ start: 7, end: 12, top: 0, height: 50 }, { start: 17, end: 22, top: 56, height: 50 }]);
        const last = scale.runs[scale.runs.length - 1];
        expect(last.top + last.height).toBe(106);
    });

    it("draws all three parts at the same scale as the whole day", () => {
        const scale = buildScale(TIME_BANDS, 150);
        expect(scale.pxPerHour).toBe(10);
        expect(scale.runs).toHaveLength(1);
    });
});

describe("placeSegments", () => {
    it("puts a segment at its place in the strip", () => {
        const scale = buildScale([TIME_BANDS[0]], 100);
        expect(placeSegments([{ start: 8, end: 10 }], scale)).toEqual([{ start: 8, end: 10, top: 20, height: 40, roundTop: true, roundBottom: true }]);
    });

    it("cuts a segment to the hours shown, and does not round the cut ends", () => {
        const scale = buildScale([TIME_BANDS[0], TIME_BANDS[2]], 106);
        const placed = placeSegments([{ start: 11, end: 18 }], scale);
        expect(placed).toEqual([
            { start: 11, end: 12, top: 40, height: 10, roundTop: true, roundBottom: false },
            { start: 17, end: 18, top: 56, height: 10, roundTop: false, roundBottom: true }
        ]);
    });

    it("draws a segment across parts that touch as one", () => {
        const scale = buildScale([TIME_BANDS[0], TIME_BANDS[1]], 100);
        expect(placeSegments([{ start: 10, end: 14 }], scale)).toHaveLength(1);
    });

    it("leaves out a segment that is entirely in a part that is not shown", () => {
        const scale = buildScale([TIME_BANDS[0]], 100);
        expect(placeSegments([{ start: 13, end: 15 }], scale)).toEqual([]);
    });
});

describe("axisLabels", () => {
    const hours = (bands: typeof TIME_BANDS, height = 84) => axisLabels(buildScale(bands, height), bands).map(label => label.hour);

    it("names only the edges of the parts of the day when the whole day is shown", () => {
        expect(hours(TIME_BANDS)).toEqual([7, 12, 17, 22]);
    });

    it("names every hour when one part of the day is drawn large", () => {
        expect(hours([TIME_BANDS[0]])).toEqual([7, 8, 9, 10, 11, 12]);
    });

    it("names some hours between when two parts are drawn at a middle size", () => {
        const named = hours([TIME_BANDS[0], TIME_BANDS[1]]);
        expect(named).toEqual(expect.arrayContaining([7, 12, 17]));
        expect(named.length).toBeGreaterThan(3);
        expect(named.length).toBeLessThan(10);
    });

    it("never puts two labels closer than they can be read, except at a mark where hours were skipped", () => {
        const scale = buildScale([TIME_BANDS[0], TIME_BANDS[2]], 84);
        const labels = axisLabels(scale, [TIME_BANDS[0], TIME_BANDS[2]]);
        for (let i = 1; i < labels.length; i++) {
            const gap = labels[i].top - labels[i - 1].top;
            // the two labels at the mark hang away from it, one above and one below, so they can be close
            const atMark = labels[i - 1].anchor === "above" && labels[i].anchor === "below";
            expect(gap >= 14 || atMark).toBe(true);
        }
    });

    it("hangs the label at a stretch's start below its line, and its end above, so labels at a mark do not overlap", () => {
        const bands = [TIME_BANDS[0], TIME_BANDS[2]];
        const labels = axisLabels(buildScale(bands, 84), bands);
        expect(labels.find(label => label.hour === 7)!.anchor).toBe("below");
        expect(labels.find(label => label.hour === 12)!.anchor).toBe("above");
        expect(labels.find(label => label.hour === 17)!.anchor).toBe("below");
        expect(labels.find(label => label.hour === 22)!.anchor).toBe("above");
    });
});
