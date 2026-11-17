/**
 *  AvailabilityCalendar.tsx
 *
 *  A little calendar of the weekend: Friday, Saturday and Sunday side by side, each a strip from
 *  7am to 10pm Pacific time. Free time is drawn as a pale band and, over it, the time that is
 *  shared (a group's overlap, or what a student has in common with a group) as a solid bar. A day
 *  with no shared time is dimmed and drawn a quarter as wide as the others, so the days available
 *  stand out. A part of the day (morning, afternoon or evening) with no shared time on any day is
 *  left out, and the hours that are left are drawn larger in the same height, with a mark where
 *  hours were skipped. The calendar is read aloud as one picture with a description of the times
 *  in it.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { alpha } from "@mui/material/styles";
import { TimeWindow } from "../api/types";
import { UI_STRINGS } from "../constants";
import {
    GRID_DAYS,
    GRID_TIME_ZONE_LABEL,
    TIME_BANDS,
    WeekendSegments,
    axisLabels,
    bandsWithTime,
    buildScale,
    describeSegments,
    formatHour,
    placeSegments,
    toWeekendSegments
} from "../utils/weekendGrid";

/** How wide a day with nothing in it is, next to a day with something. */
const EMPTY_DAY_WEIGHT = 1;
const FULL_DAY_WEIGHT = 4;
/** The narrowest an empty day gets, so its name still fits. */
const EMPTY_DAY_MIN_WIDTH = 26;

const TRACK_HEIGHT = { mini: 44, compact: 84, full: 144 } as const;

export type AvailabilityCalendarProps = {
    /** free time, drawn as a pale band */
    windows?: TimeWindow[];
    /** shared time, drawn as a solid bar over the band */
    highlight?: TimeWindow[];
    /** how big: mini fits in a list, compact in a card, full in a window */
    size?: keyof typeof TRACK_HEIGHT;
    /** what the calendar is of, for screen readers: "Group 1" */
    label: string;
    /** what the pale band and the solid bar mean, shown as a key when the calendar is not mini */
    windowsLabel?: string;
    highlightLabel?: string;
    /** says so, in words, when the calendar has no time in it */
    noneLabel?: string;
    /** grows to the height of the container it is in, which needs a height of its own; the size is then the least height */
    fill?: boolean;
};

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    windows, highlight, size = 'compact', label, windowsLabel, highlightLabel, noneLabel = UI_STRINGS.NO_TIME, fill
}) => {
    const free: WeekendSegments = toWeekendSegments(windows);
    const shared: WeekendSegments = toWeekendSegments(highlight);
    const minHeight = TRACK_HEIGHT[size];

    // the height the strips are really drawn at, once they are on screen: the hours are placed in it
    const strip = useRef<HTMLDivElement>(null);
    const [measured, setMeasured] = useState<number>(0);
    useEffect(() => {
        const element = strip.current;
        if (!element) {
            return;
        }
        const measure = () => setMeasured(element.clientHeight);
        measure();
        const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
        observer?.observe(element);
        return () => observer?.disconnect();
    }, []);
    // with no screen to measure (as in tests) the strips are their least height
    const trackHeight = measured > 0 ? measured : minHeight;
    const showAxis = size !== 'mini';
    const showKey = size !== 'mini' && (windowsLabel || highlightLabel);
    // a day with nothing is narrow, except in the smallest calendar where every day needs the room
    const collapseEmptyDays = size !== 'mini';

    // with nothing shared to point at, the pale band is what the picture says
    const main = highlight ? shared : free;
    const spoken = describeSegments(main, noneLabel);

    // parts of the day with nothing in them are left out and the rest drawn larger, except in the smallest calendar
    const bands = size === 'mini' ? TIME_BANDS : bandsWithTime(main);
    const scale = buildScale(bands, trackHeight);
    const labels = axisLabels(scale, bands);

    return (
        <Box sx={fill ? { height: '100%', display: 'flex', flexDirection: 'column' } : undefined}>
            <Box
                role="img"
                data-bands={bands.map(band => band.name).join(',')}
                aria-label={`${label}: ${spoken} (${GRID_TIME_ZONE_LABEL})`}
                sx={{ display: 'flex', gap: 0.75, alignItems: 'stretch', ...(fill && { flex: 1, minHeight: 0 }) }}>
                {showAxis &&
                    <Box aria-hidden="true" sx={{ width: 30, pt: '20px', pb: 0, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ position: 'relative', flex: fill ? '1 1 0' : 'none', height: fill ? undefined : minHeight, minHeight }}>
                            {labels.map(({ hour, top, anchor }) =>
                                <Typography
                                    key={hour}
                                    variant="caption"
                                    color="text.secondary"
                                    data-hour={hour}
                                    sx={{
                                        position: 'absolute',
                                        right: 0,
                                        top,
                                        transform: anchor === 'above' ? 'translateY(-100%)' : anchor === 'center' ? 'translateY(-50%)' : 'none',
                                        lineHeight: 1,
                                        fontSize: 10
                                    }}>
                                    {formatHour(hour)}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                }
                {GRID_DAYS.map((day, index) => {
                    const hasShared = highlight ? shared[index].length > 0 : free[index].length > 0;
                    const narrow = collapseEmptyDays && !hasShared;
                    return (
                        <Box
                            key={day}
                            aria-hidden="true"
                            data-width={narrow ? 'narrow' : 'full'}
                            sx={{ flex: `${narrow ? EMPTY_DAY_WEIGHT : FULL_DAY_WEIGHT} 1 0`, minWidth: narrow ? EMPTY_DAY_MIN_WIDTH : 0, display: 'flex', flexDirection: 'column' }}>
                            <Typography
                                variant="caption"
                                align="center"
                                sx={{ display: 'block', height: 20, fontWeight: hasShared ? 700 : 400, color: hasShared ? 'text.primary' : 'text.secondary' }}>
                                {day}
                            </Typography>
                            <Box
                                data-day={day}
                                ref={index === 0 ? strip : undefined}
                                sx={{
                                    position: 'relative',
                                    flex: fill ? '1 1 0' : 'none',
                                    height: fill ? undefined : minHeight,
                                    minHeight,
                                    borderRadius: 0.75,
                                    border: 1,
                                    borderColor: 'divider',
                                    bgcolor: hasShared ? 'background.paper' : 'action.hover',
                                    overflow: 'hidden'
                                }}>
                                {scale.breaks.map((mark, i) =>
                                    <Box
                                        key={`break-${i}`}
                                        data-break
                                        sx={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: mark.top,
                                            height: mark.height,
                                            bgcolor: 'action.selected',
                                            borderTop: '1px dashed',
                                            borderBottom: '1px dashed',
                                            borderColor: 'divider'
                                        }} />
                                )}
                                {placeSegments(free[index], scale).map((segment, i) =>
                                    <Box
                                        key={`free-${i}`}
                                        data-kind="free"
                                        data-start={segment.start}
                                        data-end={segment.end}
                                        sx={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: segment.top,
                                            height: segment.height,
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2)
                                        }} />
                                )}
                                {placeSegments(shared[index], scale).map((segment, i) =>
                                    <Box
                                        key={`shared-${i}`}
                                        data-kind="shared"
                                        data-start={segment.start}
                                        data-end={segment.end}
                                        sx={{
                                            position: 'absolute',
                                            left: 2,
                                            right: 2,
                                            top: segment.top,
                                            height: segment.height,
                                            minHeight: 3,
                                            bgcolor: 'primary.main',
                                            borderTopLeftRadius: segment.roundTop ? 4 : 0,
                                            borderTopRightRadius: segment.roundTop ? 4 : 0,
                                            borderBottomLeftRadius: segment.roundBottom ? 4 : 0,
                                            borderBottomRightRadius: segment.roundBottom ? 4 : 0
                                        }} />
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {showKey &&
                <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.25, mt: 0.75, ml: showAxis ? '36px' : 0 }}>
                    {windowsLabel &&
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box component="span" aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2), border: 1, borderColor: 'divider' }} />
                            {windowsLabel}
                        </Typography>}
                    {highlightLabel &&
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box component="span" aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: 'primary.main' }} />
                            {highlightLabel}
                        </Typography>}
                </Box>
            }
        </Box>
    );
};
