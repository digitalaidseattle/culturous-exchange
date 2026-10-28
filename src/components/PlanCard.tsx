/**
 *  PlanCard.tsx
 *
 *  One plan on the cohort page. Styled to match the cohort cards on the home page.
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ArrowRightOutlined, MoreOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Identifier, LoadingContext, RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Button, Card, CardContent, Divider, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CEPlanDao } from "../api/cePlanDao";
import { Plan } from "../api/types";
import { UI_STRINGS } from '../constants';
import { planActivation } from "../services/plan/planActivation";
import { planDelete } from "../services/plan/planDelete";
import { planDuplicate } from "../services/plan/planDuplicate";
import { planStats } from "../services/plan/planStats";
import { clickableCardSx, tonalButtonSx } from "../utils/styles";
import { CountryChip } from "./CountryChip";
import { EditPlanNameDialog } from "./EditPlanNameDialog";
import { PlanStatusChip } from "./PlanStatusChip";
import { PlanSummary } from "./PlanSummary";

export const PlanCard = (props: { planId: Identifier }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [plan, setPlan] = useState<Plan>();
    const showMenu = Boolean(anchorEl);
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const { loading, setLoading } = useContext(LoadingContext);

    const navigate = useNavigate();

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

    // The whole card opens the plan, so the buttons and menu on it must not also pass their clicks on to the card
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // "groups" or "students" opens the plan with that part's details showing
    const handleOpen = (edit?: 'groups' | 'students') => {
        if (plan) {
            navigate(edit ? `/plan/${plan.id}?edit=${edit}` : `/plan/${plan.id}`);
            setAnchorEl(null);
        }
    };

    const handleEditName = () => {
        setOpenEditDialog(true);
        setAnchorEl(null);
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

    const stats = plan ? planStats(plan) : undefined;

    return (plan && stats &&
        <>
            <Card sx={clickableCardSx} onClick={() => handleOpen()}>
                <CardContent>
                    <Stack gap={2}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>
                                {plan.name}
                            </Typography>
                            {/* status, shown for every plan; Set Active and Set Inactive are in the menu */}
                            <PlanStatusChip active={Boolean(plan.active)} />
                            <IconButton
                                sx={{ marginLeft: 'auto' }}
                                onClick={handleClick}
                                aria-label="more">
                                <MoreOutlined />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={showMenu}
                                onClose={handleClose}
                                // the menu is drawn elsewhere on the page, but its clicks would still reach the card
                                onClick={(event) => event.stopPropagation()}>
                                <MenuItem onClick={() => handleOpen()}>{UI_STRINGS.OPEN_PLAN}</MenuItem>
                                <MenuItem onClick={handleEditName}>{UI_STRINGS.EDIT_NAME}</MenuItem>
                                <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
                                <MenuItem onClick={handleDelete}>Delete...</MenuItem>
                                <MenuItem disabled={loading} onClick={handleActive}>
                                    {plan.active ? "Set Inactive" : "Set Active"}
                                </MenuItem>
                            </Menu>
                        </Stack>
                        {plan.note &&
                            <Typography>{UI_STRINGS.NOTES_LABEL}: {plan.note}</Typography>
                        }
                        <PlanSummary stats={stats} />
                        {stats.countries.length > 0 &&
                            <Stack gap={0.75}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {UI_STRINGS.COUNTRIES_REPRESENTED}
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                                    {stats.countries.map(country =>
                                        <CountryChip key={country.name} country={country.name} count={country.count} />
                                    )}
                                </Stack>
                            </Stack>
                        }
                        <Divider />
                        <Stack direction="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={1.5}>
                            <Stack direction="row" flexWrap="wrap" gap={1.5}>
                                <Button
                                    variant="contained"
                                    sx={tonalButtonSx}
                                    startIcon={<TeamOutlined />}
                                    onClick={(event) => { event.stopPropagation(); handleOpen('groups'); }}>
                                    {UI_STRINGS.EDIT_GROUPS}
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={tonalButtonSx}
                                    startIcon={<UserOutlined />}
                                    onClick={(event) => { event.stopPropagation(); handleOpen('students'); }}>
                                    {UI_STRINGS.EDIT_STUDENTS}
                                </Button>
                            </Stack>
                            <Button
                                variant="contained"
                                sx={{ textTransform: 'none' }}
                                startIcon={<ArrowRightOutlined />}
                                onClick={(event) => { event.stopPropagation(); handleOpen(); }}>
                                {UI_STRINGS.OPEN_PLAN}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
            <EditPlanNameDialog
                plan={plan}
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)} />
            <ConfirmationDialog
                message={`Delete ${plan.name}?`}
                open={openDeleteDialog}
                handleConfirm={() => doDelete()}
                handleCancel={() => setOpenDeleteDialog(false)} />
        </>
    );
}
