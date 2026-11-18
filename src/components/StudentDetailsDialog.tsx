/**
 *  StudentDetailsDialog.tsx
 *
 *  The "See details" window for a student, as cards: who they are, where they are (city,
 *  country and time zone), when they are free (on the little weekend calendar), and where they
 *  stand in the plan.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import { Placement } from "../api/types";
import { UI_STRINGS } from "../constants";
import { UNKNOWN_COUNTRY_FLAG, countryFlag } from "../utils/countryFlag";
import { describeSegments, formatHours, gridHours, toWeekendSegments } from "../utils/weekendGrid";
import { AnchorBadge } from "./AnchorBadge";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const DetailCard: React.FC<{ title: string, children: React.ReactNode, sx?: object }> = ({ title, children, sx }) => (
    <Paper variant="outlined" component="section" aria-label={title} sx={{ p: 2, ...sx }}>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        {children}
    </Paper>
);

const Fact: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <Box sx={{ display: 'flex', gap: 1, py: 0.25 }}>
        <Typography variant="body2" color="text.secondary" sx={{ width: 96, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" sx={{ minWidth: 0, wordBreak: 'break-word' }}>{children}</Typography>
    </Box>
);

/** "UTC-5", "UTC+5:30" */
const utcOffset = (hours: number | null | undefined) => {
    if (hours === null || hours === undefined || Number.isNaN(hours)) {
        return '';
    }
    const sign = hours < 0 ? '-' : '+';
    const whole = Math.floor(Math.abs(hours));
    const minutes = Math.round((Math.abs(hours) - whole) * 60);
    return `UTC${sign}${whole}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
};

export const StudentDetailsDialog: React.FC<{
    placement: Placement | null,
    /** the name of the group the student is in; nothing means the waitlist */
    groupName?: string,
    onClose: () => void
}> = ({ placement, groupName, onClose }) => {
    const student = placement?.student;
    const segments = toWeekendSegments(student?.timeWindows);
    const hours = gridHours(student?.timeWindows);

    return (
        <Dialog open={Boolean(placement)} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{UI_STRINGS.STUDENT_DETAILS}</DialogTitle>
            <DialogContent>
                {student &&
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2, pt: 1 }}>
                        <DetailCard title={UI_STRINGS.DETAILS_PROFILE}>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                                <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                                {placement!.anchor && <AnchorBadge />}
                            </Stack>
                            <Fact label={UI_STRINGS.AGE}>{student.age ?? '—'}</Fact>
                            <Fact label={UI_STRINGS.GENDER}>{student.gender || '—'}</Fact>
                            <Fact label={UI_STRINGS.EMAIL}>{student.email || '—'}</Fact>
                        </DetailCard>

                        <DetailCard title={UI_STRINGS.DETAILS_PLACEMENT}>
                            <Fact label={UI_STRINGS.GROUP}>{groupName ?? UI_STRINGS.WAITLISTED}</Fact>
                            <Fact label={UI_STRINGS.ANCHOR}>{placement!.anchor ? 'Yes' : 'No'}</Fact>
                        </DetailCard>

                        <DetailCard title={UI_STRINGS.DETAILS_LOCATION}>
                            <Fact label={UI_STRINGS.CITY}>{student.city?.trim() || '—'}</Fact>
                            {student.state?.trim() && <Fact label={UI_STRINGS.STATE_REGION}>{student.state.trim()}</Fact>}
                            <Fact label={UI_STRINGS.COUNTRY}>
                                <span aria-hidden="true">{countryFlag(student.country) ?? UNKNOWN_COUNTRY_FLAG}</span> {student.country}
                            </Fact>
                            <Fact label={UI_STRINGS.TIME_ZONE}>
                                {[student.time_zone, utcOffset(student.tz_offset)].filter(Boolean).join(' ') || '—'}
                            </Fact>
                        </DetailCard>

                        <DetailCard title={UI_STRINGS.DETAILS_AVAILABILITY}>
                            <AvailabilityCalendar
                                size="full"
                                label={`${student.name} availability`}
                                windows={student.timeWindows}
                                noneLabel={UI_STRINGS.NO_TIME} />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {hours > 0 ? `${formatHours(hours)}: ${describeSegments(segments)}` : UI_STRINGS.NO_TIME}
                            </Typography>
                        </DetailCard>
                    </Box>
                }
            </DialogContent>
            <DialogActions sx={{ padding: '8px 24px 16px' }}>
                <Button variant="contained" onClick={onClose}>{UI_STRINGS.CLOSE}</Button>
            </DialogActions>
        </Dialog>
    );
};
