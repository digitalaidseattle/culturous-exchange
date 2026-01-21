/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import { timeWindowService } from '../api/ceTimeWindowService';
import { Group } from '../api/types';
import { UI_STRINGS } from '../constants';

export const GroupCard: React.FC<{ group: Group, showDetails: boolean }> = ({ group, showDetails }) => {
    const timeWindows = group ? group.time_windows ?? [] : [];

    return (group &&
        <Card key={group.id} sx={{ alignContent: "top" }}>
            <CardHeader
                title={group.name}
            />
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