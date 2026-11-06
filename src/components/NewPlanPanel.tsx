/**
 *  NewPlanPanel.tsx
 *
 *  The contents of the "Create New Plan" window, with its title and buttons, so the same
 *  panel can be the whole of that window (NewPlanDialog) or one step of the Create Cohort
 *  window. It shows the cohort and asks for a name, a minimum overlap and a range of group
 *  sizes, and shows what the plan would look like as the settings change: the numbers
 *  of groups, students and waitlisted students, and the three charts of group size,
 *  countries per group and time overlap per group. The preview is the real grouping run
 *  in memory on the cohort's students, so the plan that "Create plan" makes comes out the
 *  same. "Optimize" compares 50 shuffled orders of the students and keeps the grouping
 *  that waitlists the fewest; the order it picked is passed on to "Create plan" too.
 *  Nothing is saved until "Create plan" is pressed, and then the user is taken to the
 *  new plan.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useNotifications } from "@digitalaidseattle/core";
import {
    Box,
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Cohort, Placement } from "../api/types";
import { UI_STRINGS } from "../constants";
import { CECohortService } from "../services/cohort/ceCohortService";
import { nextDefaultPlanName } from "../services/plan/planNaming";
import { GenerationSliders } from "./PlanGenerationControls";
import { useGenerationControls } from "./useGenerationControls";
import { PlanSummary } from "./PlanSummary";

/**
 * `onClose` is what Cancel does, and what happens once the plan is made. `onBusyChange` tells the window
 * around the panel when it is working, so that it is not closed part way through making the plan.
 */
export const NewPlanPanel = (props: { cohort: Cohort, onClose: () => void, onBusyChange?: (busy: boolean) => void }) => {
    const { cohort, onClose, onBusyChange } = props;
    const navigate = useNavigate();
    const notifications = useNotifications();

    // the name the user typed, or null until they type one, when the plan is named "Plan N" after the cohort's other plans
    const [typedName, setTypedName] = useState<string | null>(null);
    const name = typedName ?? nextDefaultPlanName(cohort.plans);
    const [creating, setCreating] = useState<boolean>(false);
    // One placement for each enrolled student, as the plan will have
    const placements = useMemo(
        () => (cohort.enrollments ?? [])
            .filter(enrollment => enrollment.student)
            .map(enrollment => ({
                plan_id: 'preview',
                student_id: enrollment.student_id,
                anchor: enrollment.student!.anchor || false,
                priority: 0,
                student: enrollment.student
            }) as Placement),
        [cohort]);

    // the settings, the grouping they would give, and Optimize
    const controls = useGenerationControls(placements, {}, creating);
    const { minOverlapHours, minGroupSize, maxGroupSize, shuffleSeed, stats } = controls;
    const busy = creating || controls.optimizing;
    useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

    const trimmedName = name.trim();
    const canCreate = trimmedName.length > 0 && !busy;

    const handleCreate = async () => {
        if (!canCreate) {
            return;
        }
        setCreating(true);
        try {
            const plan = await CECohortService.getInstance().createPlan(cohort, {
                name: trimmedName,
                minOverlapHours,
                minGroupSize,
                maxGroupSize,
                shuffleSeed
            });
            notifications.success(`Plan ${plan.name} created.`);
            onClose();
            navigate(`/plan/${plan.id}`);
        } catch (error) {
            console.error('Could not create plan.', error);
            notifications.error(`Could not create plan. ${error instanceof Error ? error.message : error}`);
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <DialogTitle>{UI_STRINGS.CREATE_NEW_PLAN}</DialogTitle>
            <DialogContent>
                <Stack gap={3} sx={{ paddingTop: 1 }}>
                    {/* the cohort the plan is for, shown to the left of the plan's name; the two fields line up */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <TextField
                            label={UI_STRINGS.COHORT_LABEL}
                            sx={{ flex: '1 1 180px', minWidth: 0 }}
                            value={cohort.name ?? ''}
                            slotProps={{
                                input: { readOnly: true, sx: { bgcolor: 'action.hover' } },
                                htmlInput: { tabIndex: -1 }
                            }} />
                        <TextField
                            autoFocus
                            label={UI_STRINGS.PLAN_NAME_LABEL}
                            sx={{ flex: '2 1 280px', minWidth: 0 }}
                            value={name}
                            disabled={busy}
                            onChange={(event) => setTypedName(event.target.value)} />
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{UI_STRINGS.NEW_PLAN_PREVIEW}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {placements.length === 0 ? UI_STRINGS.NEW_PLAN_NO_STUDENTS : UI_STRINGS.NEW_PLAN_PREVIEW_HELP}
                        </Typography>
                    </Box>
                    <PlanSummary stats={stats} />

                    <GenerationSliders controls={controls} disabled={busy} inlineOptimize />

                </Stack>
            </DialogContent>
            <DialogActions sx={{ padding: '8px 24px 16px' }}>
                <Button onClick={onClose} disabled={busy}>{UI_STRINGS.CANCEL}</Button>
                <Button
                    variant="contained"
                    disabled={!canCreate}
                    startIcon={creating ? <CircularProgress size={16} color="inherit" /> : undefined}
                    onClick={handleCreate}>
                    {creating ? UI_STRINGS.CREATING_PLAN : UI_STRINGS.CREATE_PLAN}
                </Button>
            </DialogActions>
        </>
    );
};
