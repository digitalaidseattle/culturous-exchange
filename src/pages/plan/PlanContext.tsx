
/**
 *  PlanContext.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

// material-ui

// project import

import { createContext } from "react";
import { Plan } from "../../api/types";

interface PlanContextType {
  plan: Plan;
  setPlan: (plan: Plan) => void;
}

export const PlanContext = createContext<PlanContextType>({
  plan: {} as Plan,
  setPlan: () => { },
});