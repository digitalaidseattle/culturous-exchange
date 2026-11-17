/**
 *  CohortCard.tsx
 *
 *  One cohort on the home page: name, the facts about it and charts of its students (as on the
 *  cohort's own page), and shortcuts into the cohort.
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import {
    ArrowRightOutlined,
    CalendarOutlined,
    MoreOutlined,
    PlusOutlined,
    TeamOutlined
} from "@ant-design/icons";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import {
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { CECohortDao } from "../../api/ceCohortDao";
import { Cohort } from "../../api/types";
import { EditCohortNameDialog } from "../../components/EditCohortNameDialog";
import { NewPlanDialog } from "../../components/NewPlanDialog";
import { UI_STRINGS } from '../../constants';
import { raisedCardSx, tonalButtonSx } from "../../utils/styles";
import { CohortCharts } from "../cohort/CohortCharts";
import { CohortFacts } from "../cohort/CohortFacts";

// Cohort page tabs (see pages/cohort/index.tsx)
const PLANS_TAB = 0;
const STUDENTS_TAB = 1;

export const CohortCard = (props: { cohort: Cohort, isCurrent?: boolean }) => {
    const { cohort, isCurrent } = props;

    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [newPlanOpen, setNewPlanOpen] = useState<boolean>(false);

    const handleEditName = () => {
        setOpenEditDialog(true);
        setAnchorEl(null);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    const doDelete = () => {
        if (cohort.id) {
            CECohortDao.getInstance()
                .delete(cohort.id)
                .then(() => {
                    setRefresh(refresh + 1);
                    notifications.success(`Cohort ${cohort.name} has been deleted.`);
                })
                .catch((err) => {
                    // say so, rather than closing the window as if it had worked
                    console.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
                    notifications.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
                })
                .finally(() => {
                    setOpenDeleteDialog(false);
                    setAnchorEl(null);
                })
        }
    };

    return (
        <Card sx={raisedCardSx}>
            <CardContent>
                <Stack gap={2}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>
                            {cohort.name}
                        </Typography>
                        {isCurrent &&
                            <Chip label={UI_STRINGS.CURRENT_COHORT} size="small" color="primary" variant="outlined" />
                        }
                        <IconButton
                            sx={{ marginLeft: 'auto' }}
                            aria-label="more"
                            onClick={(event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}>
                            <MoreOutlined />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}>
                            <MenuItem onClick={handleEditName}>{UI_STRINGS.EDIT_NAME}</MenuItem>
                            <MenuItem onClick={handleDelete}>{UI_STRINGS.DELETE_WITH_ELLIPSIS}</MenuItem>
                        </Menu>
                    </Stack>
                    <CohortFacts cohort={cohort} />
                    <CohortCharts cohort={cohort} />
                    <Divider />
                    <Stack direction="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={1.5}>
                        <Stack direction="row" flexWrap="wrap" gap={1.5}>
                            <Button
                                variant="contained"
                                sx={tonalButtonSx}
                                startIcon={<TeamOutlined />}
                                onClick={() => navigate(`/cohort/${cohort.id}?tab=${STUDENTS_TAB}`)}>
                                {UI_STRINGS.GO_TO_STUDENTS}
                            </Button>
                            <Button
                                variant="contained"
                                sx={tonalButtonSx}
                                startIcon={<CalendarOutlined />}
                                onClick={() => navigate(`/cohort/${cohort.id}?tab=${PLANS_TAB}`)}>
                                {UI_STRINGS.GO_TO_PLANS}
                            </Button>
                            <Button
                                variant="contained"
                                sx={tonalButtonSx}
                                startIcon={<PlusOutlined />}
                                onClick={() => setNewPlanOpen(true)}>
                                {UI_STRINGS.NEW_PLAN_BUTTON}
                            </Button>
                        </Stack>
                        <Button
                            variant="contained"
                            sx={{ textTransform: 'none' }}
                            startIcon={<ArrowRightOutlined />}
                            onClick={() => navigate(`/cohort/${cohort.id}`)}>
                            {UI_STRINGS.OPEN_COHORT}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
            <NewPlanDialog
                cohort={cohort}
                open={newPlanOpen}
                onClose={() => setNewPlanOpen(false)} />
            <EditCohortNameDialog
                cohort={cohort}
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)} />
            <ConfirmationDialog
                message={`Delete ${cohort.name}?`}
                open={openDeleteDialog}
                handleConfirm={() => doDelete()}
                handleCancel={() => setOpenDeleteDialog(false)} />
        </Card>
    );
}
