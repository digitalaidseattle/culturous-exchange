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
import { Box, Breadcrumbs, Button, Card, CardContent, CircularProgress, Divider, IconButton, Link, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";

// project import
import { HomeOutlined } from '@ant-design/icons';
import { Identifier, useNotifications } from "@digitalaidseattle/core";
import { CECohortDao } from "../../api/ceCohortDao";
import { CEPlanDao } from "../../api/cePlanDao";
import { Cohort, Plan } from "../../api/types";
import { GenerationChoice } from "../../components/useGenerationControls";
import PlanSettingsDialog from "../../components/PlanSettingsDialog";
import { UI_STRINGS } from '../../constants';
import { PlanExporter } from "../../services/plan/planExporter";
import { applyPlanSettings } from "../../services/plan/planSettings";
import { CohortContext } from "../cohort";
import { GroupsView } from "./GroupsView";
import { raisedCardSx, tonalButtonSx } from "../../utils/styles";
import { PlanContext } from "./PlanContext";
import { PlanNotes } from "./PlanNotes";
import { PlanTitle } from "./PlanTitle";
import { TimeLine } from "./TimeLine";
import { ViewDetails, ViewDetailsContext } from "./ViewDetailsContext";

const PlanPage: React.FC = () => {
  const cohortDao = CECohortDao.getInstance();
  const planDao = CEPlanDao.getInstance();

  const { id: planId } = useParams<string>();
  const [plan, setPlan] = useState<Plan>();
  const [cohort, setCohort] = useState<Cohort>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [viewType, setViewType] = useState<"board" | "timeline">("board");
  // which rows the Timeline view shows: each group's facilitators, and each group's students
  const [viewDetails, setViewDetails] = useState<ViewDetails>({ showGroupDetails: false, showStudentDetails: false });

  const notifications = useNotifications();

  useEffect(() => {
    refreshPlan(planId!);
  }, [planId]);

  // The cohort is read again only when the plan belongs to another cohort. Reading it on every change to the
  // plan (a moved student, a new anchor, a note) would blank the page while it loaded.
  const cohortId = plan?.cohort_id;
  useEffect(() => {
    setCohort(undefined);
    if (cohortId) {
      cohortDao.getById(cohortId)
        .then((cohort) => {
          if (cohort) {
            setCohort(cohort);
          } else {
            console.error(`Cohort not found ${cohortId}`);
          }
        });
    }
  }, [cohortId]);

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

  function handleNameUpdate(text: string) {
    planDao.update(plan!.id!, { name: text })
      .then(updated => {
        if (updated) {
          notifications.success(UI_STRINGS.PLAN_UPDATED);
          setPlan(current => current && { ...current, name: text });
        }
      })
  }

  function handleNoteUpdate(text: string) {
    planDao.update(plan!.id!, { note: text })
      .then(updated => {
        if (updated) {
          notifications.success(UI_STRINGS.PLAN_UPDATED);
          // keep the page as it is: reloading would hide the field being typed in
          setPlan(current => current && { ...current, note: text });
        }
      })
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

  function handleSettings(): void {
    setShowSettings(!showSettings);
  }

  // Regroups the plan's students with the settings and saves it. Throws nothing: a failure is reported
  // and the settings window stays open, so the settings can be tried again.
  async function handleSettingsChange(settings: GenerationChoice): Promise<void> {
    try {
      const seededPlan = await applyPlanSettings(plan!, settings);
      notifications.success(`Plan ${seededPlan.name} updated successfully`);
      setPlan(seededPlan);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update plan', error);
      notifications.error(`Failed to update plan: ${error instanceof Error ? error.message : error}`);
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
        <Stack gap={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <IconButton LinkComponent={Link} href="/" size="medium" aria-label="home">
              <HomeOutlined />
            </IconButton>
            <Link
              underline="hover"
              color="inherit"
              href={`/cohort/${plan.cohort_id}`}
            >
              {UI_STRINGS.COHORT_PREFIX} {cohort.name}
            </Link>
            <Typography sx={{ color: 'text.primary' }}>{UI_STRINGS.PLAN_PREFIX} {plan.name}</Typography>
          </Breadcrumbs>
          <Card sx={raisedCardSx}>
            <CardContent>
              <Stack gap={2}>
                <PlanTitle name={plan.name} onChange={handleNameUpdate} />
                <Stack direction="row" flexWrap="wrap" columnGap={4} rowGap={0.5}>
                  <Typography>{UI_STRINGS.GROUPS_LABEL}: {plan.groups.length}</Typography>
                  <Typography>{UI_STRINGS.STUDENTS_LABEL}: {plan.placements.filter(p => p.group_id).length}</Typography>
                  <Typography>{UI_STRINGS.WAITLISTED}: {plan.placements.filter(p => !p.group_id).length}</Typography>
                </Stack>
                <PlanNotes note={plan.note} onChange={handleNoteUpdate} />
                <Divider />
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  <Button variant="contained" sx={tonalButtonSx} startIcon={<ExportOutlined />} onClick={exportPlan}>
                    {UI_STRINGS.EXPORT_PLAN}
                  </Button>
                  <Button variant="contained" sx={tonalButtonSx} startIcon={<SettingOutlined />} onClick={handleSettings}>
                    {UI_STRINGS.SHOW_PLAN_SETTINGS}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 400 }}>
              {UI_STRINGS.GROUPS_LABEL}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewType}
              aria-label={UI_STRINGS.SELECT_VIEW}
              onChange={(_event, value) => { if (value) { setViewType(value); } }}>
              <ToggleButton value="board" aria-label={UI_STRINGS.SELECT_BOARD_VIEW} sx={{ textTransform: 'none', gap: 0.75 }}>
                <AppstoreOutlined /> {UI_STRINGS.VIEW_CARDS}
              </ToggleButton>
              <ToggleButton value="timeline" aria-label={UI_STRINGS.SELECT_TIMELINE_VIEW} sx={{ textTransform: 'none', gap: 0.75 }}>
                <TableOutlined /> {UI_STRINGS.VIEW_TIMELINE}
              </ToggleButton>
            </ToggleButtonGroup>
            {viewType === "timeline" &&
              <Stack direction="row" gap={0.5}>
                <Tooltip title={UI_STRINGS.TOGGLE_GROUP_DETAILS}>
                  <ToggleButton
                    size="small"
                    value="group-details"
                    aria-label={UI_STRINGS.TOGGLE_GROUP_DETAILS}
                    selected={viewDetails.showGroupDetails}
                    onChange={() => setViewDetails(current => ({ ...current, showGroupDetails: !current.showGroupDetails }))}>
                    <TeamOutlined />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title={UI_STRINGS.TOGGLE_STUDENT_DETAILS}>
                  <ToggleButton
                    size="small"
                    value="student-details"
                    aria-label={UI_STRINGS.TOGGLE_STUDENT_DETAILS}
                    selected={viewDetails.showStudentDetails}
                    onChange={() => setViewDetails(current => ({ ...current, showStudentDetails: !current.showStudentDetails }))}>
                    <UserOutlined />
                  </ToggleButton>
                </Tooltip>
              </Stack>}
          </Stack>

          {!loading && viewType === "board" && <GroupsView />}
          {!loading && viewType === "timeline" && <Box sx={{ overflowX: 'auto' }}><TimeLine /></Box>}
          <PlanSettingsDialog
            plan={plan!}
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onSubmit={handleSettingsChange}
          />
        </Stack>
        </ViewDetailsContext.Provider>
      </CohortContext.Provider >
    </PlanContext.Provider >
  );
};

export default PlanPage;
