/**
 *  CohortCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, IconButton, Menu, MenuItem, Theme, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cohortService } from "../../api/ceCohortService";
import { Cohort } from "../../api/types";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { enrollmentService } from "../../api/ceEnrollmentService";
import { planService } from "../../api/cePlanService";


export const CohortCard = (props: { cohort: Cohort }) => {
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [cohort, setCohort] = useState<Cohort>(props.cohort);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (props.cohort) {
            Promise.all([planService.findByCohortId(props.cohort.id), enrollmentService.getStudents(props.cohort)])
                .then(([plans, students]) => {
                    setCohort({
                        ...cohort,
                        students: students,
                        plans: plans
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
        navigate(`/cohort/${cohort.id}`);
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const doDelete = () => {
        if (cohort && cohort.id) {
            cohortService.delete(cohort.id.toString())
                .then(() => {
                    setRefresh(refresh + 1);
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                    navigate(`/cohorts`);
                    notifications.success(`Cohort ${cohort.name} has been deleted.`);
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
                <Typography fontWeight={600}>{cohort.name}</Typography>
                <Typography>Students : {cohort.students?.length} </Typography>
                <Typography>Plans : {cohort.plans?.length} </Typography>
                <ConfirmationDialog
                    message={`Delete ${cohort.name}?`}
                    open={openDeleteDialog}
                    handleConfirm={() => doDelete()}
                    handleCancel={() => setOpenDeleteDialog(false)} />
            </CardContent>
        </Card>
    );
}
