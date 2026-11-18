/**
 *  GroupSummary.tsx
 *
 *  The numbers that sum up one group, in a tinted panel like the totals of a plan: how many students,
 *  how many countries and how much time they share, with a little bar showing the split of genders.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { rainbowSurgePalette } from "@mui/x-charts/colorPalettes";
import { UI_STRINGS } from "../constants";
import { GenderKind, GenderSplit } from "../services/plan/groupFit";
import { insetPanelSx } from "../utils/styles";
import { formatHours } from "../utils/weekendGrid";

/**
 * The colors for the bar are the first three of MUI X Charts' own palette, as its pie charts take them (blue, orange,
 * red), so the bar matches the charts; they follow the theme's light or dark mode, as the charts do.
 */
const genderColors = (mode: 'light' | 'dark'): Record<GenderKind, string> => {
    const [female, male, other] = rainbowSurgePalette(mode);
    return { female, male, other };
};
const GENDER_LABELS: Record<GenderKind, string> = {
    female: UI_STRINGS.GENDER_FEMALE,
    male: UI_STRINGS.GENDER_MALE,
    other: UI_STRINGS.GENDER_OTHER
};

const Stat = (props: { value: string | number, label: string, error?: boolean }) => (
    <Stack alignItems="center" sx={{ flex: 1, minWidth: 0 }} data-stat={props.label}>
        <Typography variant="h3" component="p" sx={{ fontWeight: 600, color: props.error ? 'error.dark' : undefined }}>
            {props.value}
        </Typography>
        <Typography variant="caption" color={props.error ? 'error.dark' : 'text.secondary'} sx={{ textAlign: 'center', fontWeight: props.error ? 600 : undefined }}>
            {props.label}
        </Typography>
    </Stack>
);

const Rule = () => <Box role="separator" sx={{ alignSelf: 'stretch', borderLeft: 1, borderColor: 'divider' }} />;

export type GroupSummaryProps = {
    studentCount: number,
    countryCount: number,
    sharedHours: number,
    gender: GenderSplit,
    sx?: SxProps<Theme>
};

export const GroupSummary: React.FC<GroupSummaryProps> = ({ studentCount, countryCount, sharedHours, gender, sx }) => {
    // "1 hour", "6 hours" or "45 minutes": the number is big, and the unit is its label
    const [hours, unit] = formatHours(sharedHours).split(' ');
    const colors = genderColors(useTheme().palette.mode);
    const total = gender.reduce((sum, part) => sum + part.count, 0);
    const parts = gender.filter(part => part.count > 0);
    const describe = parts.map(part => `${part.count} ${GENDER_LABELS[part.kind].toLowerCase()}`).join(', ');

    return (
        <Box
            component="section"
            aria-label={UI_STRINGS.GROUP_SUMMARY}
            data-part="summary"
            sx={[
                insetPanelSx,
                { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 1.5, minWidth: 0 },
                ...(Array.isArray(sx) ? sx : [sx])
            ]}>
            <Stack direction="row" alignItems="center" gap={1}>
                <Stat value={studentCount} label={studentCount === 1 ? UI_STRINGS.UNIT_STUDENT : UI_STRINGS.UNIT_STUDENTS} />
                <Rule />
                <Stat value={countryCount} label={countryCount === 1 ? 'country' : UI_STRINGS.UNIT_COUNTRIES} />
                <Rule />
                {sharedHours > 0
                    ? <Stat value={hours} label={`${unit} shared`} />
                    : <Stat value={0} label={UI_STRINGS.NO_SHARED_TIME} error />}
            </Stack>
            <Box>
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 0.5 }}>{UI_STRINGS.GENDER_SPLIT}</Typography>
                <Box
                    role="img"
                    aria-label={`${UI_STRINGS.GENDER_SPLIT}: ${describe || 'no students'}`}
                    data-part="gender-bar"
                    sx={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', bgcolor: 'action.hover', gap: '2px' }}>
                    {parts.map(part =>
                        <Box
                            key={part.kind}
                            data-gender={part.kind}
                            data-count={part.count}
                            sx={{ flex: `${part.count} 1 0`, bgcolor: colors[part.kind] }} />
                    )}
                </Box>
                {total > 0 &&
                    <Stack direction="row" flexWrap="wrap" columnGap={1.5} rowGap={0.25} component="ul" aria-label="Gender counts" sx={{ listStyle: 'none', m: 0, p: 0, mt: 0.75 }}>
                        {parts.map(part =>
                            <Box component="li" key={part.kind} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box aria-hidden="true" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors[part.kind] }} />
                                <Typography variant="caption">{GENDER_LABELS[part.kind]} <strong>{part.count}</strong></Typography>
                            </Box>
                        )}
                    </Stack>}
            </Box>
        </Box>
    );
};
