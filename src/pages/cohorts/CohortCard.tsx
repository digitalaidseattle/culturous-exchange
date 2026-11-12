/**
 *  CohortCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, CardHeader, Grid, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { Cohort } from "../../api/types";
import { UI_STRINGS } from '../../constants';
import { CECohortDao } from "../../api/ceCohortDao";
import { CountryChart } from "../../components/cohort_charts/CountryChart";
import { StudentAgeChart } from "../../components/cohort_charts/StudentAgeChart";
import { GenderChart } from "../../components/cohort_charts/GenderChart";


export const CohortCard = (props: { cohort: Cohort }) => {
    const cohortDao = CECohortDao.getInstance();

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
            cohortDao.delete(props.cohort.id)
                .then(() => {
                    setRefresh(refresh + 1);
                    navigate(`/cohorts`);
                    notifications.success(`Cohort ${props.cohort.name} has been deleted.`);
                })
                .catch((err) => {
                    console.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
                    notifications.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
                })
                .finally(() => {
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                })
        }
    };

    return (props.cohort &&
        <Card key={props.cohort.id}
            sx={{
                width: "100%",
                borderRadius: "10px",
                boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
                position: "relative",
            }}
            onDoubleClick={handleOpen}>
            <CardHeader
                title={props.cohort.name}
                subheader={<>
                    <Stack direction={'row'} spacing={2}>
                        <Typography>{UI_STRINGS.STUDENTS_LABEL}: {props.cohort.enrollments?.length} </Typography>
                        <Typography>{UI_STRINGS.PLANS_LABEL}: {props.cohort.plans?.length} </Typography>
                    </Stack>
                </>}
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
                <Grid container spacing={1}>
                    <Grid size={5}>
                        <Card>
                            <CardHeader title={`${UI_STRINGS.STUDENTS_LABEL} by Country`} />
                            <CountryChart cohort={props.cohort} />
                        </Card>
                    </Grid>
                    <Grid size={4}>
                        <Card>
                            <CardHeader title={`${UI_STRINGS.STUDENTS_LABEL} by Age`} />
                            <StudentAgeChart cohort={props.cohort} />
                        </Card>
                    </Grid>
                    <Grid size={3}>
                        <Card>
                            <CardHeader title={`${UI_STRINGS.STUDENTS_LABEL} by Gender`} />
                            <GenderChart cohort={props.cohort} />
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
            <ConfirmationDialog
                message={`Delete ${props.cohort.name}?`}
                open={openDeleteDialog}
                handleConfirm={() => doDelete()}
                handleCancel={() => setOpenDeleteDialog(false)} />
        </Card>
    );
}
