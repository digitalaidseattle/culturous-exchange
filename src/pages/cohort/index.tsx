/**
 * CohortPage.tsx
 *
 * Example of integrating tickets with data-grid
 *
 * @copyright 2026 Digital Aid Seattle
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

// material-ui
import { Breadcrumbs, Link, Typography, Box, Button, Card, CardContent, Divider, IconButton, Stack, Tab, Tabs } from "@mui/material";
import { EditOutlined, HomeOutlined, PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { RefreshContext } from "@digitalaidseattle/core";
import { useSearchParams } from "react-router-dom";
import { CECohortDao } from "../../api/ceCohortDao";
import { Cohort } from "../../api/types";
import { TabPanel } from "../../components/TabPanel";
import { EditCohortNameDialog } from "../../components/EditCohortNameDialog";
import { UI_STRINGS } from '../../constants';
import { NewPlanDialog } from "../../components/NewPlanDialog";
import { PlanCard } from "../../components/PlanCard";
import { raisedCardSx, tonalButtonSx } from "../../utils/styles";
import { CohortCharts } from "./CohortCharts";
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

// the Students tab
const STUDENTS_TAB = 1;

/** How wide the cohort summary and the plan cards may grow: wide enough for a plan's totals to sit beside its charts. */
const CONTENT_MAX_WIDTH = 960;

const CohortPage: React.FC = () => {
  const cohortDao = CECohortDao.getInstance();

  const [searchParams] = useSearchParams();
  const { id: cohortId } = useParams<string>();

  const { refresh } = useContext(RefreshContext);

  const [cohort, setCohort] = useState<Cohort | null>();
  const [tabValue, setTabValue] = useState<number>(0);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [newPlanOpen, setNewPlanOpen] = useState<boolean>(false);

  const loadCohort = (clearFirst: boolean) => {
    if (cohortId) {
      if (clearFirst) {
        setCohort(undefined);
      }
      cohortDao.getById(cohortId)
        .then((cohort) => {
          if (cohort) {
            setCohort(cohort);
          } else {
            console.error(`Cohort not found ${cohortId}`);
          }
        });
    }
  };

  // Initial load and cohort switch: clear first so a stale cohort never flashes
  // while the new one loads.
  useEffect(() => {
    loadCohort(true);
  }, [cohortId]);

  // Refresh (manual post-mutation bump and the 10s poll): refetch in place
  // without clearing, so the subtree is not unmounted and in-progress UI
  // (open modals, row selections, inline rename) survives. Skip the first run
  // so mount does not fetch twice.
  const isFirstRefresh = useRef(true);
  useEffect(() => {
    if (isFirstRefresh.current) {
      isFirstRefresh.current = false;
      return;
    }
    loadCohort(false);
  }, [refresh]);

  useEffect(() => {
    if (searchParams && searchParams.get('tab')) {
      setTabValue(Number(searchParams.get('tab')));
    }
  }, [searchParams]);

  const changeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const activePlans = cohort?.plans?.filter(plan => plan.active) ?? [];

  return (
    cohort && (
      <CohortContext.Provider value={{ cohort, setCohort }}>
        <Stack gap={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <IconButton LinkComponent={Link} href="/" size="medium" aria-label="home">
              <HomeOutlined />
            </IconButton>
            <Typography color="text.primary">{UI_STRINGS.COHORT_PREFIX} {cohort.name}</Typography>
          </Breadcrumbs>
          <Card sx={{ ...raisedCardSx, maxWidth: CONTENT_MAX_WIDTH }}>
            <CardContent>
              <Stack gap={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="h2" component="h1" sx={{ fontWeight: 600 }}>
                    {cohort.name}
                  </Typography>
                  <IconButton aria-label={UI_STRINGS.EDIT_NAME} title={UI_STRINGS.EDIT_NAME} onClick={() => setEditingName(true)}>
                    <EditOutlined />
                  </IconButton>
                </Stack>
                <Stack direction="row" flexWrap="wrap" columnGap={4} rowGap={0.5}>
                  <Typography>{UI_STRINGS.STUDENTS_LABEL}: {cohort.enrollments?.length ?? 0}</Typography>
                  <Typography>{UI_STRINGS.PLANS_LABEL}: {cohort.plans?.length ?? 0}</Typography>
                  <Typography>
                    {UI_STRINGS.ACTIVE_PLAN}: {cohort.plans?.find(plan => plan.active)?.name ?? UI_STRINGS.NO_ACTIVE_PLAN}
                  </Typography>
                  {cohort.created_at &&
                    <Typography>
                      {UI_STRINGS.CREATED}: {new Date(cohort.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Typography>
                  }
                </Stack>
                <CohortCharts cohort={cohort} />
                <Divider />
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  <Button
                    variant="contained"
                    sx={tonalButtonSx}
                    startIcon={<PlusOutlined />}
                    onClick={() => setNewPlanOpen(true)}>
                    {UI_STRINGS.NEW_PLAN_BUTTON}
                  </Button>
                  <Button
                    variant="contained"
                    sx={tonalButtonSx}
                    startIcon={<TeamOutlined />}
                    onClick={() => setTabValue(STUDENTS_TAB)}>
                    {UI_STRINGS.MANAGE_STUDENTS}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <EditCohortNameDialog
            cohort={cohort}
            open={editingName}
            onClose={() => setEditingName(false)} />
          <NewPlanDialog
            cohort={cohort}
            open={newPlanOpen}
            onClose={() => setNewPlanOpen(false)} />
          {/* the active plan stays in view right under the summary, whichever tab is showing */}
          {activePlans.length > 0 &&
            <Stack gap={1.5} sx={{ maxWidth: CONTENT_MAX_WIDTH }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                {UI_STRINGS.ACTIVE_PLAN_HEADING}
              </Typography>
              {activePlans.map(plan => <PlanCard key={plan.id} planId={plan.id!} />)}
            </Stack>
          }
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={changeTab}
                aria-label="basic tabs example"
              >
                <Tab label={UI_STRINGS.INACTIVE_PLANS_TAB} />
                <Tab label={UI_STRINGS.STUDENTS_LABEL} />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0} disableGutters>
              <Stack gap={2} sx={{ maxWidth: CONTENT_MAX_WIDTH }}>
                <PlansStack />
              </Stack>
            </TabPanel>
            <TabPanel value={tabValue} index={1} disableGutters>
              <Card sx={raisedCardSx}>
                <CardContent>
                  <StudentTable />
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </Stack>
      </CohortContext.Provider>
    )
  );
};

export default CohortPage;
