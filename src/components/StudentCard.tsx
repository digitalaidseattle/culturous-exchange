/**
 *  StudentCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { StarFilled } from "@ant-design/icons";
import {
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import { format } from "date-fns";

import { Placement } from "../api/types";


export const StudentCard: React.FC<{ placement: Placement, showDetails: boolean }> = ({ placement, showDetails }) => {

    const anchor = placement.anchor ? 'green' : 'gray;';
    const timeWindows = placement.student!.timeWindows ? placement.student!.timeWindows ?? [] : [];

    return (placement &&
        <div id={`${placement.plan_id}.${placement.student_id}`} >
            <Card key={placement.student_id} sx={{ pointerEvents: 'auto', margin: 0 }}>
                <CardContent>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        {
                            placement.anchor &&
                            <StarFilled style={{ fontSize: '150%', color: anchor }} />
                        }
                        <Typography fontWeight={600}>{placement.student!.name}</Typography>
                    </Stack>
                    <Typography>{placement.student!.country}</Typography>
                    {showDetails &&
                        <CardContent>
                            <Typography fontWeight={600}>Time Windows</Typography>
                            {timeWindows.map(tw => <Typography>{tw.day_in_week} {format(tw.start_date_time!, "haaa")} - {format(tw.end_date_time!, "haaa")}</Typography>)}
                        </CardContent>
                    }
                </CardContent>
            </Card>
        </div>
    );
}