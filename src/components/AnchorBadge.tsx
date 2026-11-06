/**
 *  AnchorBadge.tsx
 *
 *  The "Anchor" tag on an anchor student: an anchor icon and the word, in the main text color on
 *  a pale blue surface, so it reads clearly. Where there is no room for the word, `compact` keeps
 *  just the icon, which is still named "Anchor" for screen readers and as a tooltip.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Chip, SvgIcon, SvgIconProps } from "@mui/material";
import { alpha, Theme } from "@mui/material/styles";
import { UI_STRINGS } from "../constants";

/** An anchor, drawn on a 24 by 24 grid (the Material Design "anchor" icon). */
export const AnchorIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M17 15l1.55 1.55c-.96 1.69-3.33 3.04-5.55 3.37V11h3V9h-3V7.82C14.16 7.4 15 6.3 15 5c0-1.65-1.35-3-3-3S9 3.35 9 5c0 1.3.84 2.4 2 2.82V9H8v2h3v8.92c-2.22-.33-4.59-1.68-5.55-3.37L7 15l-4-3v3c0 3.88 4.92 7 9 7s9-3.12 9-7v-3l-4 3zM12 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
    </SvgIcon>
);

const surfaceSx = {
    bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
    borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.4)
};

export const AnchorBadge: React.FC<{ compact?: boolean }> = ({ compact }) => compact
    ? (
        <Box
            role="img"
            aria-label={UI_STRINGS.ANCHOR}
            title={UI_STRINGS.ANCHOR}
            data-anchor-badge="icon"
            sx={{
                ...surfaceSx,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: 1,
                color: 'primary.main'
            }}>
            <AnchorIcon sx={{ fontSize: 14 }} />
        </Box>)
    : (
        <Chip
            size="small"
            variant="outlined"
            data-anchor-badge="full"
            icon={<AnchorIcon sx={{ fontSize: 14 }} />}
            label={UI_STRINGS.ANCHOR}
            sx={{
                ...surfaceSx,
                color: 'text.primary',
                '& .MuiChip-icon': { color: 'primary.main', marginLeft: '6px' }
            }} />
    );
