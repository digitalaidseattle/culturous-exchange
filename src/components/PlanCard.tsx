
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
import { UI_STRINGS } from '../constants';
import StarAvatar from "./StarAvatar";
import { planActivation } from "../api/planActivation";


export const PlanCard = (props: { planId: Identifier }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [plan, setPlan] = useState<Plan>();
    const showMenu = Boolean(anchorEl);
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
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
        if (plan) {
            handleActivePlanToggle(!plan.active);
            setAnchorEl(null);
        }
    };

    const doDelete = () => {
        if (plan) {
            planService.deletePlan(plan)
                .then(() => {
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                    setRefresh(refresh + 1);
                    notifications.success(UI_STRINGS.PLAN_DELETED);
                })
        }
    };

    const handleActivePlanToggle = async (value: boolean) => {
        if (plan) {
            setLoading(true);
            planActivation.changeActivation(plan!, value)
                .then(() => {
                    setRefresh(refresh + 1);
                    notifications.success(`Plan ${value ? 'activated' : 'deactivated'}.`);
                })
                .catch(err => notifications.error(`Failed to update plan active state. ${err.message}`))
                .finally(() => setLoading(false))
        }
    }

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
                avatar={<StarAvatar
                    active={plan.active}
                    title={plan.active ? 'Deactivate plan' : 'Activate plan'}
                    onToggle={handleActivePlanToggle} />}
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
                    {plan.active ? "Set Inactive" : "Set Active"}
                </MenuItem>
            </Menu>
            <CardContent>
                <Typography>{UI_STRINGS.NOTES_WITH_COLON} {plan.note}</Typography>
                <Typography>{UI_STRINGS.GROUPS_WITH_COLON} {plan.groups.length}</Typography>
                <Typography>{UI_STRINGS.STUDENTS_WITH_COLON} {plan.placements.length}</Typography>
                <ConfirmationDialog
                    message={`Delete ${plan.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>

        </Card>
    );
}
