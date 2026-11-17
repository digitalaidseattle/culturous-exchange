/**
 *  PlanCharts.tsx
 *
 *  The two bar charts that summarize a plan's groups, one above the other: the hours of shared
 *  time in each group, and the students and countries in each group. A PlanSummary decides where
 *  they sit.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Stack, Typography } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { PlanStats } from "../services/plan/planStats";
import { GroupBarChart } from "./GroupBarChart";

export const PlanCharts: React.FC<{ stats: PlanStats }> = ({ stats }) => {
    if (stats.perGroup.length === 0) {
        return <Typography color="text.secondary">{UI_STRINGS.NO_GROUPS_YET}</Typography>;
    }
    const names = stats.perGroup.map(group => group.name);
    return (
        <Stack gap={2} sx={{ minWidth: 0 }}>
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
        </Stack>
    );
};
