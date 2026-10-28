/**
 *  planNaming.ts
 *
 *  The default name for a new plan: "Plan N", where N is one more than the highest number
 *  among the cohort's plans that still have a default name. Plans that were renamed to
 *  something else do not count, so renaming the last "Plan 3" makes "Plan 3" available again,
 *  but a renamed "Plan 1" does not bring "Plan 1" back while "Plan 2" and "Plan 3" exist:
 *  the next plan is "Plan 4".
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Plan } from "../../api/types";

const DEFAULT_NAME = /^plan (\d+)$/i;

/** The number in a default name such as "Plan 3", or null for any other name. */
export function defaultPlanNumber(name: string | undefined | null): number | null {
    const match = DEFAULT_NAME.exec((name ?? '').trim());
    return match ? parseInt(match[1], 10) : null;
}

/** "Plan N" for the next plan, from the plans the cohort has now. */
export function nextDefaultPlanName(plans: Pick<Plan, 'name'>[] | undefined | null): string {
    const taken = (plans ?? [])
        .map(plan => defaultPlanNumber(plan.name))
        .filter((number): number is number => number !== null);
    return `Plan ${taken.length === 0 ? 1 : Math.max(...taken) + 1}`;
}
