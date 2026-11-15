/**
 *  PlanCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { Identifier, LoadingContext, RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Box, Card, CardContent, CardHeader, Grid, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CEPlanDao } from "../api/cePlanDao";
import { Plan } from "../api/types";
import { UI_STRINGS } from '../constants';
import StarAvatar from "./StarAvatar";
import { planDelete } from "../services/plan/planDelete";
import { planActivation } from "../services/plan/planActivation";
import { planDuplicate } from "../services/plan/planDuplicate";
import { CEPlanService } from "../services/plan/cePlanService";
import PlanSettingsDialog from "./PlanSettingsDialog";
import { PlanGenerator } from "../services/plan/planGenerator";


export const PlanCard = (props: { planId: Identifier }) => {
    const planService = new CEPlanService();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [plan, setPlan] = useState<Plan>();
    const showMenu = Boolean(anchorEl);
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const { loading, setLoading } = useContext(LoadingContext);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const navigate = useNavigate();

    // Per-group stats for the charts, ordered by group name so all three charts line up.
    const groupStats = useMemo(() => {
        const groups = [...(plan?.groups ?? [])]
            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { numeric: true }));
        return {
            names: groups.map(g => g.name),
            overlaps: groups.map(g => g.duration ?? 0),
            students: groups.map(g => (g.placements ?? []).length),
            countries: groups.map(g => g.country_count ?? 0),
        };
    }, [plan]);

    // Refetch the plan on refresh (poll + post-mutation bump) as well as on planId
    // change, so the card's own state (active star, name, note, counts, durations)
    // stays current without relying on the parent remounting it. The menu/dialog
    // state below is plain local state that a re-render does not reset, so open
    // overlays survive a refresh.
    useEffect(() => {
        if (props.planId) {
            CEPlanDao.getInstance()
                .getById(props.planId)
                .then((resp) => setPlan(resp!))
        }
    }, [props.planId, refresh]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        if (plan) {
            navigate(`/plan/${plan.id}`);
            setAnchorEl(null);
        }
    };

    const handleDuplicate = () => {
        if (plan) {
            setLoading(true)
            planDuplicate(plan)
                .then(() => {
                    setAnchorEl(null);
                    setRefresh(refresh + 1);
                })
                .finally(() => setLoading(false));
        }
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const handleActive = () => {
        if (plan) {
            handleActivePlanToggle(!plan.active);
            setAnchorEl(null);
        }
    };

    const doDelete = () => {
        planDelete(plan!)
            .then(() => notifications.success(UI_STRINGS.PLAN_DELETED))
            .catch(error => notifications.error(`Error deleting ${error.message}`))
            .finally(() => {
                setOpenDeleteDialog(false);
                setAnchorEl(null);
                setRefresh(refresh + 1);
            })
    };

    const handleActivePlanToggle = async (value: boolean) => {
        if (plan) {
            setLoading(true);
            planActivation.changeActivation(plan, value)
                .then(() => {
                    setRefresh(refresh + 1);
                    notifications.success(`Plan ${value ? 'activated' : 'deactivated'}.`);
                })
                .catch(err => notifications.error(`Failed to update plan active state. ${err.message}`))
                .finally(() => setLoading(false))
        }
    }

    function handleSettings(): void {
        setShowSettings(!showSettings);
        setAnchorEl(null);
    }

    async function handleSettingsChange(changed: Plan): Promise<void> {
        if (plan) {
            try {
                const seededPlan = await PlanGenerator.getInstance()
                    .run({
                        ...plan,
                        name: changed.name,
                        note: changed.note,
                        group_size: changed.group_size!,
                        optimization_style: changed.optimization_style
                    })
                setPlan(seededPlan)
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

    return (plan &&
        <>
            <Card
                sx={{
                    width: "100%",
                    minHeight: "260px",
                    borderRadius: "10px",
                    boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
                    position: "relative",
                }}
                onDoubleClick={handleOpen}>
                <CardHeader
                    avatar={<StarAvatar
                        active={plan.active}
                        title={plan.active ? 'Deactivate plan' : 'Activate plan'}
                        onToggle={handleActivePlanToggle} />}
                    title={<Typography variant="h5">{plan.name}</Typography>}
                    subheader={
                        <Stack>
                            <Typography>{plan.note}</Typography>
                            <Typography>{UI_STRINGS.GENERATION_METHOD}: {plan.optimization_style}</Typography>
                            <Typography>{UI_STRINGS.GROUP_SIZE_LABEL}: {plan.group_size}</Typography>
                        </Stack>
                    }
                    action={<IconButton
                        onClick={handleClick}
                        aria-label="more">
                        <MoreOutlined />
                    </IconButton>}
                />
                <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={anchorEl}
                    open={showMenu}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={handleOpen}>Open</MenuItem>
                    <MenuItem onClick={handleSettings}>Settings...</MenuItem>
                    <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete...</MenuItem>
                    <MenuItem disabled={loading} onClick={handleActive}>
                        {plan.active ? "Set Inactive" : "Set Active"}
                    </MenuItem>
                </Menu>
                {groupStats.names.length > 0 &&
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid size={2} >
                                <Stack>
                                    <Typography>{UI_STRINGS.GROUPS_LABEL}: {(plan.groups ?? []).length}</Typography>
                                    <Typography>{UI_STRINGS.STUDENTS_LABEL}: {(plan.placements ?? []).length}</Typography>
                                    <Typography>{UI_STRINGS.WAITLISTED}: {(planService.getWaitlisted(plan)).length}</Typography>
                                    <Typography>{UI_STRINGS.TOTAL_DURATION}: {plan.total_duration}</Typography>
                                    <Typography>{UI_STRINGS.AVG_COUNTRY_COUNT}: {plan.avg_country_count}</Typography>
                                    <Typography>{UI_STRINGS.AVG_DURATION}: {plan.avg_duration}</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={5} >
                                <GroupBarChart
                                    title={UI_STRINGS.GROUP_OVERLAP_CHART}
                                    names={groupStats.names}
                                    series={[{ data: groupStats.overlaps, label: "Hours" }]} />
                            </Grid>
                            <Grid size={5} >
                                <GroupBarChart
                                    title={UI_STRINGS.GROUP_STUDENTS_COUNTRIES_CHART}
                                    names={groupStats.names}
                                    series={[
                                        { data: groupStats.students, label: UI_STRINGS.STUDENTS_LABEL },
                                        { data: groupStats.countries, label: "Countries" },
                                    ]} />
                            </Grid>
                        </Grid>
                    </CardContent>
                }
            </Card>
            <ConfirmationDialog
                message={`Delete ${plan.name}?`}
                open={openDeleteDialog}
                handleConfirm={() => doDelete()}
                handleCancel={() => setOpenDeleteDialog(false)} />
            <PlanSettingsDialog
                plan={plan!}
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSubmit={handleSettingsChange}
            />
        </>
    );
}

const GroupBarChart = (props: { title: string, names: string[], series: { data: number[], label: string }[] }) => (
    <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" mt={1}>{props.title}</Typography>
        <BarChart
            xAxis={[{ data: props.names, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
            yAxis={[{ tickMinStep: 1, width: 30 }]}
            series={props.series}
            height={180}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            hideLegend={props.series.length < 2}
        />
    </Box>
);
