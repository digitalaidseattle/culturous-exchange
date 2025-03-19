/**
 *  props.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Cohort, Plan } from "../api/types";

export interface PlanProps {
    plan: Plan;
    onChange?: (plan: Plan) => void;
}

export interface CohortProps {
    cohort: Cohort;
    onChange?: (cohort: Cohort) => void;
}