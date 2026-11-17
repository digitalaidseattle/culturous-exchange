/**
 *  planGeneration.ts
 *
 *  Works out which students go in which group. It has no database access, so the
 *  "New Plan" window can run it over and over as the settings change, and the plan
 *  that is finally created is built by the very same code.
 *
 *  How it works:
 *
 *  1. Make enough empty groups for everyone: the number of students divided by the
 *     largest group allowed, rounded up. Every group starts with the whole
 *     program weekend as its shared time.
 *  2. Place students one at a time, anchor students first. A student can join a
 *     group that is not full and shares enough time with them. Joining narrows
 *     the group's shared time down to the time everyone in it has. Of the groups
 *     a student could join, the one with the most shared time wins (or the least,
 *     for "smallest first"); a tie goes to the emptier group.
 *  3. A student who fits no group goes on the waitlist.
 *  4. If groups must have a minimum size, take the smallest group that is too
 *     small, break it up, and try to place its students in the other groups.
 *     Repeat until every group is big enough. Students who fit nowhere are
 *     waitlisted.
 *
 *  "Shared time" is the real length of the time windows the whole group has in
 *  common, in hours. The order students are placed in is fixed, by anchor and then
 *  by student id, so the same students and settings always give the same groups.
 *
 *  The result depends on that order, so a shuffle seed can be given to place the
 *  students in a different, but still repeatable, order (anchors still go first).
 *  optimizeGrouping tries many seeds and picks the one that waitlists the fewest.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';

import { Identifier } from '@digitalaidseattle/core';
import { Group, Placement, TimeWindow } from '../../api/types';
import { MAX_GROUP_SIZE } from '../../constants';
import { CEGroupService } from '../group/ceGroupService';
import { CETimeWindowService } from '../time/ceTimeWindowService';

export type GenerationSettings = {
    /** the most students in a group; defaults to MAX_GROUP_SIZE */
    maxGroupSize?: number;
    /** groups with fewer students than this are broken up; 1 means no minimum */
    minGroupSize?: number;
    /** the least shared time, in hours, a student may leave a group with; 0 means any shared time */
    minOverlapHours?: number;
    /**
     * How a student is placed when more than one group fits (see OPTIMIZATION_STYLES): 'largest_first' (the default),
     * 'smallest_first', 'balanced' or 'random'. A group with no students yet is always used first.
     */
    optimizationStyle?: string;
    /** place students in the order this seed shuffles them into, anchors first; nothing means the fixed order */
    shuffleSeed?: number;
};

type ResolvedSettings = Required<Omit<GenerationSettings, 'shuffleSeed'>> & {
    /** the numbers behind the 'random' style, repeatable for a shuffle seed so the preview matches the saved plan */
    random: () => number;
};

/** How many shuffled arrangements optimizeGrouping compares. */
export const ARRANGEMENTS_TO_COMPARE = 50;

export type GeneratedPlan = {
    /** the groups that were kept, each with its students and shared time */
    groups: Group[];
    /** every student, with group_id set, or null for the waitlist */
    placements: Placement[];
};

type Candidate = {
    /** shared time as the counting rule measures it; used to rank groups */
    duration: number;
    group: Group;
    /** what the group's shared time would be if the student joined */
    intersect: TimeWindow[];
};

const byStudentId = (a: Placement, b: Placement) => String(a.student_id).localeCompare(String(b.student_id));

/** The group a student should join, or null if there is none. */
function bestGroup(groups: Group[], placement: Placement, settings: ResolvedSettings): Candidate | null {
    const timeWindowService = CETimeWindowService.getInstance();
    const candidates: Candidate[] = groups
        .filter(group => (group.placements?.length ?? 0) < settings.maxGroupSize)    // not full
        .map(group => {
            const intersect = timeWindowService.intersectionTimeWindowsMultiple(
                group.time_windows ?? [],
                placement.student?.timeWindows ?? []
            );
            return { duration: timeWindowService.totalDuration(intersect), group, intersect };
        })
        // some shared time is needed, and at least the minimum
        .filter(candidate => candidate.duration > 0
            && timeWindowService.totalHours(candidate.intersect) >= settings.minOverlapHours);
    if (candidates.length === 0) {
        return null;
    }
    const size = (candidate: Candidate) => candidate.group.placements?.length ?? 0;
    // a group with no students yet comes first, whatever the style
    const empty = candidates.find(candidate => size(candidate) === 0);
    if (empty) {
        return empty;
    }
    if (settings.optimizationStyle === 'random') {
        return candidates[Math.floor(settings.random() * candidates.length)];
    }
    return candidates.sort((a, b) => {
        // 'balanced' fills the smallest group; the others rank by shared time, the most ('largest_first') or the least ('smallest_first')
        const spread = settings.optimizationStyle === 'balanced'
            ? size(a) - size(b)
            : settings.optimizationStyle === 'smallest_first'
                ? a.duration - b.duration
                : b.duration - a.duration;
        // on a tie, fill the emptier group first
        return spread !== 0 ? spread : size(a) - size(b);
    })[0];
}

/** Puts the student in the best group, or on the waitlist. Returns whether they got a group. */
function place(groups: Group[], placement: Placement, settings: ResolvedSettings): boolean {
    const best = bestGroup(groups, placement, settings);
    if (best === null) {
        placement.group_id = null;
        return false;
    }
    placement.group_id = best.group.id;
    best.group.placements!.push(placement);
    best.group.time_windows = best.intersect;
    return true;
}

/** A small repeatable random number generator (mulberry32). */
function randomFrom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** The same list in an order the seed decides. The same seed always gives the same order. */
function shuffled<T>(items: T[], next: () => number): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Anchor students first, then everyone else. Each group is in a fixed order, by student id,
 * or in the order the shuffle seed gives when there is one.
 */
function inPlacementOrder(placements: Placement[], shuffleSeed?: number): Placement[] {
    const anchors = placements.filter(placement => placement.anchor).sort(byStudentId);
    const others = placements.filter(placement => !placement.anchor).sort(byStudentId);
    if (shuffleSeed === undefined) {
        return [...anchors, ...others];
    }
    const next = randomFrom(shuffleSeed);
    return [...shuffled(anchors, next), ...shuffled(others, next)];
}

export function generatePlan(placements: Placement[], options: GenerationSettings = {}, planId?: Identifier | null): GeneratedPlan {
    const maxGroupSize = Math.max(1, options.maxGroupSize ?? MAX_GROUP_SIZE);
    const settings: ResolvedSettings = {
        maxGroupSize,
        // a minimum above the maximum could never be met
        minGroupSize: Math.min(Math.max(1, options.minGroupSize ?? 1), maxGroupSize),
        minOverlapHours: Math.max(0, options.minOverlapHours ?? 0),
        optimizationStyle: options.optimizationStyle ?? 'largest_first',
        random: randomFrom((options.shuffleSeed ?? 0) ^ 0x5bd1e995)
    };

    // work on copies, so the students and placements that were passed in are left as they were
    const ordered = inPlacementOrder(placements.map(placement => ({ ...placement, group_id: null }) as Placement), options.shuffleSeed);

    const groupService = CEGroupService.getInstance();
    let groups: Group[] = Array.from({ length: Math.ceil(ordered.length / maxGroupSize) }, (_, i) => {
        const group = { id: uuid(), plan_id: planId ?? undefined, name: `Group ${i + 1}`, country_count: 0, placements: [] } as unknown as Group;
        group.time_windows = groupService.createDefaultTimewindows(group);
        return group;
    });

    ordered.forEach(placement => place(groups, placement, settings));

    // Break up groups that are too small, smallest first, and try to place their students elsewhere.
    // Each round removes a group, so this always finishes.
    for (;;) {
        const tooSmall = groups.filter(group => group.placements!.length < settings.minGroupSize);
        if (tooSmall.length === 0) {
            break;
        }
        const smallest = tooSmall.reduce((best, group) => group.placements!.length < best.placements!.length ? group : best);
        groups = groups.filter(group => group !== smallest);
        const moving = inPlacementOrder(smallest.placements!);
        smallest.placements = [];
        moving.forEach(placement => place(groups, placement, settings));
    }

    groups.forEach((group, i) => group.name = `Group ${i + 1}`);
    return { groups, placements: ordered };
}

export type OptimizeProgress = {
    /** how many arrangements have been compared so far */
    compared: number;
    /** how many will be compared in all */
    total: number;
};

export type OptimizeOptions = {
    /** how many shuffled arrangements to compare; defaults to ARRANGEMENTS_TO_COMPARE */
    attempts?: number;
    /** the first seed to try; the others follow it. Trying a different one searches different arrangements. */
    firstSeed?: number;
    /** called after each arrangement is compared */
    onProgress?: (progress: OptimizeProgress) => void;
    /** waited on after each arrangement, so a screen has time to show the progress */
    pause?: () => Promise<void>;
};

export type OptimizeResult = {
    /** the seed of the best arrangement, or the one passed in when nothing beat it */
    shuffleSeed: number | undefined;
    /** students on the waitlist before, and with the best arrangement */
    waitlistedBefore: number;
    waitlistedAfter: number;
    /** whether the best arrangement waitlists fewer students than the one that was passed in */
    improved: boolean;
};

/** Fewer waitlisted students is better; for the same number, more shared time in all is better. */
const score = (generated: GeneratedPlan) => ({
    waitlisted: generated.placements.filter(placement => !placement.group_id).length,
    sharedHours: generated.groups.reduce((total, group) =>
        total + CETimeWindowService.getInstance().totalHours(group.time_windows ?? []), 0)
});

/**
 * Compares the arrangement the settings already give (including their shuffle seed) with
 * shuffled ones, and returns the seed of the one that waitlists the fewest students. It never
 * returns something worse than what it was given: unless a shuffled arrangement waitlists fewer
 * students (or the same number with more shared time in all), the seed that came in comes back. Each arrangement is a full grouping, which takes about a
 * millisecond, so this is fast; the pause is there for the screen's sake.
 */
export async function optimizeGrouping(placements: Placement[], options: GenerationSettings = {}, optimize: OptimizeOptions = {}): Promise<OptimizeResult> {
    const attempts = Math.max(0, optimize.attempts ?? ARRANGEMENTS_TO_COMPARE);
    const firstSeed = optimize.firstSeed ?? 1;

    const start = score(generatePlan(placements, options));
    let best = { seed: options.shuffleSeed, ...start };

    for (let i = 0; i < attempts; i++) {
        const seed = firstSeed + i;
        const candidate = score(generatePlan(placements, { ...options, shuffleSeed: seed }));
        if (candidate.waitlisted < best.waitlisted
            || (candidate.waitlisted === best.waitlisted && candidate.sharedHours > best.sharedHours)) {
            best = { seed, ...candidate };
        }
        optimize.onProgress?.({ compared: i + 1, total: attempts });
        if (optimize.pause) {
            await optimize.pause();
        }
    }

    return {
        shuffleSeed: best.seed,
        waitlistedBefore: start.waitlisted,
        waitlistedAfter: best.waitlisted,
        improved: best.waitlisted < start.waitlisted
    };
}
