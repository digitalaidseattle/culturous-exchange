/**
 *  DistributionChart.tsx
 *
 *  Summary of how a set of values is spread out, in its own container. The plot
 *  itself sits on a small white panel with rounded corners and a light border
 *  inside that container. The panel is only as tall as it needs to be: tall
 *  enough for a stack with a dot for every group in the plan, so the worst case,
 *  every group having the same value, still fits at full dot size.
 *  It is a dot plot: every group is one dot above a horizontal axis, placed at its
 *  value, and groups with the same value stack one on top of the other. The
 *  minimum and maximum are written under the chart. The average, a dashed
 *  vertical line and a readout, is hidden unless `showAverage` is set. The axis starts at 0 or the minimum
 *  minus two, whichever is larger, and ends at the maximum plus two. Used on
 *  plan cards for group size, countries per group, and group overlap so the
 *  three charts look the same.
 *
 *  The dots are one color by default. Given a color scale, each dot takes the
 *  color of its value, so a value's place on the scale shows how good or poor
 *  it is.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import { UI_STRINGS } from "../constants";
import { RangeStats, formatNumber } from "../services/plan/planStats";
import { distributionShape } from "../utils/distribution";
import { ColorStop, colorAt } from "../utils/gradient";
import { insetPanelSx } from "../utils/styles";

export interface ChartUnit {
    one: string;
    other: string;
}

interface Props {
    title: string;
    stats: RangeStats | null;
    /** shown after each value, e.g. "hour" / "hours" */
    unit?: ChartUnit;
    /** colors each dot by its value, in the unit of the values */
    colorStops?: ColorStop[];
    /** shows the average as a dashed line and a readout; hidden by default */
    showAverage?: boolean;
    /**
     * How many groups the plan has. The chart is made tall enough for a stack of that many dots.
     * Give every chart of a plan the same number and they come out the same height. Defaults to
     * the number of values being charted.
     */
    groupCount?: number;
}

const unitFor = (value: number, unit?: ChartUnit): string | undefined =>
    unit ? (value === 1 ? unit.one : unit.other) : undefined;

const withUnit = (value: number, unit?: ChartUnit): string =>
    unit ? `${formatNumber(value)} ${unitFor(value, unit)}` : formatNumber(value);

// drawing area in pixels
const TOP = 4;
/** room under the axis line for its small ticks */
const BELOW_AXIS = 4;
/** how far the bottom dot sits above the axis */
const LIFT = 1;
/** the largest a dot gets; dots shrink to fit a tall stack or crowded neighbors */
const DOT_MAX = 10;
const DOT_MIN = 2;
/** The most room given to a stack, in pixels. Past this many groups the dots shrink instead of the chart growing. */
const STACK_ROOM_MAX = 120;
/** width used until the real width is measured */
const DEFAULT_WIDTH = 200;

/** One of the three readouts under the chart; the average is marked like its line in the chart. */
const Readout: React.FC<{ name: string, value: number, unit?: ChartUnit, color?: string }> =
    ({ name, value, unit, color }) => (
        <Box sx={{ minWidth: 0, lineHeight: 1.25 }}>
            <Stack direction="row" alignItems="center" gap={0.75}>
                {color &&
                    <Box sx={{ width: 0, height: 10, borderLeftWidth: 2, borderLeftStyle: 'dashed', borderLeftColor: color, flexShrink: 0 }} />
                }
                <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.25 }}>{name}</Typography>
            </Stack>
            <Typography variant="body2" component="div" sx={{ fontWeight: 600, lineHeight: 1.25 }}>{formatNumber(value)}</Typography>
            {unit &&
                <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.25 }}>{unitFor(value, unit)}</Typography>
            }
        </Box>
    );

export const DistributionChart: React.FC<Props> = ({ title, stats, unit, colorStops, showAverage = false, groupCount }) => {
    const theme = useTheme();
    const shape = stats ? distributionShape(stats.values) : null;
    const hasShape = shape !== null;

    // The drawing is in real pixels so the dots are round and sized to fit, so it needs the width
    const plotRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
    useLayoutEffect(() => {
        const element = plotRef.current;
        if (!element) {
            return;
        }
        const measure = () => {
            if (element.clientWidth > 0) {
                setWidth(element.clientWidth);
            }
        };
        measure();
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [hasShape]);

    const summary = stats
        ? `${title}: ${UI_STRINGS.CHART_MIN} ${withUnit(stats.min, unit)}, ${showAverage ? `${UI_STRINGS.CHART_AVERAGE} ${withUnit(stats.average, unit)}, ` : ''}${UI_STRINGS.CHART_MAX} ${withUnit(stats.max, unit)}`
        : `${title}: ${UI_STRINGS.NO_GROUPS_YET}`;

    if (!stats || !shape) {
        return (
            <Stack gap={0.75} role="img" aria-label={summary} sx={[insetPanelSx, { minWidth: 0 }] as never}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">{UI_STRINGS.NO_GROUPS_YET}</Typography>
            </Stack>
        );
    }

    const primary = theme.palette.primary;
    const axisColor = theme.palette.text.secondary;
    const X = (fraction: number) => fraction * width;

    // The chart is as tall as a stack with a dot for every group at full size, so even if every
    // group had the same value they would all fit. Beyond STACK_ROOM_MAX the dots shrink instead.
    const groups = Math.max(groupCount ?? stats.values.length, 1);
    const stackRoom = Math.min(groups * DOT_MAX, STACK_ROOM_MAX);
    const plotHeight = TOP + stackRoom + LIFT + BELOW_AXIS;
    const baseline = plotHeight - BELOW_AXIS;

    // The bottom dot sits just above the axis, and each one after it sits on the one below.
    // Dots are as big as they can be, up to DOT_MAX, without the tallest stack running off the
    // top or two neighboring values running into each other.
    const bottom = baseline - LIFT;
    const tallest = Math.max(...shape.stacks.map(stack => stack.count));
    const gaps = shape.stacks.slice(1).map((stack, i) => X(stack.x - shape.stacks[i].x));
    const diameter = Math.max(DOT_MIN, Math.min(DOT_MAX, (bottom - TOP) / tallest, ...gaps));
    const radius = diameter / 2;
    const dotY = (index: number) => bottom - radius - index * diameter;

    return (
        <Stack gap={1} role="img" aria-label={summary} sx={[insetPanelSx, { minWidth: 0 }] as never}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
            {/* the chart itself: dots, axis, and axis numbers on a white panel */}
            <Box data-testid="chart-area" sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, padding: '8px 12px 4px' }}>
                <Box ref={plotRef} sx={{ width: '100%', height: plotHeight }}>
                    <svg width={width} height={plotHeight} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
                        {/* the axis, with a small tick at each label */}
                        <line x1={0} y1={baseline} x2={width} y2={baseline} stroke={axisColor} strokeWidth={1} />
                        {shape.ticks.map(tick =>
                            <line key={tick.value} x1={X(tick.x)} y1={baseline} x2={X(tick.x)} y2={baseline + BELOW_AXIS} stroke={axisColor} strokeWidth={1} />
                        )}
                        {/* the average: a dashed line from the top down to the axis */}
                        {showAverage &&
                            <line x1={X(shape.averageX)} y1={0} x2={X(shape.averageX)} y2={baseline}
                                stroke={primary.main} strokeWidth={2} strokeDasharray="4 3" />
                        }
                        {/* one dot for each group, stacked over its value */}
                        {shape.stacks.map(stack =>
                            Array.from({ length: stack.count }, (_, index) =>
                                <circle
                                    key={`${stack.value}-${index}`}
                                    cx={X(stack.x)}
                                    cy={dotY(index)}
                                    r={radius}
                                    fill={colorStops ? colorAt(colorStops, stack.value) : primary.main}
                                    stroke="#fff"
                                    strokeWidth={1.5} />
                            )
                        )}
                    </svg>
                </Box>
                {/* axis numbers */}
                <Box sx={{ position: 'relative', height: 18, marginTop: '6px' }}>
                    {shape.ticks.map(tick =>
                        <Typography
                            key={tick.value}
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: `${tick.x * 100}%`,
                                transform: tick.x === 0 ? 'none' : tick.x === 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                                fontSize: '0.65rem',
                                lineHeight: 1.25
                            }}>
                            {formatNumber(tick.value)}
                        </Typography>
                    )}
                </Box>
            </Box>
            {stats.min === stats.max
                ? (showAverage
                    ? <Readout name={UI_STRINGS.CHART_ALL_SAME} value={stats.average} unit={unit} color={primary.main} />
                    : <Readout name={UI_STRINGS.CHART_MIN_MAX_SAME} value={stats.min} unit={unit} />)
                : <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Readout name={UI_STRINGS.CHART_MIN} value={stats.min} unit={unit} />
                    {showAverage &&
                        <Readout name={UI_STRINGS.CHART_AVERAGE} value={stats.average} unit={unit} color={primary.main} />
                    }
                    <Readout name={UI_STRINGS.CHART_MAX} value={stats.max} unit={unit} />
                </Stack>
            }
        </Stack>
    );
};
