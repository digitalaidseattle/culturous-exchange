/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import { timeWindowService } from '../api/ceTimeWindowService';
import { Group } from '../api/types';

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
                            <Typography fontWeight={600}>Countries: </Typography>
                            <Typography>{group.country_count}</Typography>
                        </Stack>
                    </CardContent>
                    <CardContent>
                        <Typography fontWeight={600}>Time Windows</Typography>
                        {timeWindows.map((tw, idx) => <Typography key={idx}>{timeWindowService.toString(tw)}</Typography>)}
                    </CardContent>
                </>
            }
        </Card >
    );
}