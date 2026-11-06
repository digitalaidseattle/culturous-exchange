/**
 *  WaitlistPanel.tsx
 *
 *  The students who are not in a group, as a side panel of compact student cards beside the
 *  groups.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Placement } from "../api/types";
import { UI_STRINGS } from "../constants";
import { byAnchorThenName } from "../services/plan/groupFit";
import { raisedCardSx } from "../utils/styles";
import { PlanStudentCard } from "./PlanStudentCard";

export const WaitlistPanel: React.FC<{
    placements: Placement[],
    onSeeDetails: (placement: Placement) => void,
    onChangeGroup: (placement: Placement) => void,
    onToggleAnchor: (placement: Placement) => void
}> = ({ placements, onSeeDetails, onChangeGroup, onToggleAnchor }) => (
    <Card
        component="aside"
        aria-label={UI_STRINGS.WAITLISTED}
        sx={{
            ...raisedCardSx,
            // beside the groups the panel stays in view while they scroll, and scrolls itself when it is long
            position: { lg: 'sticky' },
            top: { lg: 16 },
            maxHeight: { lg: 'calc(100vh - 32px)' },
            display: 'flex',
            flexDirection: 'column'
        }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>{UI_STRINGS.WAITLISTED}</Typography>
                <Chip size="small" variant="outlined" label={placements.length} aria-label={`${placements.length} ${placements.length === 1 ? UI_STRINGS.UNIT_STUDENT : UI_STRINGS.UNIT_STUDENTS}`} sx={{ color: 'text.primary' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>{UI_STRINGS.WAITLIST_PANEL_HELP}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', minHeight: 0, pr: 0.25 }}>
                {placements.length === 0 && <Typography color="text.secondary">{UI_STRINGS.WAITLIST_EMPTY}</Typography>}
                {[...placements].sort(byAnchorThenName).map(placement =>
                    <PlanStudentCard
                        key={placement.student_id}
                        placement={placement}
                        onSeeDetails={onSeeDetails}
                        onChangeGroup={onChangeGroup}
                        onToggleAnchor={onToggleAnchor} />
                )}
            </Box>
        </CardContent>
    </Card>
);
