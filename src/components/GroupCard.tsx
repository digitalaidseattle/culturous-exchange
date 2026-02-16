/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MoreOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';

import { useEffect, useState } from 'react';
import { timeWindowService } from '../api/ceTimeWindowService';
import { Group, TimeWindow } from '../api/types';
import { UI_STRINGS, WAITLIST_ID } from '../constants';
import { FacilitatorMenu } from "../pages/plan/FacilitatorMenu";

export const GroupCard: React.FC<{ group: Group, showDetails: boolean }> = ({ group: initial, showDetails }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const [group, setGroup] = useState<Group>();
    const [isGroup, setIsGroup] = useState<boolean>(false);
    const [facilitatorNames, setFacilitatorNames] = useState<string>();
    const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);

    useEffect(() => {
        setGroup(initial);
    }, [initial])

    useEffect(() => {
        if (group) {
            setIsGroup(![WAITLIST_ID].includes(group.id as string));
            setFacilitatorNames((group.assignments ?? []).map(a => a.facilitator!.name).join(', '));
            setTimeWindows(group.time_windows ?? []);
        }
    }, [group]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    return (group &&
        <Card key={group.id} sx={{ alignContent: "top" }}>
            <CardHeader
                title={group.name}
                subheader={facilitatorNames}
                action={isGroup &&
                    <IconButton
                        onClick={handleClick}
                        aria-label="more">
                        <MoreOutlined />
                    </IconButton>
                }
            />
            {isGroup &&
                <FacilitatorMenu anchorElement={anchorEl} group={group} onChange={updated => setGroup(updated)} />
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
        </Card >
    );
}
