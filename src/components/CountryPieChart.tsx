/**
 *  CountryPieChart.tsx
 *
 *  A pie chart of where a set of students are from: a slice for each country, with the number of students,
 *  and a key. It is the maintainers' countries chart from their cohort charts, drawn with MUI X Charts, and
 *  is the same on a group's card and on a cohort's page. Countries are compared ignoring case and spacing
 *  and are spelled as first typed; students who gave none are counted as Unknown. Nothing is drawn for no students.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { PieChart } from "@mui/x-charts/PieChart";
import { useMemo } from "react";
import { Student } from "../api/types";
import { countryCounts } from "../utils/countryCounts";

export const CountryPieChart: React.FC<{ students: Student[], height?: number }> = ({ students, height = 160 }) => {
    const data = useMemo(() => countryCounts(students), [students]);
    if (data.length === 0) {
        return null;
    }
    return (
        <PieChart
            series={[{ data, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
            height={height}
            slotProps={{
                legend: {
                    direction: 'vertical',
                    sx: { display: 'grid', gridTemplateColumns: data.length > 6 ? 'repeat(2, auto)' : 'auto', columnGap: 2, rowGap: 0.5 }
                }
            }} />
    );
};
