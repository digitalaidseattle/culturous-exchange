import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

// material-ui

// project import
import { Box, Button, Stack, Tab, Tabs } from "@mui/material";

import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { MainCard } from "@digitalaidseattle/mui";
import { cohortService } from "../../api/ceCohortService";
import { enrollmentService } from "../../api/ceEnrollmentService";
import { planService } from "../../api/cePlanService";
import { Cohort } from "../../api/types";
import { TabPanel } from "../../components/TabPanel";
import { TextEdit } from "../../components/TextEdit";
import { PlansStack } from "./PlansStack";
import { StudentTable } from "./StudentTable";
import { useSearchParams } from "react-router-dom";
import { planGenerator } from "../../api/planGenerator";

interface CohortContextType {
  cohort: Cohort;
  setCohort: (cohort: Cohort) => void;
}

export const CohortContext = createContext<CohortContextType>({
  cohort: {} as Cohort,
  setCohort: () => { },
});

const CohortPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id: cohortId } = useParams<string>();
  const notifications = useNotifications();
  const navigate = useNavigate();

  const { refresh } = useContext(RefreshContext);

  const [cohort, setCohort] = useState<Cohort | null>();
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    if (cohortId) {
      cohortService.getById(cohortId).then((cohort) => {
        if (cohort) {
          enrollmentService.getStudents(cohort).then((students) => {
            cohort.enrollments.forEach(enrollment => {
              const student = students.find(s => s.id === enrollment.student_id);
              if (student) {
                // TODO lookup tw for student
                enrollment.student = student;
              } else {
                console.warn(`Student not found for enrollment: ${enrollment.id}`);
              }              
            });
            setCohort(cohort);
          });
        } else {
          console.error(`Cohort not found ${cohortId}`);
        }
      });
    }
  }, [cohortId, refresh]);

  useEffect(() => {
    if (searchParams && searchParams.get('tab')) {
      setTabValue(Number(searchParams.get('tab')));
    }
  }, [searchParams]);


  function handleNameChange(newText: string) {
    if (cohort && cohort.id) {
      cohortService
        .update(cohort.id, { name: newText }) // FIXME change ID to UUID
        .then((updated) => {
          setCohort(updated);
          notifications.success(`Cohort ${updated.name} updated.`);
        });
    }
  }

  async function handleCreatePlan() {
    if (cohort) {
      const created = await planService.create(cohort);
      const hydrated = await planGenerator.hydratePlan(created.id);
      const seededPlan = await planGenerator.seedPlan(hydrated)
      // TODO consider evaluating the plan
      // const evaluatedPlan = await planEvaluator.evaluate(seededPlan)
      // console.log(`evaluatedPlan`, evaluatedPlan);
      navigate(`/plan/${seededPlan.id}`);
      notifications.success(`Plan added to  ${cohort.name}.`);
    }
  }

  const changeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    cohort && (
      <CohortContext.Provider value={{ cohort, setCohort }}>
        <Stack gap={1}>
          <MainCard>
            <TextEdit
              label={"Name"}
              value={cohort.name}
              onChange={(val) => handleNameChange(val)}
            />
            <Button
              sx={{ marginTop: 1 }}
              variant="contained"
              onClick={handleCreatePlan}
            >
              New Plan
            </Button>
          </MainCard>
          <MainCard>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={changeTab}
                aria-label="basic tabs example"
              >
                <Tab label="Plans" />
                <Tab label="Students" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <PlansStack />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <StudentTable />
            </TabPanel>
          </MainCard>
        </Stack>
      </CohortContext.Provider>
    )
  );
};

export default CohortPage;
