/**
 *  PlanSummary.tsx
 *
 *  A plan's numbers and charts together: the totals of groups, students and waitlisted
 *  students, and the three charts of group size, countries per group and time overlap
 *  per group. They are laid out by the width of the space they sit in, not the width of
 *  the screen, so a card and a dialog each switch at the right moment:
 *
 *  - large: the totals stack in a column to the left of the three charts, all in one row,
 *    each label beside its number.
 *  - medium: all three charts still fit side by side, but not with the totals: the totals
 *    sit in a row above the charts.
 *  - small: three charts do not fit side by side, but two do: the totals stack in a column
 *    and join the charts in a 2 by 2 grid, the totals first, each label under its number.
 *  - extra small: two charts do not fit side by side: the totals and each chart are stacked
 *    in one column, the totals first.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box } from "@mui/material";
import { PlanStats } from "../services/plan/planStats";
import { PlanCharts } from "./PlanCharts";
import { TWO_CHARTS_WIDTH, PlanTotals, THREE_CHARTS_WIDTH, TOTALS_BESIDE_WIDTH } from "./PlanTotals";

export const PlanSummary: React.FC<{ stats: PlanStats }> = ({ stats }) => (
    <Box sx={{ containerType: 'inline-size' }}>
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 2,
                [`@container (min-width: ${TWO_CHARTS_WIDTH}px)`]: {
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
                },
                [`@container (min-width: ${THREE_CHARTS_WIDTH}px)`]: {
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
                },
                [`@container (min-width: ${TOTALS_BESIDE_WIDTH}px)`]: {
                    gridTemplateColumns: 'minmax(190px, 210px) repeat(3, minmax(0, 1fr))'
                }
            }}>
            <PlanTotals
                groupCount={stats.groupCount}
                studentCount={stats.studentCount}
                waitlistedCount={stats.waitlistedCount}
                // across the whole row, except as one cell of the 2 by 2 grid, or as the column beside the charts
                sx={{
                    gridColumn: '1 / -1',
                    [`@container (min-width: ${TWO_CHARTS_WIDTH}px) and (max-width: ${THREE_CHARTS_WIDTH - 0.02}px)`]: { gridColumn: 'auto' },
                    [`@container (min-width: ${TOTALS_BESIDE_WIDTH}px)`]: { gridColumn: 'auto' }
                }} />
            <PlanCharts stats={stats} />
        </Box>
    </Box>
);
