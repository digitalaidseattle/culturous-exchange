import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router";

// material-ui

// project import
import { Stack } from "@mui/material";

import { useNotifications } from "@digitalaidseattle/core";
import { cohortService } from "../../api/ceCohortService";
import { planGenerator } from "../../api/planGenerator";
import { Cohort, Plan } from "../../api/types";
import { PlanDetails } from "../../components/PlanDetails";
import { CohortContext } from "../cohort";

interface PlanContextType {
  plan: Plan;
  setPlan: (plan: Plan) => void;
}

export const PlanContext = createContext<PlanContextType>({
  plan: {} as Plan,
  setPlan: () => { },
});



const PlanPage: React.FC = () => {
  const { id: planId } = useParams<string>();
  const [plan, setPlan] = useState<Plan>();
  const [cohort, setCohort] = useState<Cohort>();

  const notifications = useNotifications();;

  useEffect(() => {
    planGenerator.hydratePlan(planId)
      .then((p) => setPlan(p))
      .catch((err) => notifications.error(`Error reading ${planId} : ${err}`));;
  }, [planId]);

  useEffect(() => {
    if (plan) {
      console.log("Plan", plan);
      if (plan.cohort_id) {
        cohortService.getById(plan.cohort_id)
          .then((cohort) => {
            if (cohort) {
              setCohort(cohort);
            } else {
              console.error(`Cohort not found ${plan.cohort_id}`);
            }
          });
      }
    }
  }, [plan]);

  return (
    plan &&
    cohort && (
      <PlanContext.Provider value={{ plan, setPlan }}>
        <CohortContext.Provider value={{ cohort, setCohort }}>
          <Stack gap={1}>
            <PlanDetails />
          </Stack>
        </CohortContext.Provider>
      </PlanContext.Provider>
    )
  );
};

export default PlanPage;
