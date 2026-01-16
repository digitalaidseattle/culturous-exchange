/**
 *  CohortCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, CardHeader, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { cohortService } from "../../api/ceCohortService";
import { Cohort } from "../../api/types";
import { UI_STRINGS } from '../../constants';


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

    return (props.cohort &&
        <Card key={props.cohort.id}
            sx={{
                width: "240px",
                height: "240px",
                borderRadius: "10px",
                boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
                position: "relative",
            }}
            onDoubleClick={handleOpen}>
            <CardHeader
                title={props.cohort.name}
                action={
                    <IconButton
                        onClick={handleClick}
                        aria-label="more">
                        <MoreOutlined />
                    </IconButton>} />
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
                <MenuItem onClick={handleOpen}>{UI_STRINGS.OPEN}</MenuItem>
                <MenuItem onClick={handleDelete}>{UI_STRINGS.DELETE_WITH_ELLIPSIS}</MenuItem>
            </Menu>
            <CardContent>
                <Typography>{UI_STRINGS.STUDENTS_WITH_COLON} {props.cohort.enrollments?.length} </Typography>
                <Typography>{UI_STRINGS.PLANS_WITH_COLON} {props.cohort.plans?.length} </Typography>
                <ConfirmationDialog
                    message={`Delete ${props.cohort.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>
        </Card>
    );
}
