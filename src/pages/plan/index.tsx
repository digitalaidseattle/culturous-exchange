import { useEffect, useState } from "react";
import { useParams } from "react-router";

// material-ui

// project import
import { Box, Breadcrumbs, CircularProgress, IconButton, Link, Stack, Toolbar, Tooltip, Typography } from "@mui/material";

import { ExportOutlined, SettingOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import { MainCard } from "@digitalaidseattle/mui";
import { cohortService } from "../../api/ceCohortService";
import { planService } from "../../api/cePlanService";
import { planExporter } from "../../api/planExporter";
import { planGenerator } from "../../api/planGenerator";
import { Cohort, Plan } from "../../api/types";
import PlanSettingsDialog from "../../components/PlanSettingsDialog";
import { TextEdit } from "../../components/TextEdit";
import { CohortContext } from "../cohort";
import { GroupBoard } from "./GroupBoard";
import { PlanContext } from "./PlanContext";
import { TimeLine } from "./TimeLine";

const PlanPage: React.FC = () => {
  const { id: planId } = useParams<string>();
  const [plan, setPlan] = useState<Plan>();
  const [cohort, setCohort] = useState<Cohort>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showGroupDetails, setShowGroupDetails] = useState<boolean>(false);
  const [showStudentDetails, setStudentDetails] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [viewType, setViewType] = useState<"board" | "timeline">("board");

  const notifications = useNotifications();;

  useEffect(() => {
    fetchData();
  }, [planId]);

  useEffect(() => {
    setCohort(undefined);
    if (plan && plan.cohort_id) {
      cohortService.getById(plan.cohort_id)
        .then((cohort) => {
          if (cohort) {
            setCohort(cohort);
          } else {
            console.error(`Cohort not found ${plan.cohort_id}`);
          }
        });
    }
  }, [plan]);

  function fetchData() {
    const lastUpdated = plan ? plan.updated_at : undefined;
    setLoading(true);
    planService.getById(planId)
      .then(resp => {
        if (resp.updated_at === lastUpdated) {
          setPlan(resp)
        }
      })
      .catch((err) => {
        notifications.error(`Error reading ${planId} : ${err}`)
        console.error(`Error reading ${planId} : ${err}`)
      })
      .finally(() => setLoading(false));
  }

  function handleNameUpdate(text: string) {
    planService.update(plan!.id, { name: text })
      .then(updated => {
        if (updated) {
          notifications.success('Plan updated.');
          fetchData();
        }
      })
  }

  function handleNoteUpdate(text: string) {
    planService.update(plan!.id, { note: text })
      .then(updated => {
        if (updated) {
          notifications.success('Plan updated.');
          fetchData();
        }
      })
  }
  function exportPlan(): void {
    planExporter.exportPlan(plan!)
      .then((exported) => {
        if (exported) {
          notifications.success(`${plan!.name} exported successfully`);
        } else {
          notifications.error('Plan export failed');
        }
      })
  }

  function handleGroupDetails(): void {
    setShowGroupDetails(!showGroupDetails);
  }

  function handleStudentDetails(): void {
    setStudentDetails(!showStudentDetails);
  }

  function handleSettings(): void {
    setShowSettings(!showSettings);
  }

  function handleSettingsChange(plan: Plan): void {
    planService.update(plan.id, { group_size: plan.group_size! })
      .then(updatedPlan => {
        planGenerator.seedPlan(updatedPlan)
          .then((seededPlan) => {
            notifications.success(`Plan ${seededPlan.name} updated successfully`);
            setLoading(false)
            setPlan(seededPlan);
            setShowSettings(false);
          })
          .catch((error) => {
            notifications.error(`Failed to update plan: ${error.message}`);
          });
      })

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
        <Stack gap={1}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit"
              href="/">
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href={`/cohort/${plan.cohort_id}`}
            >
              Cohort: {cohort.name}
            </Link>
            <Typography sx={{ color: 'text.primary' }}>Plan: {plan.name}</Typography>
          </Breadcrumbs>
          <MainCard sx={{ width: '100%' }}>
            <Stack spacing={{ xs: 1, sm: 4 }} direction='row'>
              <TextEdit label={'Name'} value={plan.name} onChange={handleNameUpdate} />
              <TextEdit label={'Notes'} value={plan.note} onChange={handleNoteUpdate} />
            </Stack>
            {/* <PlanDetails /> */}
            <Box sx={{ marginTop: 1 }}  >
              <Toolbar>
                <Typography variant="h3" component="div" sx={{ flexGrow: 1 }} onClick={() => setViewType(viewType === "board" ? "timeline" : "board")} style={{ cursor: 'pointer' }}>
                  Groups
                </Typography>

                <Tooltip title="Export plan">
                  <IconButton color="inherit" onClick={exportPlan}>
                    <ExportOutlined />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Toggle group details">
                  <IconButton color="inherit" onClick={handleGroupDetails}>
                    <TeamOutlined />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Toggle student details">
                  <IconButton color="inherit" onClick={handleStudentDetails}>
                    <UserOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Show plan settings">
                  <IconButton color="inherit" onClick={handleSettings}>
                    <SettingOutlined />
                  </IconButton>
                </Tooltip>
              </Toolbar>
              {!loading && viewType === "board" && <GroupBoard showGroupDetails={showGroupDetails} showStudentDetails={showStudentDetails} />}
              {!loading && viewType === "timeline" && <TimeLine />}
              <PlanSettingsDialog
                plan={plan!}
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSubmit={handleSettingsChange}
              />
            </Box>
          </MainCard>
        </Stack>
      </CohortContext.Provider>
    </PlanContext.Provider>
  );
};

export default PlanPage;
