/**
 * CohortPage.tsx
 *
 * Example of integrating tickets with data-grid
 * 
 * @copyright 2026 Digital Aid Seattle
 */

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

// material-ui
import { Breadcrumbs, Link, Typography, Box, Button, IconButton, Stack, Tab, Tabs } from "@mui/material";
import { HomeOutlined } from "@ant-design/icons";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { MainCard } from "@digitalaidseattle/mui";
import { useSearchParams } from "react-router-dom";
import { CECohortDao } from "../../api/ceCohortDao";
import { Cohort } from "../../api/types";
import { TabPanel } from "../../components/TabPanel";
import { TextEdit } from "../../components/TextEdit";
import { UI_STRINGS } from '../../constants';
import { CECohortService } from "../../services/cohort/ceCohortService";
import { PlansStack } from "./PlansStack";
import { StudentTable } from "./StudentTable";

interface CohortContextType {
  cohort: Cohort;
  setCohort: (cohort: Cohort) => void;
}

export const CohortContext = createContext<CohortContextType>({
  cohort: {} as Cohort,
  setCohort: () => { },
});

const CohortPage: React.FC = () => {
  const cohortDao = CECohortDao.getInstance();

  const [searchParams] = useSearchParams();
  const { id: cohortId } = useParams<string>();
  const notifications = useNotifications();
  const navigate = useNavigate();

  const { refresh } = useContext(RefreshContext);

  const [cohort, setCohort] = useState<Cohort | null>();
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    if (cohortId) {
      setCohort(undefined);
      cohortDao.getById(cohortId)
        .then((cohort) => {
          if (cohort) {
            setCohort(cohort);
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
      cohortDao
        .update(cohort.id, { name: newText }) // FIXME change ID to UUID
        .then((updated) => {
          setCohort(updated);
          notifications.success(`Cohort ${updated.name} updated.`);
        });
    }
  }

  async function handleCreatePlan() {
    if (cohort) {
      const cohortService = CECohortService.getInstance();
      try {
        const newPlan = await cohortService.createPlan(cohort!);
        navigate(`/plan/${newPlan.id}`);
        notifications.success(`Plan added to ${cohort!.name}.`);
      } catch (error: any) {
        console.error('Could not create plan.', error)
        notifications.error(`Could not create plan. ${error.message}`);
      }
    } else {
      notifications.error(`No cohort povided.`);
    }
  }

  const changeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    cohort && (
      <CohortContext.Provider value={{ cohort, setCohort }}>
        <Stack gap={1}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/"><IconButton size="medium"><HomeOutlined /></IconButton></Link>
            <Link underline="hover" color="inherit" href={"/cohorts"}>
              {UI_STRINGS.COHORTS}
            </Link>
            <Typography color="text.primary">{UI_STRINGS.COHORT_PREFIX} {cohort.name}</Typography>
          </Breadcrumbs>
          <MainCard>
            <TextEdit
              label={UI_STRINGS.NAME}
              value={cohort.name}
              onChange={(val) => handleNameChange(val)}
            />
            <Button
              sx={{ marginTop: 1 }}
              variant="contained"
              onClick={handleCreatePlan}
            >
              {UI_STRINGS.NEW_PLAN}
            </Button>
          </MainCard>
          <MainCard>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={changeTab}
                aria-label="basic tabs example"
              >
                <Tab label={UI_STRINGS.PLANS_LABEL} />
                <Tab label={UI_STRINGS.STUDENTS_LABEL} />
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
