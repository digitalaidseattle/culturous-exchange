
/**
 *  PlanCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { LoadingContext, RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, CardHeader, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { planService } from "../api/cePlanService";
import { Identifier, Plan } from "../api/types";
import StarAvatar from "./StarAvatar";


export const PlanCard = (props: { planId: Identifier }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [plan, setPlan] = useState<Plan>();
    const showMenu = Boolean(anchorEl);
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [active, setActive] = useState<boolean>(false);
    const { loading, setLoading } = useContext(LoadingContext);



    const navigate = useNavigate();

    useEffect(() => {
        if (props.planId) {
            planService.
                getById(props.planId)
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
            planService.duplicate(plan)
            setAnchorEl(null);
        }
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const handleActive = () => {
        handleActivePlanToggle(!active);
        setAnchorEl(null);
    };

    const doDelete = () => {
        if (plan) {
            planService.deletePlan(plan)
                .then(() => {
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                    setRefresh(refresh + 1);
                    notifications.success('Plan deleted.');
                })
        }
    };
        useEffect(() => {
      let mounted = true;
      if (!props.planId) return;
      // use existing getById to fetch the plan (includes active)
      planService
        .getById(props.planId)
        .then((freshPlan) => {
          if (mounted && freshPlan) {
            setActive(!!freshPlan.active);
          }
        })
        .catch((err) => console.error("Failed to fetch plan active", err));
      return () => {
        mounted = false;
      };
        }, [props.planId, refresh]);

    const handleActivePlanToggle = async (value: boolean) => {
            setLoading(true);
            try {
                // If activating this plan, first deactivate other plans in the same cohort
                if (value && plan && plan.cohort_id) {
                    try {
                        const cohortPlans = await planService.findByCohortId(plan.cohort_id);
                        const othersToDeactivate = cohortPlans.filter(p => p.id !== plan.id && p.active);
                        if (othersToDeactivate.length > 0) {
                            console.log(`Deactivating ${othersToDeactivate.length} other plans in cohort`);
                            await Promise.all(othersToDeactivate.map(p => planService.update(p.id, { active: false } as Partial<Plan>)));
                        }
                    } catch (err) {
                        console.error('Failed to deactivate other plans in cohort', err);
                        // proceed to try to activate current plan anyway
                    }
                }

                // Send only the changed field using the existing update API for this plan
                await planService.update(props.planId, { active: value } as Partial<Plan>);

                // Re-fetch to get normalized plan object
                const updatedPlan = await planService.getById(props.planId);
                setActive(!!updatedPlan.active);
                setRefresh(refresh + 1);
                notifications.success(`Plan ${value ? 'activated' : 'deactivated'}.`);
            } catch (err) {
                console.error('Failed to toggle plan active', err);
                notifications.error('Failed to update plan active state.');
            } finally {
                setLoading(false);
            }
    };



    return (plan &&
        <Card
            sx={{
                width: "240px",
                height: "240px",
                borderRadius: "10px",
                boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
                position: "relative",
            }}
            onDoubleClick={handleOpen}>
            <CardHeader
                avatar={
                    <StarAvatar active={active} loading={loading} onToggle={handleActivePlanToggle} />
                }

                title={plan.name}
                action={<IconButton
                    onClick={handleClick}
                    aria-label="more">
                    <MoreOutlined />
                </IconButton>
                } />
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
                <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
                <MenuItem onClick={handleDelete}>Delete...</MenuItem>
                <MenuItem disabled={loading} onClick={handleActive}>
                    {active ? "InActive" : "Active"}
                </MenuItem>
            </Menu>
            <CardContent>
                <Typography>Notes : {plan.note}</Typography>
                <Typography>Groups : {plan.groups.length}</Typography>
                <Typography>Students : {plan.placements.length}</Typography>
                <ConfirmationDialog
                    message={`Delete ${plan.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>

        </Card>
    );
}
