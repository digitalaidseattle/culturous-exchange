/**
 *  PlanTotals.tsx
 *
 *  The three big numbers that sum up a plan: groups, students, and waitlisted students.
 *  Inside a PlanSummary they take one of two shapes, by the width of the space:
 *
 *  - a row, each label under its number (the default: above the charts when there is no
 *    room to put the totals beside them, and above the stacked charts when two charts do
 *    not fit side by side);
 *  - a column, each label to the right of its number, when the panel sits in the grid with
 *    the charts: as a cell in a 2 by 2 grid when two charts fit side by side but three do
 *    not, or to the left of all three charts when there is room. Each number and its
 *    label are centered together in the panel, and "Waitlisted students" wraps onto two
 *    lines.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { insetPanelSx } from "../utils/styles";

/**
 * How wide the space must be, in pixels, for two charts side by side at their narrowest, with the
 * gap. From here the totals stack in a column and form a 2 by 2 grid with the three charts. Below
 * it the totals and each chart are stacked in one column.
 */
export const TWO_CHARTS_WIDTH = 416;

/**
 * How wide the space must be before all three charts fit side by side, at their narrowest with the
 * gaps. From here the totals are in a row above the charts, until there is room to put them beside.
 */
export const THREE_CHARTS_WIDTH = 632;

/**
 * How wide the space must be before the totals move to the left of the three charts: a column
 * for them (labels beside the numbers), the gap, and room for the three charts.
 */
export const TOTALS_BESIDE_WIDTH = 840;

// two charts fit side by side but three do not
const MIDDLE = `@container (min-width: ${TWO_CHARTS_WIDTH}px) and (max-width: ${THREE_CHARTS_WIDTH - 0.02}px)`;
// room to put the totals to the left of the three charts
const BESIDE = `@container (min-width: ${TOTALS_BESIDE_WIDTH}px)`;

/** The same styles in the two cases where the totals are a column. */
const inColumn = (styles: Record<string, unknown>) => ({ [MIDDLE]: styles, [BESIDE]: styles });

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
