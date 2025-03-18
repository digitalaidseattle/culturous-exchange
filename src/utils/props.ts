/**
 *  props.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Plan } from "../api/types";

export interface PlanProps {
    plan: Plan;
    onChange?: (plan: Plan) => void;
}