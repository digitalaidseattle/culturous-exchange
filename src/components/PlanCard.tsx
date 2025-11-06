
/**
 *  PlanCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { Card, CardContent, IconButton, Menu, MenuItem, Theme, Typography } from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import { useTheme } from '@mui/material/styles';
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
    const [active, setActive] = useState<boolean>(props.plan.active ?? false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const theme = useTheme();

    // Fetch latest plan from DB to ensure active state is current
    useEffect(() => {
        let mounted = true;
        if (!props.plan?.id) return;
        // fetch only the active flag to keep payload small
        planService.getActiveById(props.plan.id)
            .then((freshActive) => {
                if (mounted && freshActive !== null) {
                    setActive(!!freshActive);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch plan active state', err);
            });
        return () => { mounted = false; };
    }, [props.plan.id]);

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

    const handleActivePlanToggle = async (value: boolean) => {
        setIsUpdating(true);
        try {
            const updatedPlan = await planService.setActive(props.plan.id, value);
            setActive(!!updatedPlan.active);
            setAnchorEl(null);
            setRefresh(refresh + 1);
            notifications.success(`Plan ${value ? 'activated' : 'deactivated'}.`);
        } catch (err) {
            console.error('Failed to set active on plan', err);
            notifications.error('Failed to update plan active state.');
        } finally {
            setIsUpdating(false);
        }
    }


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
            {/* plain green status dot above the More button only when active */}
            {active && (
                <span
                    role="button"
                    aria-label={active ? 'Plan is active' : 'Plan is inactive'}
                    onClick={(e) => { e.stopPropagation(); handleActivePlanToggle(!active); }}
                    tabIndex={0}
                    title={active ? 'Deactivate plan' : 'Activate plan'}
                    style={{
                        position: 'absolute',
                        right: 8,
                        top: 6,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: theme.palette?.success?.main ?? 'green',
                        boxShadow: '0 0 6px rgba(0,128,0,0.6)',
                        cursor: 'pointer'
                    }}
                />
            )}

            <IconButton
                onClick={handleClick}
                aria-label="close"
                sx={{
                    position: "absolute",
                    top: active ? 12 : 8,
                    right: 8,
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
                <MenuItem disabled={isUpdating} onClick={() => { handleActivePlanToggle(!active); }}>
                    {active ? 'InActive' : 'Active'}
                </MenuItem>
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
