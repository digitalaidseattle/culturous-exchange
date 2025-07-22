/**
 *  CohortCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, IconButton, Menu, MenuItem, Theme, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cohortService } from "../../api/ceCohortService";
import { enrollmentService } from "../../api/ceEnrollmentService";
import { Cohort } from "../../api/types";


export const CohortCard = (props: { cohort: Cohort }) => {
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        navigate(`/cohort/${props.cohort.id}`);
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const doDelete = () => {
        if (props.cohort && props.cohort.id) {
            cohortService.delete(props.cohort.id.toString())
                .then(() => {
                    setRefresh(refresh + 1);
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                    navigate(`/cohorts`);
                    notifications.success(`Cohort ${props.cohort.name} has been deleted.`);
                })
        }
    };

    return (cohort &&
        <Card key={cohort.id}
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
                <MenuItem onClick={handleDelete}>Delete...</MenuItem>
            </Menu>
            <CardContent>
                <Typography fontWeight={600}>{props.cohort.name}</Typography>
                <Typography>Students : {props.cohort.enrollments?.length} </Typography>
                <Typography>Plans : {props.cohort.plans?.length} </Typography>
                <ConfirmationDialog
                    message={`Delete ${props.cohort.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>
        </Card>
    );
}
