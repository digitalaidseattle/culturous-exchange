/**
 *  planSettings.ts
 *
 *  Updates a plan with new generation settings: saves its largest group size and generation method, and
 *  regroups its students with all the settings (and the arrangement Optimize chose, if it did) and saves
 *  the groups. It is what "Update plan" in the Plan settings window does, on the plan page and on a plan's
 *  card, so both do exactly the same.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { CEPlanDao } from "../../api/cePlanDao";
import { Plan } from "../../api/types";
import type { GenerationChoice } from "../../components/useGenerationControls";
import { PlanGenerator } from "./planGenerator";

/** The plan as it is after it has been regrouped and saved. Throws if the plan cannot be saved or regrouped. */
export async function applyPlanSettings(plan: Plan, settings: GenerationChoice): Promise<Plan> {
    const updated = await CEPlanDao.getInstance().update(plan.id!, {
        group_size: settings.maxGroupSize,
        optimization_style: settings.optimizationStyle ?? plan.optimization_style
    });
    return PlanGenerator.getInstance().run(updated, {
        maxGroupSize: settings.maxGroupSize,
        minGroupSize: settings.minGroupSize,
        minOverlapHours: settings.minOverlapHours,
        optimizationStyle: settings.optimizationStyle,
        shuffleSeed: settings.shuffleSeed
    });
}
