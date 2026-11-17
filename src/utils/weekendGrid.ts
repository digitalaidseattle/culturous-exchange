/**
 *  weekendGrid.ts
 *
 *  Turns time windows into the little weekend calendar: Friday, Saturday and Sunday, from 7am to
 *  10pm Pacific time. That is the span groups are scheduled in (a group starts with every
 *  Friday to Sunday hour in this span free, and each student's windows narrow it), so anything
 *  outside it is not shown.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { TimeWindow } from "../api/types";
import { ENDING_HOUR, STARTING_HOUR } from "../constants";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";

export const GRID_DAYS = ['Fri', 'Sat', 'Sun'] as const;
export const GRID_START_HOUR = STARTING_HOUR;
export const GRID_END_HOUR = ENDING_HOUR;
/** The time zone the calendar is drawn in, as the plan's other time windows are. */
export const GRID_TIME_ZONE_LABEL = 'Pacific time';

const HOUR_MS = 60 * 60 * 1000;

/** A stretch of one day, in hours since midnight: 9 to 13.5 is 9am to 1:30pm. */
export type DaySegment = { start: number, end: number };

/** The segments of each day, Friday first. */
export type WeekendSegments = DaySegment[][];

const timeWindowService = () => CETimeWindowService.getInstance();

/** Where each window falls on the Friday, Saturday and Sunday of the grid, cut to the hours shown. */
export function toWeekendSegments(windows: TimeWindow[] | undefined | null): WeekendSegments {
    return GRID_DAYS.map((_day, dayOffset) => {
        const open = timeWindowService().localTimeToUTC(dayOffset, `${GRID_START_HOUR}:00:00`, DEFAULT_TIMEZONE).getTime();
        const close = timeWindowService().localTimeToUTC(dayOffset, `${GRID_END_HOUR}:00:00`, DEFAULT_TIMEZONE).getTime();
        const segments: DaySegment[] = [];
        (windows ?? []).forEach(window => {
            const start = Math.max(new Date(window.start_date_time).getTime(), open);
            const end = Math.min(new Date(window.end_date_time).getTime(), close);
            if (end > start) {
                segments.push({
                    start: GRID_START_HOUR + (start - open) / HOUR_MS,
                    end: GRID_START_HOUR + (end - open) / HOUR_MS
                });
            }
        });
        return mergeSegments(segments);
    });
}

/** The segments in order, with any that touch or overlap joined into one. */
export function mergeSegments(segments: DaySegment[]): DaySegment[] {
    const merged: DaySegment[] = [];
    [...segments].sort((a, b) => a.start - b.start).forEach(segment => {
        const last = merged[merged.length - 1];
        if (last && segment.start <= last.end) {
            last.end = Math.max(last.end, segment.end);
        } else {
            merged.push({ ...segment });
        }
    });
    return merged;
}

/** 7 is "7am", 12 is "12pm", 13.5 is "1:30pm", 22 is "10pm". */
export function formatHour(hour: number): string {
    const whole = Math.floor(hour);
    const minutes = Math.round((hour - whole) * 60);
    const suffix = whole >= 12 && whole < 24 ? 'pm' : 'am';
    const twelve = whole % 12 === 0 ? 12 : whole % 12;
    return minutes === 0 ? `${twelve}${suffix}` : `${twelve}:${String(minutes).padStart(2, '0')}${suffix}`;
}

/** "9am to 1pm" */
export function formatSegment(segment: DaySegment): string {
    return `${formatHour(segment.start)} to ${formatHour(segment.end)}`;
}

/** The hours in the segments, all days together. */
export function segmentHours(segments: WeekendSegments): number {
    return segments.flat().reduce((total, segment) => total + (segment.end - segment.start), 0);
}

/** The days that have any time in them, as "Fri", "Sat", "Sun". */
export function daysWithTime(segments: WeekendSegments): string[] {
    return GRID_DAYS.filter((_day, index) => segments[index].length > 0);
}

/** "Fri 9am to 1pm, Sat 8am to 10am and 2pm to 4pm", or "no shared time". */
export function describeSegments(segments: WeekendSegments, none = 'no time'): string {
    const parts = GRID_DAYS
        .map((day, index) => segments[index].length > 0 ? `${day} ${segments[index].map(formatSegment).join(' and ')}` : '')
        .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : none;
}

/** "Fri (5pm to 9pm), Sat (8am to 10am, 2pm to 4pm)": the days that have time, with their times. */
export function describeDays(segments: WeekendSegments, none = 'None'): string {
    const parts = GRID_DAYS
        .map((day, index) => segments[index].length > 0 ? `${day} (${segments[index].map(formatSegment).join(', ')})` : '')
        .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : none;
}

/** The time both lists of windows share. */
export function sharedWindows(a: TimeWindow[] | undefined | null, b: TimeWindow[] | undefined | null): TimeWindow[] {
    if (!a || !b || a.length === 0 || b.length === 0) {
        return [];
    }
    return timeWindowService().intersectionTimeWindowsMultiple(a, b);
}

/** Real hours in the windows, shown on the calendar's grid (so time outside Friday to Sunday, 7am to 10pm does not count). */
export function gridHours(windows: TimeWindow[] | undefined | null): number {
    return parseFloat(segmentHours(toWeekendSegments(windows)).toFixed(2));
}

/** "6 hours", "1 hour", "30 minutes", "1.5 hours". */
export function formatHours(hours: number): string {
    if (hours > 0 && hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    const text = Number.isInteger(hours) ? String(hours) : String(parseFloat(hours.toFixed(2)));
    return `${text} ${hours === 1 ? 'hour' : 'hours'}`;
}

/**
 * The parts of the day, as the students' form asks about them: morning is 7am to noon, afternoon is
 * noon to 5pm, and evening is 5pm to 10pm.
 */
export type TimeBand = { name: 'morning' | 'afternoon' | 'evening', start: number, end: number };
export const TIME_BANDS: TimeBand[] = [
    { name: 'morning', start: GRID_START_HOUR, end: 12 },
    { name: 'afternoon', start: 12, end: 17 },
    { name: 'evening', start: 17, end: GRID_END_HOUR }
];

/**
 * The parts of the day that have any time in them on any day, so the calendar can leave out the
 * rest and show those hours larger. When there is no time at all, every part is kept.
 */
export function bandsWithTime(segments: WeekendSegments): TimeBand[] {
    const used = TIME_BANDS.filter(band => segments.some(day => day.some(segment => segment.start < band.end && segment.end > band.start)));
    return used.length > 0 ? used : TIME_BANDS;
}

/** The height of the mark that shows hours have been left out between two parts of the day that are shown. */
export const BREAK_HEIGHT = 6;

/** A stretch of hours that is drawn without a break: where it starts and ends, and where it is in the strip. */
export type ScaleRun = { start: number, end: number, top: number, height: number };

/** How hours are placed in a strip of a given height, when only some parts of the day are shown. */
export type HourScale = { runs: ScaleRun[], breaks: { top: number, height: number }[], pxPerHour: number, height: number };

/** Places the parts of the day, in order, in a strip of the height. Parts that touch are drawn as one stretch; a gap between them is a break. */
export function buildScale(bands: TimeBand[], height: number): HourScale {
    const stretches: { start: number, end: number }[] = [];
    bands.forEach(band => {
        const last = stretches[stretches.length - 1];
        if (last && last.end === band.start) {
            last.end = band.end;
        } else {
            stretches.push({ start: band.start, end: band.end });
        }
    });
    const hours = stretches.reduce((total, stretch) => total + stretch.end - stretch.start, 0);
    const pxPerHour = (height - (stretches.length - 1) * BREAK_HEIGHT) / hours;
    const runs: ScaleRun[] = [];
    const breaks: HourScale['breaks'] = [];
    let top = 0;
    stretches.forEach((stretch, index) => {
        if (index > 0) {
            breaks.push({ top, height: BREAK_HEIGHT });
            top += BREAK_HEIGHT;
        }
        const runHeight = (stretch.end - stretch.start) * pxPerHour;
        runs.push({ ...stretch, top, height: runHeight });
        top += runHeight;
    });
    return { runs, breaks, pxPerHour, height };
}

/** A segment cut to a stretch of the scale, with where it is drawn, and whether its ends are its own or were cut. */
export type PlacedSegment = DaySegment & { top: number, height: number, roundTop: boolean, roundBottom: boolean };

export function placeSegments(segments: DaySegment[], scale: HourScale): PlacedSegment[] {
    const placed: PlacedSegment[] = [];
    scale.runs.forEach(run => {
        segments.forEach(segment => {
            const start = Math.max(segment.start, run.start);
            const end = Math.min(segment.end, run.end);
            if (end > start) {
                placed.push({
                    start,
                    end,
                    top: run.top + (start - run.start) * scale.pxPerHour,
                    height: (end - start) * scale.pxPerHour,
                    roundTop: start === segment.start,
                    roundBottom: end === segment.end
                });
            }
        });
    });
    return placed;
}

/** The least space between two hour labels, in pixels. */
const LABEL_GAP = 14;

/**
 * The hours to name down the side of the strip. The ends of each stretch, and the edges between
 * parts of the day, are always named. When the hours have been drawn large enough, others are named
 * as well wherever there is room.
 */
/** Where a label sits against its hour: hanging below the line (a stretch's start), standing above it (its end), or centered on it. */
export type AxisLabel = { hour: number, top: number, anchor: 'below' | 'above' | 'center' };

export function axisLabels(scale: HourScale, bands: TimeBand[]): AxisLabel[] {
    const yOf = (hour: number) => {
        const run = scale.runs.find(r => hour >= r.start && hour <= r.end)!;
        return run.top + (hour - run.start) * scale.pxPerHour;
    };
    const named = new Map<number, number>();
    scale.runs.forEach(run => { named.set(run.start, yOf(run.start)); named.set(run.end, yOf(run.end)); });
    bands.forEach(band => { named.set(band.start, yOf(band.start)); named.set(band.end, yOf(band.end)); });
    // hours are drawn large enough to name more than the edges when there is more than about 6 pixels to the hour
    if (scale.pxPerHour > 6) {
        scale.runs.forEach(run => {
            for (let hour = run.start + 1; hour < run.end; hour++) {
                const y = yOf(hour);
                if (!named.has(hour) && Array.from(named.values()).every(other => Math.abs(other - y) >= LABEL_GAP)) {
                    named.set(hour, y);
                }
            }
        });
    }
    const starts = new Set(scale.runs.map(run => run.start));
    const ends = new Set(scale.runs.map(run => run.end));
    return Array.from(named.entries())
        .map(([hour, top]): AxisLabel => ({ hour, top, anchor: starts.has(hour) ? 'below' : ends.has(hour) ? 'above' : 'center' }))
        .sort((a, b) => a.hour - b.hour);
}
