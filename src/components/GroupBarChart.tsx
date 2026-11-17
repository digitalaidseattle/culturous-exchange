/**
 *  GroupBarChart.tsx
 *
 *  A bar chart with a bar for each group, under a title: one series for a single measure (the hours
 *  of shared time), or two side by side with a key (students and countries). It is the maintainers'
 *  chart from their interactive plan card, drawn with MUI X Charts, and fills the width it is given.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export interface GroupBarChartSeries {
    data: number[];
    label: string;
}

export const GroupBarChart: React.FC<{ title: string, names: string[], series: GroupBarChartSeries[] }> = ({ title, names, series }) => (
    <Box component="section" aria-label={title} sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" component="h4" sx={{ fontWeight: 600 }}>{title}</Typography>
        <BarChart
            xAxis={[{ data: names, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
            yAxis={[{ tickMinStep: 1, width: 30 }]}
            series={series}
            height={180}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            hideLegend={series.length < 2} />
    </Box>
);
