/**
 *  StudentCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import {
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Theme,
    Typography
} from "@mui/material";
import { format } from "date-fns";

import { useContext, useState } from "react";
import { placementService } from "../api/cePlacementService";
import { planService } from "../api/cePlanService";
import { Placement } from "../api/types";
import { PlanContext } from "../pages/plan/PlanContext";


export const StudentCard: React.FC<{ placement: Placement, showDetails: boolean }> = ({ placement, showDetails }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const { plan, setPlan } = useContext(PlanContext);

    const anchor = placement.anchor ? 'green' : 'gray';
    const timeWindows = placement.student!.timeWindows ? placement.student!.timeWindows ?? [] : [];

    const toggleAnchor = async (placement: Placement) => {
        placementService
            .updatePlacement(
                placement.plan_id,
                placement.student_id,
                { anchor: !placement.anchor })
            .then(() => refreshPlan())
            .catch((error) => console.error('Error toggling anchor:', error))
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = () => {
        // navigate(`/plan/${props.plan.id}`);
        setAnchorEl(null);
    };

    const handleRemove = () => {
        // setOpenDeleteDialog(true)
        setAnchorEl(null);
    };

    function refreshPlan() {
        planService.getById(plan.id)
            .then((resp) => setPlan(resp))
    }

    return (placement &&
        <Card
            id={`${placement.plan_id}.${placement.student_id}`}
            key={placement.student_id}
            sx={{
                pointerEvents: 'auto',
                margin: 0,
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
                <MenuItem onClick={handleRemove}>Remove...</MenuItem>
            </Menu>
            <CardContent>
                <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                    {placement.anchor &&
                        <StarFilled style={{ fontSize: '150%', color: anchor }}
                            onClick={() => toggleAnchor(placement)} />
                    }
                    {!placement.anchor &&
                        <StarOutlined style={{ fontSize: '150%', color: anchor }}
                            onClick={() => toggleAnchor(placement)} />
                    }
                    <Typography fontWeight={600}>{placement.student!.name}</Typography>
                </Stack>
                {showDetails &&
                    <CardContent>
                        <Typography>{placement.student!.country}</Typography>
                        <Typography fontWeight={600}>Time Windows</Typography>
                        {timeWindows.map((tw, idx) => {
                            const day = format(tw.start_date_time!, "EEE");
                            const start = format(tw.start_date_time!, "haaa");
                            const end = format(tw.end_date_time!, "haaa");
                            return <Typography key={idx}>{day} {start} - {end}</Typography>
                        })}
                    </CardContent>
                }
            </CardContent>
        </Card>
    );
}