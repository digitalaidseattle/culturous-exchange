
/**
 *  PlanCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, IconButton, Menu, MenuItem, Theme, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { planService } from "../api/cePlanService";
import { Plan } from "../api/types";
import { useNotifications } from "@digitalaidseattle/core";
import { placementService } from "../api/cePlacementService";


export const PlanCard = (props: { plan: Plan }) => {
    const notifications = useNotifications();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const [plan, setPlan] = useState<Plan>(props.plan);

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (props.plan) {
            placementService.findByPlanId(props.plan.id)
                .then(placements => {
                    setPlan({
                        ...props.plan,
                        placements: placements
                    })
                })
        }
    }, [props]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        navigate(`/plan/${plan.id}`);
        setAnchorEl(null);
    };

    const handleDuplicate = () => {
        planService.duplicate(plan)
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const doDelete = () => {
        if (plan) {
            planService.delete(plan.id)
                .then(() => {
                    notifications.success(`Deleted plan ${plan.name}.`);
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                })
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
            }}>
            <IconButton
                onClick={handleClick}
                aria-label="close"
                sx={{
                    position: "absolute", top: 8, right: 8,
                    color: (theme: Theme) => theme.palette.grey[500],
                }}>
                <MoreOutlined />
            </IconButton>
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
            </Menu>
            <CardContent>
                <Typography fontWeight={600}>{plan.name}</Typography>
                <Typography>Notes : {plan.note}</Typography>
                <Typography>Students : {plan.placements ? plan.placements.length : 0}</Typography>
                <ConfirmationDialog
                    message={`Delete ${plan.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>
        </Card>
    );
}
