/**
 *  PlanSettingsDialog.tsx
 *
 *  The settings of an existing plan: the least shared time and the range of group sizes, with a
 *  preview of the groups they would make (the numbers of groups, students and waitlisted students,
 *  and the three charts), as in the Create New Plan window. "Optimize" looks for the grouping that
 *  waitlists the fewest, and only changes the preview. "Update plan" is what regroups the plan's
 *  students and saves it; Cancel leaves the plan as it is.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import { Plan } from "../api/types";
import { planStats } from "../services/plan/planStats";
import { MAX_GROUP_SIZE, OPTIMIZATION_STYLES, UI_STRINGS } from '../constants';
import { GenerationSliders, OptimizeButton } from "./PlanGenerationControls";
import { DEFAULT_OPTIMIZATION_STYLE, GenerationChoice, LARGEST_GROUP_SIZE, SMALLEST_GROUP_SIZE, useGenerationControls } from "./useGenerationControls";
import { PlanSummary } from "./PlanSummary";

interface Props {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
  /** regroups and saves the plan with these settings; the window stays open, working, until it is done */
  onSubmit: (settings: GenerationChoice) => Promise<void> | void;
}

/** What the window shows while it is open. It is only mounted then, so each time it opens it starts from the plan's own settings. */
const PlanSettingsContent: React.FC<Omit<Props, 'isOpen'>> = ({ plan, onClose, onSubmit }) => {
  const [updating, setUpdating] = useState<boolean>(false);

  // the students as they are placed now; the preview groups them afresh
  const placements = useMemo(() => plan.placements ?? [], [plan.placements]);
  const currentStats = useMemo(() => planStats(plan), [plan]);
  const controls = useGenerationControls(
    placements,
    {
      maxGroupSize: Math.min(Math.max(plan.group_size ?? MAX_GROUP_SIZE, SMALLEST_GROUP_SIZE), LARGEST_GROUP_SIZE),
      // a plan with a style this version does not know starts from the default
      optimizationStyle: OPTIMIZATION_STYLES.some(style => style.value === plan.optimization_style) ? plan.optimization_style : DEFAULT_OPTIMIZATION_STYLE
    },
    updating,
    currentStats);
  const busy = updating || controls.optimizing;

  const handleUpdate = async () => {
    if (busy) {
      return;
    }
    setUpdating(true);
    try {
      await onSubmit({
        minOverlapHours: controls.minOverlapHours,
        minGroupSize: controls.minGroupSize,
        maxGroupSize: controls.maxGroupSize,
        optimizationStyle: controls.optimizationStyle,
        shuffleSeed: controls.shuffleSeed
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <DialogTitle id="plan-settings-title">{UI_STRINGS.PLAN_SETTINGS_TITLE}</DialogTitle>
      <DialogContent>
        <Stack gap={3} sx={{ paddingTop: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{UI_STRINGS.NEW_PLAN_PREVIEW}</Typography>
            <Typography variant="caption" color="text.secondary">
              {controls.showingCurrent ? UI_STRINGS.PLAN_SETTINGS_CURRENT_HELP : UI_STRINGS.PLAN_SETTINGS_PREVIEW_HELP}
            </Typography>
          </Box>
          <PlanSummary stats={controls.stats} />
          <GenerationSliders controls={controls} disabled={busy} />
          <TextField
            select
            size="small"
            label={UI_STRINGS.GENERATION_METHOD}
            value={controls.optimizationStyle}
            disabled={busy}
            onChange={(event) => controls.setOptimizationStyle(event.target.value)}
            sx={{ maxWidth: 280 }}>
            {OPTIMIZATION_STYLES.map(style => <MenuItem key={style.value} value={style.value}>{style.label}</MenuItem>)}
          </TextField>
          <Typography variant="caption" color="text.secondary">{UI_STRINGS.PLAN_SETTINGS_WARNING}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ padding: '8px 24px 16px' }}>
        <Button onClick={onClose} disabled={busy}>{UI_STRINGS.CANCEL}</Button>
        <OptimizeButton controls={controls} disabled={updating} size="medium" />
        <Button
          variant="contained"
          disabled={busy}
          startIcon={updating ? <CircularProgress size={16} color="inherit" /> : undefined}
          onClick={handleUpdate}>
          {updating ? UI_STRINGS.UPDATING_PLAN : UI_STRINGS.UPDATE_PLAN}
        </Button>
      </DialogActions>
    </>
  );
};

const PlanSettingsDialog: React.FC<Props> = ({ isOpen, onClose, onSubmit, plan }) => {
  // a new one for each time the window opens, so the contents start again from the plan's settings
  const [session, setSession] = useState<number>(0);
  const [wasOpen, setWasOpen] = useState<boolean>(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setSession(session + 1);
    }
  }
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="plan-settings-title">
      <PlanSettingsContent key={session} plan={plan} onClose={onClose} onSubmit={onSubmit} />
    </Dialog>
  );
};

export default PlanSettingsDialog;
