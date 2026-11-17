/**
 *  CountryPieChart.tsx
 *
 *  A pie chart of where a set of students are from: a slice for each country, with the number of students,
 *  and the chart's own legend. It is the maintainers' countries chart from their cohort charts, drawn with
 *  MUI X Charts, and is the same on a group's card and on a cohort's page. The pie is a fixed size, and the
 *  legend is beside it and takes all the rest of the width: the countries flow across in rows that wrap onto
 *  new rows, not in one tall column, so the chart fills the space it is given and leaves none empty.
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

/** The space between the pie and its legend, in pixels. */
const GAP = 16;

export const CountryPieChart: React.FC<{ students: Student[], height?: number }> = ({ students, height = 160 }) => {
    const data = useMemo(() => countryCounts(students), [students]);
    if (data.length === 0) {
        return null;
    }
    return (
        // measures its own space, so the legend can take all of what is left beside the pie
        <Box sx={{ containerType: 'inline-size' }}>
            <PieChart
                series={[{ data, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
                height={height}
                // the chart lays out its legend above the pie when the legend is horizontal (its countries flow in rows);
                // the chart's grid is changed to put the legend beside the pie, taking the rest of the width after a column the pie's own width
                sx={{ gridTemplateAreas: '"chart legend"', gridTemplateColumns: `${height}px minmax(0, 1fr)`, gridTemplateRows: 'auto', columnGap: `${GAP}px`, alignItems: 'center', justifyContent: 'start' }}
                slotProps={{
                    legend: {
                        direction: 'horizontal',
                        sx: { maxWidth: `calc(100cqw - ${height + GAP}px)`, flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }
                    }
                }} />
        </Box>
    );
};
