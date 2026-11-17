/**
 *  CohortCharts.tsx
 *
 *  The charts of a cohort's students on the cohort page: where they are from, how old they are, and their
 *  gender, as pie and bar charts from MUI X Charts (the maintainers' cohort charts). Nothing is shown for a
 *  cohort with no students. They are laid out by the width of the space they sit in, not the width of the
 *  screen, so a card on the home page and the cohort's own page each switch at the right moment:
 *
 *  - wide: the three charts side by side, the countries a little wider than the others;
 *  - medium: the countries chart across the whole width, and the age and gender charts side by side
 *    below it, splitting the width evenly;
 *  - narrow: the three charts one under the next.
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

/**
 * How wide the space must be, in pixels, for the age and gender charts to sit side by side at their narrowest
 * (240 each) with the gap. Below it the three charts are one column.
 */
export const TWO_ACROSS_WIDTH = 2 * 240 + 16;

/**
 * How wide the space must be for all three to sit side by side: the countries chart needs about 360 for its
 * pie to be legible beside its key, and the others share the rest in the proportion 5 : 4 : 4, so the space
 * is 360 / (5 / 13) plus the two gaps, rounded up.
 */
export const THREE_ACROSS_WIDTH = 960;

const TWO_ACROSS = `@container (min-width: ${TWO_ACROSS_WIDTH}px)`;
const THREE_ACROSS = `@container (min-width: ${THREE_ACROSS_WIDTH}px)`;

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

    // with no ages there are only two charts: the countries, and the gender, which then take the whole width in turn
    const hasAges = ageData.ages.length > 0;

    return (
        <Box sx={{ containerType: 'inline-size' }}>
            <Box
                aria-label={UI_STRINGS.COHORT_CHARTS}
                role="region"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: 2,
                    [TWO_ACROSS]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
                    [THREE_ACROSS]: { gridTemplateColumns: hasAges ? 'minmax(0, 5fr) minmax(0, 4fr) minmax(0, 4fr)' : 'minmax(0, 5fr) minmax(0, 4fr)' }
                }}>
                {/* across the whole width, until there is room for all three side by side */}
                <ChartPanel title={UI_STRINGS.STUDENTS_BY_COUNTRY} part="country" sx={{ gridColumn: '1 / -1', [THREE_ACROSS]: { gridColumn: 'auto' } }}>
                    <CountryPieChart students={students} height={CHART_HEIGHT} />
                </ChartPanel>
                {hasAges &&
                    <ChartPanel title={UI_STRINGS.STUDENTS_BY_AGE} part="age">
                        <BarChart
                            xAxis={[{ data: ageData.ages, scaleType: 'band', label: UI_STRINGS.AGE_LABEL }]}
                            yAxis={[{ tickMinStep: 1 }]}
                            series={[{ data: ageData.counts, label: UI_STRINGS.STUDENTS_LABEL }]}
                            height={CHART_HEIGHT}
                            hideLegend />
                    </ChartPanel>
                }
                {/* beside the age chart, sharing the width evenly; alone, it takes the width below the countries */}
                <ChartPanel
                    title={UI_STRINGS.STUDENTS_BY_GENDER}
                    part="gender"
                    sx={hasAges ? undefined : { gridColumn: '1 / -1', [THREE_ACROSS]: { gridColumn: 'auto' } }}>
                    <PieChart
                        series={[{ data: genderData, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
                        height={CHART_HEIGHT} />
                </ChartPanel>
            </Box>
        </Box>
    );
};
