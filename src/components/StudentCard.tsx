/**
 *  StudentCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import {
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Menu,
    MenuItem,
    Typography
} from "@mui/material";

import { RefreshContext } from "@digitalaidseattle/core";
import { useContext, useState } from "react";
import { placementService } from "../api/cePlacementService";
import { PlanContext } from "../pages/plan/PlanContext";
import { timeWindowService } from "../api/ceTimeWindowService";
import { Placement } from "../api/types";
import StarAvatar from "./StarAvatar";
import { UI_STRINGS, SERVICE_ERRORS } from '../constants';


export const StudentCard: React.FC<{ placement: Placement, showDetails: boolean }> = ({ placement, showDetails }) => {

    const { refresh, setRefresh } = useContext(RefreshContext);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const timeWindows = placement.student!.timeWindows ?? [];

    const { plan, setPlan } = useContext(PlanContext);

    const toggleAnchor = async (placement: Placement) => {
        if (!plan) {
            // no plan in context - fallback to server update
            try {
                await placementService.updatePlacement(
                    placement.plan_id,
                    placement.student_id,
                    { anchor: !placement.anchor });
                setRefresh(refresh + 1);
            } catch (error) {
                console.error(SERVICE_ERRORS.ERROR_TOGGLING_ANCHOR, error)
            }
            return;
        }

        // Optimistic update: update plan in-place so UI doesn't re-fetch and reorder placements
        const originalPlan = plan;
        const updatedPlan = {
            ...plan,
            placements: plan.placements.map(p =>
                p.plan_id === placement.plan_id && p.student_id === placement.student_id
                    ? { ...p, anchor: !p.anchor }
                    : p
            )
        };

        try {
            setPlan(updatedPlan);

            await placementService.updatePlacement(
                placement.plan_id,
                placement.student_id,
                { anchor: !placement.anchor });

            // success: no further action needed (student propagation handled server-side)
        } catch (error) {
            // revert optimistic update on error
            try {
                setPlan(originalPlan);
            } catch (e) {
                // ignore
            }
            console.error(SERVICE_ERRORS.ERROR_TOGGLING_ANCHOR, error)
            setRefresh(refresh + 1);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        // FIXME  not implemented
        // navigate(`/plan/${props.plan.id}`);
        setAnchorEl(null);
    };

    const handleRemove = () => {
        // FIXME  not implemented
        // setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    return (placement &&
        <Card
            id={`${placement.plan_id}.${placement.student_id}`}
            key={placement.student_id}
            sx={{
                pointerEvents: 'auto',
                position: "relative",
            }}>
            <CardHeader
                avatar={
                    <StarAvatar
                        active={placement.anchor}
                        title={placement.anchor ? 'Remove anchor flag' : 'Set as anchor'}
                        onToggle={() => toggleAnchor(placement)} />
                }
                title={placement.student!.name}
                titleTypographyProps={{ fontWeight: 600 }}
                action={
                    <IconButton
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
                <MenuItem onClick={handleOpen}>{UI_STRINGS.OPEN}</MenuItem>
                <MenuItem onClick={handleRemove}>{UI_STRINGS.REMOVE}</MenuItem>
            </Menu>
            {showDetails &&
                <CardContent>
                    <Typography>{placement.student!.country}</Typography>
                    <Typography fontWeight={600}>{UI_STRINGS.TIME_WINDOWS}</Typography>
                    {timeWindows.map((tw, idx) => <Typography key={idx}>{timeWindowService.toString(tw)}</Typography>)}
                </CardContent>
            }
        </Card>
    );
}