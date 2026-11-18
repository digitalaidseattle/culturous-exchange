/**
 *  PlanSummary.tsx
 *
 *  A plan's numbers and charts together: the totals of groups, students and waitlisted
 *  students, and the two bar charts of each group's shared time and its students and
 *  countries, one above the other. They are laid out by the width of the space they sit
 *  in, not the width of the screen, so a card and a dialog each switch at the right moment:
 *
 *  - wide: the totals stack in a column to the left of the charts, each label beside its number.
 *  - narrow: the totals sit in a row above the charts, each label under its number.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box } from "@mui/material";
import { PlanStats } from "../services/plan/planStats";
import { PlanCharts } from "./PlanCharts";
import { PlanTotals, TOTALS_BESIDE_WIDTH } from "./PlanTotals";

export const PlanSummary: React.FC<{ stats: PlanStats }> = ({ stats }) => (
    <Box sx={{ containerType: 'inline-size' }}>
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 2,
                [`@container (min-width: ${TOTALS_BESIDE_WIDTH}px)`]: {
                    gridTemplateColumns: 'minmax(190px, 210px) minmax(0, 1fr)'
                }
            }}>
            <PlanTotals
                groupCount={stats.groupCount}
                studentCount={stats.studentCount}
                waitlistedCount={stats.waitlistedCount}
                // alone in its row, except as the column beside the charts
                sx={{ [`@container (min-width: ${TOTALS_BESIDE_WIDTH}px)`]: { alignSelf: 'start' } }} />
            <PlanCharts stats={stats} />
        </Box>
    </Box>
);
