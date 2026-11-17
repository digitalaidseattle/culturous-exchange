/**
 *  GroupBarChart.tsx
 *
 *  A bar chart with a bar for each group, under a title: one series for a single measure (the hours
 *  of shared time), or two side by side with a key (students and countries). It is the maintainers'
 *  chart from their interactive plan card, drawn with MUI X Charts, and fills the width it is given.
 *  The bars have rounded tops, the chart is short, and the vertical axis runs from 0 to a labeled
 *  round number at or above the tallest bar (see axisTicks).
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
    return (
        <Box component="section" aria-label={title} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" component="h4" sx={{ fontWeight: 600 }}>{title}</Typography>
            <BarChart
                xAxis={[{ data: names, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
                yAxis={[{ min: 0, max, tickInterval: ticks, width: 30 }]}
                series={series}
                height={CHART_HEIGHT}
                borderRadius={BAR_RADIUS}
                margin={{ top: 16, right: 8, bottom: 0, left: 0 }}
                hideLegend={series.length < 2} />
        </Box>
    );
};
