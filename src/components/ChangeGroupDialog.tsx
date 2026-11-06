/**
 *  ChangeGroupDialog.tsx
 *
 *  The "Change group" window: the student's card and weekend availability on the left, and on
 *  the right a list of the plan's groups. Each group is a card to select, showing how many
 *  students it has, the countries they come from, and the time the student has in common with
 *  the group, drawn on a little calendar. A group the student shares no time with is marked in
 *  red. The button reads "Move to" and the chosen group, and is off until one is chosen.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Group, Placement, Plan } from "../api/types";
import { UI_STRINGS, WAITLIST_ID } from "../constants";
import { GroupFit, groupFit, placementsInGroup } from "../services/plan/groupFit";
import { countryFlag, UNKNOWN_COUNTRY_FLAG } from "../utils/countryFlag";
import { formatHours } from "../utils/weekendGrid";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { PlanStudentCard } from "./PlanStudentCard";

/** How many countries a group card names before saying "and 2 more". */
const COUNTRIES_SHOWN = 3;

const visuallyHidden = {
    position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)'
} as const;

const studentsText = (count: number) => `${count} ${count === 1 ? UI_STRINGS.UNIT_STUDENT : UI_STRINGS.UNIT_STUDENTS}`;

const countriesText = (countries: string[]) => {
    const named = countries.slice(0, COUNTRIES_SHOWN).map(country => `${countryFlag(country) ?? UNKNOWN_COUNTRY_FLAG} ${country}`);
    const more = countries.length - COUNTRIES_SHOWN;
    return more > 0 ? `${named.join(', ')} and ${more} more` : named.join(', ');
};

/** One choice in the list: a card that is a radio button. */
const Choice: React.FC<{
    id: string,
    name: string,
    selected: boolean,
    disabled?: boolean,
    warn?: boolean,
    onSelect: () => void,
    children: React.ReactNode
}> = ({ id, name, selected, disabled, warn, onSelect, children }) => (
    <Paper
        component="label"
        variant="outlined"
        data-group={id}
        sx={{
            display: 'block',
            position: 'relative',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            borderWidth: selected ? 2 : 1,
            // the thicker border of a chosen card does not push its contents about
            p: selected ? 'calc(12px - 1px)' : '12px',
            borderColor: selected ? 'primary.main' : warn ? 'error.main' : 'divider',
            bgcolor: (theme) => selected ? alpha(theme.palette.primary.main, 0.06) : theme.palette.background.paper,
            '&:hover': disabled ? undefined : { borderColor: selected ? 'primary.main' : warn ? 'error.main' : 'text.secondary' },
            '&:focus-within': { outline: (theme) => `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
        }}>
        <input
            type="radio"
            name="target-group"
            value={id}
            checked={selected}
            disabled={disabled}
            aria-label={name}
            onChange={onSelect}
            style={visuallyHidden} />
        {children}
    </Paper>
);

export type ChangeGroupDialogProps = {
    plan: Plan,
    /** the student to move; the window is open while there is one */
    placement: Placement | null,
    onClose: () => void,
    /** moves the student; true when it worked, which closes the window */
    onMove: (placement: Placement, groupId: string) => Promise<boolean>
};

export const ChangeGroupDialog: React.FC<ChangeGroupDialogProps> = ({ plan, placement, onClose, onMove }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [moving, setMoving] = useState<boolean>(false);

    // a fresh choice each time the window opens for a student
    useEffect(() => { setSelected(null); }, [placement?.student_id]);

    const student = placement?.student;
    const firstName = (student?.name ?? '').split(' ')[0];
    const currentGroupId = placement?.group_id ?? WAITLIST_ID;

    const groups = useMemo(
        () => [...(plan.groups ?? [])].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
        [plan.groups]);
    const fits = useMemo(() => {
        const byGroup = new Map<string, GroupFit>();
        groups.forEach(group => byGroup.set(group.id as string, groupFit(student, group, plan.placements ?? [])));
        return byGroup;
    }, [groups, student, plan.placements]);
    const waitlistSize = placementsInGroup(plan.placements ?? [], null).length
        + placementsInGroup(plan.placements ?? [], undefined).length;

    const target = groups.find(group => group.id === selected);
    const buttonLabel = selected === WAITLIST_ID
        ? UI_STRINGS.MOVE_TO_WAITLIST
        : target ? `${UI_STRINGS.MOVE_TO} ${target.name}` : `${UI_STRINGS.MOVE_TO} group`;

    const handleMove = async () => {
        if (!placement || !selected || moving) {
            return;
        }
        setMoving(true);
        try {
            if (await onMove(placement, selected)) {
                onClose();
            }
        } finally {
            setMoving(false);
        }
    };

    const renderGroup = (group: Group) => {
        const id = group.id as string;
        const fit = fits.get(id)!;
        const current = id === currentGroupId;
        const noOverlap = !current && fit.sharedHours === 0;
        return (
            <Choice
                key={id}
                id={id}
                name={group.name}
                selected={selected === id}
                disabled={current || moving}
                warn={noOverlap}
                onSelect={() => setSelected(id)}>
                <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography component="span" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                            {current && <Chip size="small" variant="outlined" label={UI_STRINGS.CURRENT_GROUP} sx={{ color: 'text.primary' }} />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">{studentsText(fit.size)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {fit.countries.length > 0 ? countriesText(fit.countries) : '—'}
                        </Typography>
                        {!current && (noOverlap
                            ? <Chip
                                size="small"
                                color="error"
                                variant="outlined"
                                label={`${UI_STRINGS.NO_SHARED_TIME} with ${firstName}`}
                                sx={{ mt: 0.75, color: 'error.dark', bgcolor: (theme) => alpha(theme.palette.error.main, 0.08), fontWeight: 600 }} />
                            : <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 600, color: 'primary.dark' }}>
                                {formatHours(fit.sharedHours)} shared with {firstName}
                            </Typography>)}
                    </Box>
                    <Box sx={{ width: 104, flexShrink: 0 }}>
                        <AvailabilityCalendar
                            size="mini"
                            label={`${group.name} and ${firstName}`}
                            windows={group.time_windows}
                            highlight={fit.shared}
                            noneLabel={UI_STRINGS.NO_SHARED_TIME} />
                    </Box>
                </Stack>
            </Choice>
        );
    };

    return (
        <Dialog open={Boolean(placement)} onClose={moving ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>{UI_STRINGS.CHANGE_GROUP}</DialogTitle>
            <DialogContent>
                {placement &&
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '250px minmax(0, 1fr)' }, gap: 3, pt: 1 }}>
                        <Stack gap={2}>
                            <PlanStudentCard placement={placement} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{UI_STRINGS.DETAILS_AVAILABILITY}</Typography>
                                <AvailabilityCalendar
                                    size="compact"
                                    label={`${student?.name} availability`}
                                    windows={student?.timeWindows}
                                    highlight={student?.timeWindows}
                                    noneLabel={UI_STRINGS.NO_TIME} />
                            </Box>
                        </Stack>
                        <Box
                            role="radiogroup"
                            aria-label={UI_STRINGS.MOVE_STUDENT_PROMPT}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxHeight: '60vh', overflowY: 'auto', pr: 0.5, py: 0.5 }}>
                            {groups.map(renderGroup)}
                            <Choice
                                id={WAITLIST_ID}
                                name={UI_STRINGS.WAITLISTED}
                                selected={selected === WAITLIST_ID}
                                disabled={currentGroupId === WAITLIST_ID || moving}
                                onSelect={() => setSelected(WAITLIST_ID)}>
                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography component="span" sx={{ fontWeight: 600 }}>{UI_STRINGS.WAITLISTED}</Typography>
                                    {currentGroupId === WAITLIST_ID && <Chip size="small" variant="outlined" label={UI_STRINGS.CURRENT_GROUP} sx={{ color: 'text.primary' }} />}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">{studentsText(waitlistSize)}</Typography>
                            </Choice>
                        </Box>
                    </Box>
                }
            </DialogContent>
            <DialogActions sx={{ padding: '8px 24px 16px' }}>
                <Button onClick={onClose} disabled={moving}>{UI_STRINGS.CANCEL}</Button>
                <Button
                    variant="contained"
                    disabled={!selected || moving}
                    startIcon={moving ? <CircularProgress size={16} color="inherit" /> : undefined}
                    onClick={handleMove}>
                    {buttonLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
