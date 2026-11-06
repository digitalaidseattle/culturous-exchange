/**
 *  useGenerationControls.ts
 *
 *  The state and the work behind the plan generation controls (see PlanGenerationControls): the
 *  settings, the preview of the grouping they would make, and Optimize.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useNotifications } from "@digitalaidseattle/core";
import { useMemo, useState } from "react";
import { Placement, Plan } from "../api/types";
import { MAX_GROUP_SIZE, UI_STRINGS } from "../constants";
import { ARRANGEMENTS_TO_COMPARE, generatePlan, GenerationSettings, optimizeGrouping, OptimizeProgress } from "../services/plan/planGeneration";
import { PlanStats, planStats } from "../services/plan/planStats";

/** The most hours of overlap that can be asked for. */
export const MAX_MIN_OVERLAP_HOURS = 8;

/** The ends of the group size slider: the smallest group that can be asked for, and the largest. */
export const SMALLEST_GROUP_SIZE = 1;
export const LARGEST_GROUP_SIZE = 15;

/** How long each comparison is shown for while optimizing, so the progress bar can be followed. */
const COMPARISON_PAUSE_MS = 15;
const pause = () => new Promise<void>(resolve => setTimeout(resolve, COMPARISON_PAUSE_MS));

export const GENERATION_DEFAULTS = { minOverlapHours: 0, minGroupSize: SMALLEST_GROUP_SIZE, maxGroupSize: MAX_GROUP_SIZE };

/** The settings, and the arrangement Optimize chose, that make a grouping. */
export type GenerationChoice = {
    minOverlapHours: number,
    minGroupSize: number,
    maxGroupSize: number,
    shuffleSeed?: number
};

export type GenerationControls = GenerationChoice & {
    /** what the grouping would look like; or, until a setting is changed or Optimize is run, the stats given as the current ones */
    stats: PlanStats,
    /** whether `stats` are still the current ones */
    showingCurrent: boolean,
    /** how many students there are to group */
    studentCount: number,
    /** how much the last Optimize helped; nothing until it has run, and again once a setting changes */
    optimizeResult: { before: number, after: number } | null,
    progress: OptimizeProgress | null,
    optimizing: boolean,
    setMinOverlapHours: (hours: number) => void,
    setGroupSizeRange: (min: number, max: number) => void,
    optimize: () => Promise<void>
};

/**
 * `placements` are the students to group; any group they are in is ignored. `busy` is whether the
 * window around is working on something else, which Optimize must not run alongside. A plan that already
 * has groups passes its `current` stats, which are what the preview shows until the settings are touched:
 * its own settings are not all saved with it, so grouping afresh could not match it.
 */
export function useGenerationControls(
    placements: Placement[], initial: Partial<GenerationChoice> = {}, busy = false, current?: PlanStats
): GenerationControls {
    const notifications = useNotifications();
    const [minOverlapHours, setMinOverlapHours] = useState<number>(initial.minOverlapHours ?? GENERATION_DEFAULTS.minOverlapHours);
    const [minGroupSize, setMinGroupSize] = useState<number>(initial.minGroupSize ?? GENERATION_DEFAULTS.minGroupSize);
    const [maxGroupSize, setMaxGroupSize] = useState<number>(initial.maxGroupSize ?? GENERATION_DEFAULTS.maxGroupSize);
    // the shuffled order Optimize chose, and how much it helped; both go back to nothing when a setting changes
    const [shuffleSeed, setShuffleSeed] = useState<number | undefined>(undefined);
    const [optimizeResult, setOptimizeResult] = useState<{ before: number, after: number } | null>(null);
    const [progress, setProgress] = useState<OptimizeProgress | null>(null);
    const [touched, setTouched] = useState<boolean>(false);

    // The grouping the settings give
    const stats = useMemo(() => {
        const generated = generatePlan(placements, { maxGroupSize, minOverlapHours, minGroupSize, shuffleSeed });
        return planStats({ groups: generated.groups, placements: generated.placements } as unknown as Plan);
    }, [placements, minOverlapHours, minGroupSize, maxGroupSize, shuffleSeed]);

    // A different setting is a different problem, so the arrangement chosen for the old one is dropped
    const changed = () => {
        setTouched(true);
        setShuffleSeed(undefined);
        setOptimizeResult(null);
    };

    const optimize = async () => {
        if (busy || progress !== null || placements.length === 0) {
            return;
        }
        setOptimizeResult(null);
        setProgress({ compared: 0, total: ARRANGEMENTS_TO_COMPARE });
        try {
            const settings: GenerationSettings = { maxGroupSize, minOverlapHours, minGroupSize, shuffleSeed };
            const result = await optimizeGrouping(placements, settings, {
                // start somewhere new each time, so pressing Optimize again searches further
                firstSeed: Math.floor(Math.random() * 1_000_000_000),
                onProgress: setProgress,
                pause
            });
            setTouched(true);
            setShuffleSeed(result.shuffleSeed);
            setOptimizeResult({ before: result.waitlistedBefore, after: result.waitlistedAfter });
        } catch (error) {
            console.error('Could not optimize the groups.', error);
            notifications.error(`Could not optimize the groups. ${error instanceof Error ? error.message : error}`);
        } finally {
            setProgress(null);
        }
    };

    return {
        minOverlapHours, minGroupSize, maxGroupSize, shuffleSeed,
        stats: !touched && current ? current : stats,
        showingCurrent: !touched && Boolean(current),
        studentCount: placements.length,
        optimizeResult,
        progress,
        optimizing: progress !== null,
        setMinOverlapHours: (hours) => { setMinOverlapHours(hours); changed(); },
        setGroupSizeRange: (min, max) => { setMinGroupSize(min); setMaxGroupSize(max); changed(); },
        optimize
    };
}

/** The group size range in words: "5 to 10 students", "Up to 10 students", "Exactly 6 students". */
export const groupSizeText = (min: number, max: number) => {
    const students = (count: number) => `${count} ${count === 1 ? UI_STRINGS.UNIT_STUDENT : UI_STRINGS.UNIT_STUDENTS}`;
    if (min === max) {
        return `${UI_STRINGS.EXACTLY} ${students(max)}`;
    }
    return min === SMALLEST_GROUP_SIZE
        ? `${UI_STRINGS.UP_TO} ${students(max)}`
        : `${min} ${UI_STRINGS.TO} ${students(max)}`;
};

/** The words about how Optimize went: "Found a grouping that waitlists fewer students: from 5 to 3." */
export const optimizeSentence = (result: { before: number, after: number }) =>
    result.after < result.before
        ? `${UI_STRINGS.OPTIMIZE_IMPROVED} ${result.before} to ${result.after}.`
        : `${UI_STRINGS.OPTIMIZE_NO_BETTER} ${result.before}.`;

