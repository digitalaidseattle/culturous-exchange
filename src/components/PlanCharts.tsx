/**
 *  PlanCharts.tsx
 *
 *  The two bar charts that summarize a plan's groups: the hours of shared time in each group, and the
 *  students and countries in each group. They are one above the other, and side by side, sharing the width
 *  evenly, once the PlanSummary they are in is wide enough (SIDE_BY_SIDE_WIDTH, measured on that space, not
 *  the screen). A PlanSummary decides where they sit.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Typography } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { PlanStats } from "../services/plan/planStats";
import { GroupBarChart } from "./GroupBarChart";

/** How wide the PlanSummary must be, in pixels, for the two charts to sit side by side. */
export const SIDE_BY_SIDE_WIDTH = 960;

export const PlanCharts: React.FC<{ stats: PlanStats }> = ({ stats }) => {
    if (stats.perGroup.length === 0) {
        return <Typography color="text.secondary">{UI_STRINGS.NO_GROUPS_YET}</Typography>;
    }
    const names = stats.perGroup.map(group => group.name);
    return (
        <Box
            data-part="charts"
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 2,
                minWidth: 0,
                [`@container (min-width: ${SIDE_BY_SIDE_WIDTH}px)`]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }
            }}>
            <GroupBarChart
                title={UI_STRINGS.GROUP_OVERLAP_CHART}
                names={names}
                series={[{ data: stats.perGroup.map(group => group.hours), label: UI_STRINGS.HOURS }]} />
            <GroupBarChart
                title={UI_STRINGS.GROUP_STUDENTS_COUNTRIES_CHART}
                names={names}
                series={[
                    { data: stats.perGroup.map(group => group.students), label: UI_STRINGS.STUDENTS_LABEL },
                    { data: stats.perGroup.map(group => group.countries), label: UI_STRINGS.COUNTRIES_LABEL }
                ]} />
        </Box>
    );
};
