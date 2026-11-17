/**
 *  PlanStatusChip.tsx
 *
 *  The "Active" or "Inactive" tag beside a plan's name. Both read in the main text color so
 *  they are easy to read. An active plan is set apart by a pale sage-mint green surface and a
 *  matching border, an inactive one by a plain outline.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Chip } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { ACTIVE_STATUS_BORDER, ACTIVE_STATUS_SURFACE } from "../utils/styles";

export const PlanStatusChip: React.FC<{ active: boolean }> = ({ active }) => (
    <Chip
        label={active ? UI_STRINGS.ACTIVE : UI_STRINGS.INACTIVE}
        size="small"
        variant="outlined"
        sx={{
            color: 'text.primary',
            ...(active && { bgcolor: ACTIVE_STATUS_SURFACE, borderColor: ACTIVE_STATUS_BORDER })
        }} />
);
