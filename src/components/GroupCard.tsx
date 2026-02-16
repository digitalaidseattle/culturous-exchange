/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';

import { useEffect, useState } from 'react';
import { addFacilitatorsToGroup } from "../api/addFacilitatorsToGroup";
import { facilitatorService } from '../api/ceFacilitatorService';
import { timeWindowService } from '../api/ceTimeWindowService';
import { removeFacilitatorsFromGroup } from "../api/removeFacilitatorsFromGroup";
import { Facilitator, Group, TimeWindow } from '../api/types';
import { UI_STRINGS, WAITLIST_ID } from '../constants';
import AddFacilitatorModal from './AddFacilitatorModal';

export const GroupCard: React.FC<{ group: Group, showDetails: boolean }> = ({ group: initial, showDetails }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const showMenu = Boolean(anchorEl);

    const [allFacilitators, setAllFacilitators] = useState<Facilitator[]>([]);
    const [availableFacilitators, setAvailableFacilitators] = useState<Facilitator[]>([]);

    const [group, setGroup] = useState<Group>();
    const [isGroup, setIsGroup] = useState<boolean>(false);
    const [showAddFacilitator, setShowAddFacilitator] = useState<boolean>(false);
    const [groupFacilitator, setGroupFacilitator] = useState<string>();
    const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);

    useEffect(() => {
        facilitatorService.getAll()
            .then(ff => setAllFacilitators(ff));
    }, []);

    useEffect(() => {
        setGroup(initial);
    }, [initial])

    useEffect(() => {
        if (group) {
            setIsGroup(![WAITLIST_ID].includes(group.id as string));
            setGroupFacilitator((group.assignments ?? []).map(a => a.facilitator!.name).join(', '));
            setTimeWindows(group.time_windows ?? []);
        }
    }, [group]);

    useEffect(() => {
        if (group) {
            const current = (group.assignments ?? [])
                .map(a => a.facilitator?.id);
            setAvailableFacilitators(allFacilitators.filter(f => !current.includes(f.id)))
        }
    }, [group, allFacilitators])

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAdd = () => {
        setShowAddFacilitator(true);
        setAnchorEl(null);
    };

    const handleRemove = () => {
        if (group) {
            removeFacilitatorsFromGroup(group)
                .then((updated) => setGroup(updated!))
                .finally(() => setAnchorEl(null));
        }
    };

    const handleCloseModal = () => {
        setShowAddFacilitator(false);
    }

    const handleAddFacilitator = (newFacilitators: Facilitator[]) => {
        if (group) {
            addFacilitatorsToGroup(group, newFacilitators)
                .then((updated) => {
                    console.log('handleAddFacilitator', updated)
                    setShowAddFacilitator(false);
                    setGroup({ ...updated! });
                });
        }
    }

    return (group &&
        <Card key={group.id} sx={{ alignContent: "top" }}>
            <CardHeader
                title={group.name}
                subheader={groupFacilitator}
                action={isGroup &&
                    <IconButton
                        onClick={handleClick}
                        aria-label="more">
                        <MoreOutlined />
                    </IconButton>
                }
            />
            {isGroup &&
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
                    <MenuItem onClick={handleAdd}>{UI_STRINGS.CHANGE_FACILITATOR}</MenuItem>
                    <MenuItem onClick={handleRemove} disabled={(group.assignments ?? []).length === 0}>{UI_STRINGS.REMOVE_FACILITATOR}</MenuItem>
                </Menu>
            }
            {
                showDetails &&
                <>
                    <CardContent>
                        <Stack direction={'row'} spacing={1} >
                            <Typography fontWeight={600}>{UI_STRINGS.COUNTRIES}</Typography>
                            <Typography>{group.country_count}</Typography>
                        </Stack>
                        <Stack direction={'row'} spacing={1} >
                            <Typography fontWeight={600}>{UI_STRINGS.DURATION}</Typography>
                            <Typography>{group.duration ? group.duration.toFixed(2) : UI_STRINGS.NOT_AVAILABLE}</Typography>
                        </Stack>
                    </CardContent>
                    <CardContent>
                        <Typography fontWeight={600}>{UI_STRINGS.TIME_WINDOWS}</Typography>
                        {timeWindows.map((tw, idx) => <Typography key={idx}>{timeWindowService.toString(tw)}</Typography>)}
                    </CardContent>
                </>
            }
            <AddFacilitatorModal
                facilitators={availableFacilitators}
                isOpen={showAddFacilitator}
                onClose={handleCloseModal}
                onSubmit={handleAddFacilitator} />
        </Card >
    );
}
