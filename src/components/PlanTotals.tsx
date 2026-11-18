/**
 *  PlanTotals.tsx
 *
 *  The three big numbers that sum up a plan: groups, students, and waitlisted students.
 *  Inside a PlanSummary they take one of two shapes, by the width of the space:
 *
 *  - a row, each label under its number (the default: above the charts when there is no
 *    room to put the totals beside them);
 *  - a column, each label to the right of its number, to the left of the charts when there is
 *    room. Each number and its label are centered together in the panel, and "Waitlisted
 *    students" wraps onto two lines.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { insetPanelSx } from "../utils/styles";

/** The narrowest a chart is drawn, in pixels, and the least width of the totals' column. */
export const CHART_MIN_WIDTH = 360;
export const TOTALS_COLUMN_WIDTH = 210;

/**
 * How wide the space must be before the totals move to the left of the charts: a column for them
 * (labels beside the numbers), the gap, and room for the charts. Below it the totals are a row
 * above the charts.
 */
export const TOTALS_BESIDE_WIDTH = TOTALS_COLUMN_WIDTH + 16 + CHART_MIN_WIDTH;

// room to put the totals to the left of the charts
const BESIDE = `@container (min-width: ${TOTALS_BESIDE_WIDTH}px)`;

/** The styles for when the totals are a column. */
const inColumn = (styles: Record<string, unknown>) => ({ [BESIDE]: styles });

const TotalStat = (props: { value: number, label: string }) => (
    <Stack
        alignItems="center"
        sx={{
            flex: 1,
            minWidth: 0,
            // in a column, the label goes to the right of the number, and the pair is centered in the panel
            ...inColumn({ flex: 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 })
        }}>
        <Typography
            variant="h3"
            component="p"
            sx={{
                fontWeight: 600,
                // numbers line up on their right edge, so the labels line up too
                ...inColumn({ fontSize: '2rem', minWidth: '2ch', textAlign: 'right' })
            }}>
            {props.value}
        </Typography>
        <Typography
            variant="caption"
            color="text.secondary"
            // beside the number, a label of two words wraps onto two lines, one word each
            sx={{ textAlign: 'center', ...inColumn({ textAlign: 'left', width: 'min-content' }) }}>
            {props.label}
        </Typography>
    </Stack>
);

/** A line between two totals: upright between a row of them, and across between a column. */
const Rule = () => (
    <Box
        role="separator"
        sx={{
            alignSelf: 'stretch',
            borderLeft: 1,
            borderColor: 'divider',
            ...inColumn({ alignSelf: 'auto', width: '100%', borderLeft: 0, borderTop: 1, borderColor: 'divider' })
        }} />
);

export const PlanTotals: React.FC<{ groupCount: number, studentCount: number, waitlistedCount: number, sx?: SxProps<Theme> }> =
    ({ groupCount, studentCount, waitlistedCount, sx }) => (
        <Stack
            direction="row"
            alignItems="center"
            sx={[
                insetPanelSx,
                // each total runs the full width of the panel, and centers its number and label within it
                inColumn({ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'stretch', gap: 1 }),
                ...(Array.isArray(sx) ? sx : [sx])
            ]}>
            <TotalStat value={groupCount} label={UI_STRINGS.GROUPS_LABEL} />
            <Rule />
            <TotalStat value={studentCount} label={UI_STRINGS.STUDENTS_LABEL} />
            <Rule />
            <TotalStat value={waitlistedCount} label={UI_STRINGS.WAITLISTED_STUDENTS} />
        </Stack>
    );
