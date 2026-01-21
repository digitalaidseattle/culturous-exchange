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
import { timeWindowService } from "../api/ceTimeWindowService";
import { Placement } from "../api/types";
import StarAvatar from "./StarAvatar";
import { UI_STRINGS, SERVICE_ERRORS } from '../constants';


export const StudentCard: React.FC<{ placement: Placement, showDetails: boolean }> = ({ placement, showDetails }) => {

    const { refresh, setRefresh } = useContext(RefreshContext);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const timeWindows = placement.student!.timeWindows ? placement.student!.timeWindows ?? [] : [];

    const toggleAnchor = async (placement: Placement) => {
        placementService
            .updatePlacement(
                placement.plan_id,
                placement.student_id,
                { anchor: !placement.anchor })
            .then(() => setRefresh(refresh + 1))
            .catch((error) => console.error(SERVICE_ERRORS.ERROR_TOGGLING_ANCHOR, error))
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
            <CardContent>
                {showDetails &&
                    <CardContent>
                        <Typography>{placement.student!.country}</Typography>
                        <Typography fontWeight={600}>{UI_STRINGS.TIME_WINDOWS}</Typography>
                        {timeWindows.map((tw, idx) => <Typography key={idx}>{timeWindowService.toString(tw)}</Typography>)}
                    </CardContent>
                }
            </CardContent>
        </Card>
    );
}