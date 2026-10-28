/**
 *  NewPlanDialog.tsx
 *
 *  The "Create New Plan" window. It shows the cohort and asks for a name, a minimum overlap and a range of group
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
import { ThunderboltOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    Slider,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Cohort, Placement, Plan } from "../api/types";
import { MAX_GROUP_SIZE, UI_STRINGS } from "../constants";
import { CECohortService } from "../services/cohort/ceCohortService";
import { ARRANGEMENTS_TO_COMPARE, generatePlan, optimizeGrouping, OptimizeProgress } from "../services/plan/planGeneration";
import { nextDefaultPlanName } from "../services/plan/planNaming";
import { formatNumber, planStats } from "../services/plan/planStats";
import { PlanSummary } from "./PlanSummary";

/** The most hours of overlap that can be asked for. */
const MAX_MIN_OVERLAP_HOURS = 8;

/** The ends of the group size slider: the smallest group that can be asked for, and the largest. */
const SMALLEST_GROUP_SIZE = 1;
const LARGEST_GROUP_SIZE = 15;

/** How long each comparison is shown for while optimizing, so the progress bar can be followed. */
const COMPARISON_PAUSE_MS = 15;
const pause = () => new Promise<void>(resolve => setTimeout(resolve, COMPARISON_PAUSE_MS));

const DEFAULTS = { minOverlapHours: 0, minGroupSize: SMALLEST_GROUP_SIZE, maxGroupSize: MAX_GROUP_SIZE };

/** A slider with its name and current value above it. A list of values makes a slider with a thumb for each. */
const Setting: React.FC<{
    label: string,
    valueText: string,
    sliderLabels: string[],
    value: number | number[],
    min: number,
    max: number,
    step: number,
    disabled: boolean,
    onChange: (value: number | number[]) => void
}> = ({ label, valueText, sliderLabels, value, min, max, step, disabled, onChange }) => (
    <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>
            <Typography variant="body2">{valueText}</Typography>
        </Stack>
        <Slider
            getAriaLabel={(index) => sliderLabels[index] ?? sliderLabels[0]}
            value={value}
            min={min}
            max={max}
            step={step}
            marks
            disableSwap
            disabled={disabled}
            onChange={(_event, newValue) => onChange(newValue)} />
    </Box>
);

/** The group size range in words: "5 to 10 students", "Up to 10 students", "Exactly 6 students". */
const groupSizeText = (min: number, max: number) => {
    const students = (count: number) => `${count} ${count === 1 ? UI_STRINGS.UNIT_STUDENT : UI_STRINGS.UNIT_STUDENTS}`;
    if (min === max) {
        return `${UI_STRINGS.EXACTLY} ${students(max)}`;
    }
    return min === SMALLEST_GROUP_SIZE
        ? `${UI_STRINGS.UP_TO} ${students(max)}`
        : `${min} ${UI_STRINGS.TO} ${students(max)}`;
};

export const NewPlanDialog = (props: { cohort: Cohort, open: boolean, onClose: () => void }) => {
    const { cohort, open, onClose } = props;
    const navigate = useNavigate();
    const notifications = useNotifications();

    // the name the user typed, or null until they type one, when the plan is named "Plan N" after the cohort's other plans
    const [typedName, setTypedName] = useState<string | null>(null);
    const name = typedName ?? nextDefaultPlanName(cohort.plans);
    const [minOverlapHours, setMinOverlapHours] = useState<number>(DEFAULTS.minOverlapHours);
    const [minGroupSize, setMinGroupSize] = useState<number>(DEFAULTS.minGroupSize);
    const [maxGroupSize, setMaxGroupSize] = useState<number>(DEFAULTS.maxGroupSize);
    const [creating, setCreating] = useState<boolean>(false);
    // the shuffled order Optimize chose, and how much it helped; both go back to nothing when a setting changes
    const [shuffleSeed, setShuffleSeed] = useState<number | undefined>(undefined);
    const [optimizeResult, setOptimizeResult] = useState<{ before: number, after: number } | null>(null);
    const [progress, setProgress] = useState<OptimizeProgress | null>(null);
    const optimizing = progress !== null;
    const busy = creating || optimizing;

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

    // The grouping the plan would get with these settings
    const stats = useMemo(() => {
        const generated = generatePlan(placements, { maxGroupSize, minOverlapHours, minGroupSize, shuffleSeed });
        return planStats({ groups: generated.groups, placements: generated.placements } as unknown as Plan);
    }, [placements, minOverlapHours, minGroupSize, maxGroupSize, shuffleSeed]);

    const trimmedName = name.trim();
    const canCreate = trimmedName.length > 0 && !busy;

    // A different setting is a different problem, so the arrangement chosen for the old one is dropped
    const changeSetting = (change: () => void) => {
        change();
        setShuffleSeed(undefined);
        setOptimizeResult(null);
    };

    const handleOptimize = async () => {
        if (busy || placements.length === 0) {
            return;
        }
        setOptimizeResult(null);
        setProgress({ compared: 0, total: ARRANGEMENTS_TO_COMPARE });
        try {
            const result = await optimizeGrouping(
                placements,
                { maxGroupSize, minOverlapHours, minGroupSize, shuffleSeed },
                {
                    // start somewhere new each time, so pressing Optimize again searches further
                    firstSeed: Math.floor(Math.random() * 1_000_000_000),
                    onProgress: setProgress,
                    pause
                });
            setShuffleSeed(result.shuffleSeed);
            setOptimizeResult({ before: result.waitlistedBefore, after: result.waitlistedAfter });
        } catch (error) {
            console.error('Could not optimize the groups.', error);
            notifications.error(`Could not optimize the groups. ${error instanceof Error ? error.message : error}`);
        } finally {
            setProgress(null);
        }
    };

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

    const reset = () => {
        setTypedName(null);
        setMinOverlapHours(DEFAULTS.minOverlapHours);
        setMinGroupSize(DEFAULTS.minGroupSize);
        setMaxGroupSize(DEFAULTS.maxGroupSize);
        setShuffleSeed(undefined);
        setOptimizeResult(null);
    };

    return (
        <Dialog
            open={open}
            // do not close the window while the plan is being made
            onClose={busy ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ transition: { onExited: reset } }}>
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

                    <Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', columnGap: 4, rowGap: 1 }}>
                            <Setting
                                label={UI_STRINGS.MIN_OVERLAP_LABEL}
                                valueText={minOverlapHours === 0
                                    ? UI_STRINGS.NO_MINIMUM
                                    : `${formatNumber(minOverlapHours)} ${minOverlapHours === 1 ? UI_STRINGS.UNIT_HOUR : UI_STRINGS.HOURS}`}
                                sliderLabels={[UI_STRINGS.MIN_OVERLAP_LABEL]}
                                value={minOverlapHours}
                                min={0}
                                max={MAX_MIN_OVERLAP_HOURS}
                                step={0.5}
                                disabled={busy}
                                onChange={(value) => changeSetting(() => setMinOverlapHours(value as number))} />
                            <Setting
                                label={UI_STRINGS.GROUP_SIZE_LABEL}
                                valueText={groupSizeText(minGroupSize, maxGroupSize)}
                                sliderLabels={[UI_STRINGS.MIN_GROUP_SIZE_LABEL, UI_STRINGS.MAX_GROUP_SIZE_LABEL]}
                                value={[minGroupSize, maxGroupSize]}
                                min={SMALLEST_GROUP_SIZE}
                                max={LARGEST_GROUP_SIZE}
                                step={1}
                                disabled={busy}
                                onChange={(value) => changeSetting(() => {
                                    const [least, most] = value as number[];
                                    setMinGroupSize(least);
                                    setMaxGroupSize(most);
                                })} />
                        </Box>
                        {optimizing
                            ? (
                                <Box sx={{ marginTop: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{UI_STRINGS.COMPARING_GROUPINGS}</Typography>
                                        <Typography variant="body2">{progress.compared} {UI_STRINGS.COMPARED_OF} {progress.total}</Typography>
                                    </Stack>
                                    <LinearProgress
                                        aria-label={UI_STRINGS.COMPARING_GROUPINGS}
                                        variant="determinate"
                                        value={progress.total === 0 ? 100 : 100 * progress.compared / progress.total}
                                        sx={{ marginTop: 0.5, height: 6, borderRadius: 3 }} />
                                </Box>)
                            : (
                                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ marginTop: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {UI_STRINGS.NEW_PLAN_HELP}
                                        {optimizeResult && ` ${optimizeResult.after < optimizeResult.before
                                            ? `${UI_STRINGS.OPTIMIZE_IMPROVED} ${optimizeResult.before} to ${optimizeResult.after}.`
                                            : `${UI_STRINGS.OPTIMIZE_NO_BETTER} ${optimizeResult.before}.`}`}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ThunderboltOutlined />}
                                        disabled={busy || placements.length === 0}
                                        onClick={handleOptimize}
                                        sx={{ flexShrink: 0 }}>
                                        {UI_STRINGS.OPTIMIZE}
                                    </Button>
                                </Stack>)}
                    </Box>

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
        </Dialog>
    );
};
