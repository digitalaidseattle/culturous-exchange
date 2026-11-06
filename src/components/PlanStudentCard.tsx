/**
 *  PlanStudentCard.tsx
 *
 *  A student on the groups page, as a compact card: their name, their country with its flag, and
 *  an Anchor badge when they are an anchor student. A three dot menu opens See details and
 *  Change group, and sets or removes the anchor flag.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { MoreOutlined } from "@ant-design/icons";
import { Box, IconButton, Menu, MenuItem, Paper, Stack, Typography } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import { Placement } from "../api/types";
import { UI_STRINGS } from "../constants";
import { UNKNOWN_COUNTRY_FLAG, countryFlag } from "../utils/countryFlag";
import { AnchorBadge } from "./AnchorBadge";

export type PlanStudentCardProps = {
    placement: Placement,
    /** the three dot menu is left off where the card is only shown, as in the Change group window */
    onSeeDetails?: (placement: Placement) => void,
    onChangeGroup?: (placement: Placement) => void,
    onToggleAnchor?: (placement: Placement) => void
};

/** The space between the name and the badge. */
const BADGE_GAP = 6;

/**
 * Whether the Anchor badge has to shrink to its icon: the name, the gap, and the whole badge do not
 * fit in the row. Measured as the card is shown, and again whenever its width changes.
 */
function useCompactBadge(anchor: boolean, name: string) {
    const row = useRef<HTMLDivElement>(null);
    const nameText = useRef<HTMLElement>(null);
    // the whole badge's width, taken while it is showing and kept for when it is not
    const fullWidth = useRef(0);
    const [compact, setCompact] = useState<boolean>(false);

    useLayoutEffect(() => {
        const rowElement = row.current;
        const nameElement = nameText.current;
        if (!anchor || !rowElement || !nameElement) {
            return;
        }
        const measure = () => {
            const badge = rowElement.querySelector<HTMLElement>('[data-anchor-badge="full"]');
            if (badge && badge.offsetWidth > 0) {
                fullWidth.current = badge.offsetWidth;
            }
            // nothing is laid out (as when there is no screen), so nothing can be said not to fit
            if (fullWidth.current === 0) {
                return;
            }
            // the name's scroll width is its whole text, even when it is cut short with dots
            setCompact(nameElement.scrollWidth + BADGE_GAP + fullWidth.current > rowElement.clientWidth);
        };
        measure();
        const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
        observer?.observe(rowElement);
        // the name is wider or narrower once the page's font has loaded
        document.fonts?.ready.then(measure);
        return () => observer?.disconnect();
    }, [anchor, name]);

    return { row, nameText, compact: anchor && compact };
}

export const PlanStudentCard: React.FC<PlanStudentCardProps> = ({ placement, onSeeDetails, onChangeGroup, onToggleAnchor }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const student = placement.student;
    const name = student?.name ?? '';
    const badge = useCompactBadge(placement.anchor, name);
    const hasMenu = Boolean(onSeeDetails || onChangeGroup || onToggleAnchor);

    const choose = (action?: (placement: Placement) => void) => () => {
        setAnchorEl(null);
        action?.(placement);
    };

    return (
        <Paper
            variant="outlined"
            data-student={placement.student_id}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1.5, pr: 0.5, py: 0.75, minWidth: 0, bgcolor: 'background.paper' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* the badge sits to the right of the name; it keeps its place, and gives up its word first, when the row is short */}
                <Stack ref={badge.row} direction="row" alignItems="center" flexWrap="nowrap" sx={{ gap: `${BADGE_GAP}px` }}>
                    <Typography ref={badge.nameText} noWrap sx={{ fontWeight: 600, minWidth: 0, flex: '0 1 auto' }} title={name}>{name}</Typography>
                    {placement.anchor && <Box sx={{ flex: 'none', display: 'flex' }}><AnchorBadge compact={badge.compact} /></Box>}
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                    <span aria-hidden="true">{countryFlag(student?.country) ?? UNKNOWN_COUNTRY_FLAG}</span>
                    {' '}{student?.country}
                </Typography>
            </Box>
            {hasMenu &&
                <>
                    <IconButton
                        size="small"
                        aria-label={`${UI_STRINGS.MORE_ACTIONS_FOR} ${name}`}
                        aria-haspopup="menu"
                        onClick={(event) => setAnchorEl(event.currentTarget)}>
                        <MoreOutlined />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                        {onSeeDetails && <MenuItem onClick={choose(onSeeDetails)}>{UI_STRINGS.SEE_DETAILS}</MenuItem>}
                        {onChangeGroup && <MenuItem onClick={choose(onChangeGroup)}>{UI_STRINGS.CHANGE_GROUP}</MenuItem>}
                        {onToggleAnchor &&
                            <MenuItem onClick={choose(onToggleAnchor)}>
                                {placement.anchor ? UI_STRINGS.REMOVE_ANCHOR : UI_STRINGS.SET_ANCHOR}
                            </MenuItem>}
                    </Menu>
                </>
            }
        </Paper>
    );
};
