import { TimeWindow } from "../api/types";


/**
 *  TimeSlots.tsx
 *
 *  @copyright 20245Digital Aid Seattle
 *
 */

import { Box, Stack } from '@mui/material';

const PREF_TIMES = ['Fr', 'Fr', 'Fr', 'Sa', 'Sa', 'Sa', 'Su', 'Su', 'Su'] // Morning, Afternoon, Evening x Friday, Saturday, Sunday

function calculatePreferences(timeWindows: TimeWindow[]): boolean[] {
    const prefs = Array(9).fill(false)
    timeWindows.forEach(tw => {
        const hourIndex = tw.start_t === '07:00:00' ? 0 : tw.start_t === '12:00:00' ? 1 : tw.start_t === '17:00:00' ? 2 : -1; // Morning, Afternoon, Evening,
        const dayIndex = tw.day_in_week === 'Friday' ? 0 : tw.day_in_week === 'Saturday' ? 1 : 2; // Friday, Saturday, Sunday
        const index = 3 * dayIndex + hourIndex;
        prefs[index] = true;
    });
    return prefs;
}

interface Props {
    key?: string,
    timeWindows: TimeWindow[]
}

export const TimeSlots: React.FC<Props> = ({ key, timeWindows }) => {
    const prefs = calculatePreferences(timeWindows);
    return <Stack key={key ?? ''} direction={'row'} sx={{alignItems: 'center'}}>
        {prefs.map((p, i) => <Box
            key={i}
            sx={{
                backgroundColor: p ? 'lightgreen' : 'white',
                height: 20,
                width: 20,
                border: 1
            }}>{PREF_TIMES[i]}</Box>)}
    </Stack>
}  