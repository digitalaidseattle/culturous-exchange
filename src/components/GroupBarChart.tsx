/**
 *  GroupBarChart.tsx
 *
 *  A bar chart with a bar for each group, under a title: one series for a single measure (the hours
 *  of shared time), or two side by side with a key (students and countries). It is the maintainers'
 *  chart from their interactive plan card, drawn with MUI X Charts, and fills the width it is given.
 *  The bars have rounded tops, the chart is short, and the vertical axis runs from 0 to a labeled
 *  round number at or above the tallest bar (see axisTicks).
 *
 *  A chart with a key is CHART_HEIGHT tall under its key. One without fills the height it is given, at
 *  least CHART_HEIGHT: two charts side by side in a grid are the same height, so the one with no key is
 *  as tall as the other is with its key, and the two end at the same baseline, with no empty space under
 *  the shorter one. Stacked, each is CHART_HEIGHT.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisTicks } from "../utils/chartAxis";

/** How tall the chart is, in pixels, and how rounded the bars are. */
export const CHART_HEIGHT = 130;
export const BAR_RADIUS = 4;

export interface GroupBarChartSeries {
    data: number[];
    label: string;
}

export const GroupBarChart: React.FC<{ title: string, names: string[], series: GroupBarChartSeries[] }> = ({ title, names, series }) => {
    const { ticks, max } = axisTicks(Math.max(...series.flatMap(one => one.data)));
    const hasKey = series.length >= 2;
    const chart = (
        <BarChart
            xAxis={[{ data: names, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
            yAxis={[{ min: 0, max, tickInterval: ticks, width: 30 }]}
            series={series}
            // with no height of its own, the chart is as tall as the box it is in
            height={hasKey ? CHART_HEIGHT : undefined}
            // the chart with a key sits at the bottom of the room under its key, as the one with no key does in its box, so their baselines are one
            sx={hasKey ? { alignItems: 'end' } : undefined}
            borderRadius={BAR_RADIUS}
            margin={{ top: 16, right: 8, bottom: 0, left: 0 }}
            hideLegend={!hasKey} />
    );
    return (
        <Box component="section" aria-label={title} sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" component="h4" sx={{ fontWeight: 600 }}>{title}</Typography>
            {hasKey
                ? chart
                // the box takes the height left in its section, and the chart fills it without adding to it, so the chart follows the section and cannot hold it open
                : <Box data-part="fill" sx={{ flex: 1, minHeight: CHART_HEIGHT, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', inset: 0 }}>{chart}</Box>
                </Box>}
        </Box>
    );
};
