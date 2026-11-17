/**
 *  CohortCharts.tsx
 *
 *  The charts of a cohort's students on the cohort page: where they are from, how old they are, and their
 *  gender, as pie and bar charts from MUI X Charts (the maintainers' cohort charts). Nothing is shown for a
 *  cohort with no students.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Paper, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useMemo } from "react";
import { Cohort, Student } from "../../api/types";
import { CountryPieChart } from "../../components/CountryPieChart";
import { UI_STRINGS } from "../../constants";

const CHART_HEIGHT = 200;

/** A titled container for one chart. */
const ChartPanel: React.FC<{ title: string, part: string, sx?: object, children: React.ReactNode }> = ({ title, part, sx, children }) => (
    <Paper
        variant="outlined"
        component="section"
        aria-label={title}
        data-part={part}
        sx={{
            p: 1.5,
            minWidth: 0,
            ...sx
        }}>
        <Typography variant="subtitle2" component="h4" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        {children}
    </Paper>
);

/** How many students there are for each value, most first, as the pie charts want them. */
const pieData = (values: (string | undefined | null)[]) => {
    const counts = new Map<string, number>();
    values.forEach(value => {
        const label = value?.trim() || UI_STRINGS.UNKNOWN;
        counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], id) => ({ id, label, value }));
};

export const CohortCharts: React.FC<{ cohort: Cohort }> = ({ cohort }) => {
    const students = useMemo(
        () => (cohort.enrollments ?? []).map(enrollment => enrollment.student).filter((student): student is Student => Boolean(student)),
        [cohort.enrollments]);

    const genderData = useMemo(() => pieData(students.map(student => student.gender)), [students]);
    const ageData = useMemo(() => {
        const counts = new Map<number, number>();
        students.forEach(student => {
            if (student.age != null) {
                counts.set(student.age, (counts.get(student.age) ?? 0) + 1);
            }
        });
        const ages = Array.from(counts.keys()).sort((a, b) => a - b);
        return { ages, counts: ages.map(age => counts.get(age)!) };
    }, [students]);

    if (students.length === 0) {
        return null;
    }

    return (
        <Box aria-label={UI_STRINGS.COHORT_CHARTS} role="region" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 2 }}>
            <ChartPanel title={UI_STRINGS.STUDENTS_BY_COUNTRY} part="country" sx={{ flex: '1 1 300px' }}>
                <CountryPieChart students={students} height={CHART_HEIGHT} />
            </ChartPanel>
            {ageData.ages.length > 0 &&
                <ChartPanel title={UI_STRINGS.STUDENTS_BY_AGE} part="age" sx={{ flex: '1 1 240px' }}>
                    <BarChart
                        xAxis={[{ data: ageData.ages, scaleType: 'band', label: UI_STRINGS.AGE_LABEL }]}
                        yAxis={[{ tickMinStep: 1 }]}
                        series={[{ data: ageData.counts, label: UI_STRINGS.STUDENTS_LABEL }]}
                        height={CHART_HEIGHT}
                        hideLegend />
                </ChartPanel>
            }
            <ChartPanel title={UI_STRINGS.STUDENTS_BY_GENDER} part="gender" sx={{ flex: '1 1 240px' }}>
                <PieChart
                    series={[{ data: genderData, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
                    height={CHART_HEIGHT} />
            </ChartPanel>
        </Box>
    );
};
