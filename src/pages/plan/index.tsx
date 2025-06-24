import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router";

// material-ui

// project import
import { Stack } from "@mui/material";

import { useNotifications } from "@digitalaidseattle/core";
import { MainCard } from "@digitalaidseattle/mui";
import { cohortService } from "../../api/ceCohortService";
import { planService } from "../../api/cePlanService";
import { planEvaluator } from "../../api/planEvaluator";
import { planGenerator } from "../../api/planGenerator";
import { Cohort, Identifier, Plan } from "../../api/types";
import { TextEdit } from "../../components/TextEdit";
import { CohortContext } from "../cohort";
import { GroupBoard } from "./GroupBoard";

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
    refreshPlan(planId);
  }, [planId]);

  useEffect(() => {
    if (plan) {
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

  function refreshPlan(planId: Identifier) {
    planGenerator.hydratePlan(planId)
      .then((hydrated) => {
        if (hydrated) {
          // Move seeding and evaluation logic to plan creation
          //Check  not need if we always seed when creating plans
          if (hydrated.groups === undefined || hydrated.groups.length === 0) {
            planGenerator.seedPlan(hydrated)
              .then((seededPlan) => {
                planEvaluator.evaluate(seededPlan)
                  .then((evaluatedPlan) => {
                    setPlan(evaluatedPlan)
                  })
              })
          } else {
            planEvaluator.evaluate(hydrated)
              .then((evaluatedPlan) => {
                setPlan(evaluatedPlan)
              })
          }
        }
      })
      .catch((err) => notifications.error(`Error reading ${planId} : ${err}`));;
  }

  function handleNameUpdate(text: string) {
    planService.update(plan!.id, { name: text })
      .then(updated => {
        if (updated) {
          notifications.success('Plan updated.');
          refreshPlan(updated.id);
        }
      })
  }

  function handleNoteUpdate(text: string) {
    planService.update(plan!.id, { note: text })
      .then(updated => {
        if (updated) {
          notifications.success('Plan updated.');
          refreshPlan(updated.id);
        }
      })
  }

  // TODO add breadcrumbs
  return (plan && cohort &&
    <PlanContext.Provider value={{ plan, setPlan }}>
      <CohortContext.Provider value={{ cohort, setCohort }}>
        <Stack gap={1}>
          <MainCard sx={{ width: '100%' }}>
            <Stack spacing={{ xs: 1, sm: 4 }}>
              <Stack spacing={{ xs: 1, sm: 4 }} direction='row'>
                <TextEdit label={'Name'} value={plan.name} onChange={handleNameUpdate} />
                <TextEdit label={'Notes'} value={plan.note} onChange={handleNoteUpdate} />
              </Stack>
              {/* <PlanDetails /> */}
              <GroupBoard />
            </Stack>
          </MainCard>
        </Stack>
      </CohortContext.Provider>
    </PlanContext.Provider>
  );
};

export default PlanPage;
