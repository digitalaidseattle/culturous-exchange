/**
 *  CountryPieChart.tsx
 *
 *  A pie chart of where a set of students are from: a slice for each country, with the number of students,
 *  and the chart's own legend. It is the maintainers' countries chart from their cohort charts, drawn with
 *  MUI X Charts, and is the same on a group's card and on a cohort's page. The chart hugs its contents: it
 *  is never wider than the pie and its legend need, however wide the space it is given, and the legend is
 *  beside the pie with the countries flowing across in rows that wrap onto new rows, not in one tall column.
 *  Countries are compared ignoring case and spacing and are spelled as first typed; students who gave none
 *  are counted as Unknown. Nothing is drawn for no students.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useMemo } from "react";
import { Student } from "../api/types";
import { countryCounts } from "../utils/countryCounts";

/** The widest the legend grows before its countries wrap onto a new row, in pixels; in a narrow space it is what is left beside the pie. */
export const LEGEND_MAX_WIDTH = 340;
const GAP = 16;

export const CountryPieChart: React.FC<{ students: Student[], height?: number }> = ({ students, height = 160 }) => {
    const data = useMemo(() => countryCounts(students), [students]);
    if (data.length === 0) {
        return null;
    }
    return (
        // measures its own space, so the legend can take what is left beside the pie
        <Box sx={{ containerType: 'inline-size', maxWidth: height + GAP + LEGEND_MAX_WIDTH }}>
            <PieChart
                series={[{ data, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
                height={height}
                // the chart lays out its legend above the pie when the legend is horizontal (its countries flow in rows);
                // the chart's grid is changed to put the legend beside the pie, in a column of the pie's own width
                sx={{ gridTemplateAreas: '"chart legend"', gridTemplateColumns: `${height}px minmax(0, auto)`, gridTemplateRows: 'auto', columnGap: `${GAP}px`, alignItems: 'center', justifyContent: 'start' }}
                slotProps={{
                    legend: {
                        direction: 'horizontal',
                        sx: { maxWidth: `min(${LEGEND_MAX_WIDTH}px, calc(100cqw - ${height + GAP}px))`, flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }
                    }
                }} />
        </Box>
    );
};
