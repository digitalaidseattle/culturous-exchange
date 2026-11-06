/**
 *  groupFit.ts
 *
 *  What a group looks like to a student who might move into it: how many students it has, which
 *  countries they come from, and how much time the student has in common with the group.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Group, Placement, Student, TimeWindow } from "../../api/types";
import { normalizeCountryName } from "../../utils/countryFlag";
import { gridHours, sharedWindows } from "../../utils/weekendGrid";

/** Anchor students first, then by name. */
export const byAnchorThenName = (a: Placement, b: Placement) =>
    Number(b.anchor) - Number(a.anchor) || (a.student?.name ?? '').localeCompare(b.student?.name ?? '');

/** The students placed in the group. */
export function placementsInGroup(placements: Placement[], groupId: string | number | null | undefined): Placement[] {
    return placements.filter(placement => placement.group_id === groupId);
}

/** The countries of the students, each once, in the order first met, spelled as first typed. */
export function countriesOf(placements: Placement[]): string[] {
    const seen = new Map<string, string>();
    placements.forEach(placement => {
        const country = placement.student?.country?.trim();
        if (country && !seen.has(normalizeCountryName(country))) {
            seen.set(normalizeCountryName(country), country);
        }
    });
    return Array.from(seen.values());
}

export type GroupFit = {
    size: number,
    countries: string[],
    /** the time the student and the group have free in common */
    shared: TimeWindow[],
    sharedHours: number
};

/** How the student fits the group. A group with no students yet is free all weekend, so the student fits all their time. */
export function groupFit(student: Student | undefined, group: Group, placements: Placement[]): GroupFit {
    const members = placementsInGroup(placements, group.id);
    const shared = sharedWindows(student?.timeWindows, group.time_windows);
    return {
        size: members.length,
        countries: countriesOf(members),
        shared,
        sharedHours: gridHours(shared)
    };
}

export type GenderKind = 'female' | 'male' | 'other';
export type GenderSplit = { kind: GenderKind, count: number }[];

/** Which of the form's three options a typed gender is: anything but female or male, or left blank, counts as other. */
export function genderKind(gender: string | null | undefined): GenderKind {
    const text = (gender ?? '').trim().toLowerCase();
    if (['female', 'f', 'woman', 'girl'].includes(text)) {
        return 'female';
    }
    if (['male', 'm', 'man', 'boy'].includes(text)) {
        return 'male';
    }
    return 'other';
}

/** How many of the students are female, male and other, in that order. */
export function genderSplit(placements: Placement[]): GenderSplit {
    const counts: Record<GenderKind, number> = { female: 0, male: 0, other: 0 };
    placements.forEach(placement => { counts[genderKind(placement.student?.gender)] += 1; });
    return (['female', 'male', 'other'] as GenderKind[]).map(kind => ({ kind, count: counts[kind] }));
}
