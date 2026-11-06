/**
 * plan/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router";

// material-ui
import { AppstoreOutlined, ExportOutlined, SettingOutlined, TableOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Box, Breadcrumbs, ButtonGroup, Card, CardContent, CardHeader, CircularProgress, IconButton, Link, Stack, Toolbar, Tooltip, Typography } from "@mui/material";

// project import
import { HomeOutlined } from '@ant-design/icons';
import { Identifier, useNotifications } from "@digitalaidseattle/core";
import { CECohortDao } from "../../api/ceCohortDao";
import { CEPlanDao } from "../../api/cePlanDao";
import { Cohort, Plan } from "../../api/types";
import PlanSettingsDialog from "../../components/PlanSettingsDialog";
import { UI_STRINGS } from '../../constants';
import { PlanExporter } from "../../services/plan/planExporter";
import { PlanGenerator } from "../../services/plan/planGenerator";
import { CohortContext } from "../cohort";
import { GroupBoard } from "./GroupBoard";
import { PlanContext } from "./PlanContext";
import { TimeLine } from "./TimeLine";
import { ViewDetails, ViewDetailsContext } from "./ViewDetailsContext";

const PlanPage: React.FC = () => {
  const cohortDao = CECohortDao.getInstance();
  const planDao = CEPlanDao.getInstance();

  const { id: planId } = useParams<string>();
  const [plan, setPlan] = useState<Plan>();
  const [cohort, setCohort] = useState<Cohort>();
  const [loading, setLoading] = useState<boolean>(false);
  const [viewDetails, setViewDetails] = useState<ViewDetails>({ showGroupDetails: false, showStudentDetails: false });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [viewType, setViewType] = useState<"board" | "timeline">("board");

  const notifications = useNotifications();

  useEffect(() => {
    refreshPlan(planId!);
  }, [planId]);

  useEffect(() => {
    setCohort(undefined);
    if (plan && plan.cohort_id) {
      cohortDao.getById(plan.cohort_id)
        .then((cohort) => {
          if (cohort) {
            setCohort(cohort);
          } else {
            console.error(`Cohort not found ${plan.cohort_id}`);
          }
        });
    }
  }, [plan]);

  function refreshPlan(planId: Identifier) {
    setPlan(undefined);
    setLoading(true);
    planDao.getById(planId)
      .then(resp => setPlan(resp!))
      .catch((err) => {
        notifications.error(`Error reading ${planId} : ${err}`)
        console.error(`Error reading ${planId} : ${err}`)
      })
      .finally(() => setLoading(false));
  }

  function exportPlan(): void {
    PlanExporter.getInstance().run(plan!)
      .then((exported) => {
        if (exported) {
          notifications.success(`${plan!.name} exported successfully`);
        } else {
          notifications.error(UI_STRINGS.PLAN_EXPORT_FAILED);
        }
      })
  }

  function handleGroupDetails(): void {
    setViewDetails({
      ...viewDetails,
      showGroupDetails: !viewDetails.showGroupDetails
    });
  }

  function handleStudentDetails(): void {
    setViewDetails({
      ...viewDetails,
      showStudentDetails: !viewDetails.showStudentDetails
    });
  }

  function handleSettings(): void {
    setShowSettings(!showSettings);
  }

  async function handleSettingsChange(changed: Plan): Promise<void> {
    if (plan) {
      try {
        const orig_optimization_style = plan.optimization_style;
        const updatedPlan = await planDao.update(plan!.id!, {
          name: changed.name,
          note: changed.note,
          group_size: changed.group_size!,
          optimization_style: changed.optimization_style
        })
        if (orig_optimization_style !== updatedPlan.optimization_style) {
          const seededPlan = await PlanGenerator.getInstance().run(updatedPlan)
          setPlan(seededPlan)
        } else {
          setPlan(updatedPlan);
        }
        notifications.success(`Plan ${changed.name} updated successfully`);
      }
      catch (err) {
        notifications.error(`Error updating plan ${changed.name}: ${err}`);
      }
      finally {
        setLoading(false)
        setShowSettings(false);
      }
    }
  }

  return (loading ?
    <Box sx={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <CircularProgress color="success" />
    </Box>
    : plan && cohort &&
    <PlanContext.Provider value={{ plan, setPlan }}>
      <CohortContext.Provider value={{ cohort, setCohort }}>
        <ViewDetailsContext.Provider value={{ viewDetails, setViewDetails }}>
          <Stack gap={1}>
            <Breadcrumbs aria-label="breadcrumb">
              <IconButton LinkComponent={Link} href="/" size="medium" aria-label="home">
                <HomeOutlined />
              </IconButton>
              <Link underline="hover" color="inherit" href={"/cohorts"}>
                {UI_STRINGS.COHORTS}
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href={`/cohort/${plan.cohort_id}`}
              >
                {UI_STRINGS.COHORT_PREFIX} {cohort.name}
              </Link>
              <Typography sx={{ color: 'text.primary' }}>{UI_STRINGS.PLAN_PREFIX} {plan.name}</Typography>
            </Breadcrumbs>
            <Card>
              <CardHeader title={plan.name}
                subheader={<Stack>
                  <Typography variant="body2" color="text.secondary">{UI_STRINGS.NOTES_LABEL}: {plan.note}</Typography>
                  <Typography variant="body2" color="text.secondary">{UI_STRINGS.GENERATION_METHOD}: {plan.optimization_style}</Typography>
                </Stack>}
                action={
                  <Tooltip title={UI_STRINGS.SHOW_PLAN_SETTINGS}>
                    <IconButton color="inherit" onClick={handleSettings}>
                      <SettingOutlined />
                    </IconButton>
                  </Tooltip>}
              />
              <CardContent>
                <Toolbar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h3" component="span">
                      {UI_STRINGS.GROUPS_LABEL}
                    </Typography>
                    <ButtonGroup size="small" aria-label="Small button group">
                      <Tooltip title={UI_STRINGS.SELECT_BOARD_VIEW}>
                        <IconButton size="small"
                          onClick={() => setViewType("board")}>
                          <AppstoreOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={UI_STRINGS.SELECT_TIMELINE_VIEW}>
                        <IconButton size="small"
                          onClick={() => setViewType("timeline")}>
                          <TableOutlined />
                        </IconButton>
                      </Tooltip>
                    </ButtonGroup>
                  </Box>

                  <Tooltip title={UI_STRINGS.EXPORT_PLAN}>
                    <IconButton color="inherit" onClick={exportPlan}>
                      <ExportOutlined />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={UI_STRINGS.TOGGLE_GROUP_DETAILS}>
                    <IconButton color="inherit" onClick={handleGroupDetails}>
                      <TeamOutlined />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={UI_STRINGS.TOGGLE_STUDENT_DETAILS}>
                    <IconButton color="inherit" onClick={handleStudentDetails}>
                      <UserOutlined />
                    </IconButton>
                  </Tooltip>

                </Toolbar>
                <Box sx={{ overflowX: 'auto', }}>
                  {!loading && viewType === "board" && <GroupBoard />}
                  {!loading && viewType === "timeline" && <TimeLine />}
                </Box>
                <PlanSettingsDialog
                  plan={plan!}
                  isOpen={showSettings}
                  onClose={() => setShowSettings(false)}
                  onSubmit={handleSettingsChange}
                />
              </CardContent>
              {/* <PlanDetails /> */}
            </Card>
          </Stack>
        </ViewDetailsContext.Provider>
      </CohortContext.Provider >
    </PlanContext.Provider >
  );
};

export default PlanPage;
