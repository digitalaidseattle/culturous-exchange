/**
 *  GroupBarChart.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";

export interface GroupBarChartSeries {
    data: number[];
    label: string;
}

interface GroupBarChartProps {
    title: string;
    names: string[];
    series: GroupBarChartSeries[];
}

export const GroupBarChart: React.FC<GroupBarChartProps> = ({ title, names, series }) => (
    <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" mt={1}>{title}</Typography>
        <BarChart
            xAxis={[{ data: names, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
            yAxis={[{ tickMinStep: 1, width: 30 }]}
            series={series}
            height={180}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            hideLegend={series.length < 2}
        />
    </Box>
);
