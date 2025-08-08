
/**
 *  PlanCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, IconButton, Menu, MenuItem, Theme, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { planService } from "../api/cePlanService";
import { Plan } from "../api/types";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";


export const PlanCard = (props: { plan: Plan }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        navigate(`/plan/${props.plan.id}`);
        setAnchorEl(null);
    };

    const handleDuplicate = () => {
        planService.duplicate(props.plan)
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const doDelete = () => {
        planService.delete(props.plan.id)
            .then(() => {
                setOpenDeleteDialog(false);
                setAnchorEl(null);
                setRefresh(refresh + 1);
                notifications.success('Plan deleted.');
            })
    };

    return (
        <Card
            sx={{
                width: "240px",
                height: "240px",
                borderRadius: "10px",
                boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
                position: "relative",
            }}
            onDoubleClick={handleOpen}>
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
                <Typography fontWeight={600}>{props.plan.name}</Typography>
                <Typography>Notes : {props.plan.note}</Typography>
                <Typography>Stats : # of students, groups, etc.</Typography>
                <ConfirmationDialog
                    message={`Delete ${props.plan.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>
        </Card>
    );
}
