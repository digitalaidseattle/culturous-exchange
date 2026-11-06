/**
 *  PlanGenerationControls.tsx
 *
 *  What the Create New Plan window and the plan settings window share: the sliders for the settings
 *  that decide how students are grouped (the least shared time, and the range of group sizes) and
 *  the Optimize button. The state and the work, including the preview of the groups the settings
 *  would make, are in `useGenerationControls`. `GenerationSliders` draws the sliders,
 *  with the progress of Optimize in place of the help text while it runs. Each window places Optimize
 *  where it likes: `OptimizeButton`.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { ThunderboltOutlined } from "@ant-design/icons";
import { Box, Button, LinearProgress, Slider, Stack, Typography } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { formatNumber } from "../services/plan/planStats";
import { GenerationControls, groupSizeText, LARGEST_GROUP_SIZE, MAX_MIN_OVERLAP_HOURS, optimizeSentence, SMALLEST_GROUP_SIZE } from "./useGenerationControls";

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

export const OptimizeButton: React.FC<{ controls: GenerationControls, disabled?: boolean, size?: 'small' | 'medium', variant?: 'outlined' | 'text' }> =
    ({ controls, disabled, size = 'small', variant = 'outlined' }) => (
        <Button
            variant={variant}
            size={size}
            startIcon={<ThunderboltOutlined />}
            disabled={disabled || controls.optimizing || controls.studentCount === 0}
            onClick={controls.optimize}
            sx={{ flexShrink: 0 }}>
            {UI_STRINGS.OPTIMIZE}
        </Button>
    );

/**
 * The two sliders, with the help text under them, or the progress of Optimize while it runs. When
 * `inlineOptimize` the Optimize button is beside the help text; otherwise the window has it elsewhere.
 */
export const GenerationSliders: React.FC<{ controls: GenerationControls, disabled: boolean, inlineOptimize?: boolean }> =
    ({ controls, disabled, inlineOptimize }) => {
        const { minOverlapHours, minGroupSize, maxGroupSize, progress, optimizeResult } = controls;
        return (
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
                        disabled={disabled}
                        onChange={(value) => controls.setMinOverlapHours(value as number)} />
                    <Setting
                        label={UI_STRINGS.GROUP_SIZE_LABEL}
                        valueText={groupSizeText(minGroupSize, maxGroupSize)}
                        sliderLabels={[UI_STRINGS.MIN_GROUP_SIZE_LABEL, UI_STRINGS.MAX_GROUP_SIZE_LABEL]}
                        value={[minGroupSize, maxGroupSize]}
                        min={SMALLEST_GROUP_SIZE}
                        max={LARGEST_GROUP_SIZE}
                        step={1}
                        disabled={disabled}
                        onChange={(value) => {
                            const [least, most] = value as number[];
                            controls.setGroupSizeRange(least, most);
                        }} />
                </Box>
                {progress
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
                                {optimizeResult && ` ${optimizeSentence(optimizeResult)}`}
                            </Typography>
                            {inlineOptimize && <OptimizeButton controls={controls} disabled={disabled} />}
                        </Stack>)}
            </Box>
        );
    };
