/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Card, CardContent, Stack, Typography } from '@mui/material';
import { format } from "date-fns";
import { Group } from '../api/types';

export const GroupCard: React.FC<{ group: Group, showDetails: boolean }> = ({ group, showDetails }) => {
    const timeWindows = group ? group.time_windows ?? [] : [];

    if (group.name === "Group 1") {
        console.log(group.name, group)

    }


    return (group &&
        <Card key={group.id} sx={{ alignContent: "top" }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600}>{group.name}</Typography>
            </CardContent>
            {showDetails &&
                <>
                    <CardContent>
                        <Stack direction={'row'} spacing={1} >
                            <Typography fontWeight={600}>Countries: </Typography>
                            <Typography>{group.country_count}</Typography>
                        </Stack>
                    </CardContent>
                    <CardContent>
                        <Typography fontWeight={600}>Time Windows</Typography>
                        {timeWindows.map((tw, idx) => {
                            const day = format(tw.start_date_time!, "EEE");
                            const start = format(tw.start_date_time!, "haaa");
                            const end = format(tw.end_date_time!, "haaa");
                            return <Typography key={idx}>{day} {start} - {end}</Typography>
                        })}
                    </CardContent>
                </>
            }
        </Card>
    );
}