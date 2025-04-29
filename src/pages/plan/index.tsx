import { createContext, useEffect, useState, useContext } from "react";
import { useParams } from "react-router";

// material-ui

// project import
import { Stack } from "@mui/material";

import { RefreshContext } from "@digitalaidseattle/core";
import { planService } from "../../api/cePlanService";
import { Cohort, Plan } from "../../api/types";
import { PlanDetails } from "../../components/PlanDetails";
import { CohortContext } from "../cohort";
import { cohortService } from "../../api/ceCohortService";

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


  useEffect(() => {
    if (planId) {
      planService.getById(planId).then((p) => {
        if (p) {
          setPlan(p);
          if (p.cohort_id) {
            cohortService.getById(p.cohort_id)
              .then((cohort) => {
                if (cohort) {
                  setCohort(cohort);
                } else {
                  console.error(`Cohort not found ${p.cohort_id}`);
                }
              });
          }
        }
      });
    }
  }, [planId]);

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
