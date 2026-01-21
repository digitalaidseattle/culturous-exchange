import { TimeWindow } from "../api/types";
import { UI_STRINGS } from '../constants';
import { Typography, Box } from "@mui/material";
import { toZonedTime, format } from "date-fns-tz";
import { useContext, useEffect, useState } from "react";
import { ShowLocalTimeContext } from "./ShowLocalTimeContext";

interface Props {
  timeWindows: Partial<TimeWindow>[],
  timezone: string
}

const DisplayTimeWindow: React.FC<Props> = ({ timeWindows, timezone }) => {

  const [timeWindowList, setTimeWindowList] = useState<React.ReactNode[]>([]);
  const { showLocalTime } = useContext(ShowLocalTimeContext);

  useEffect(() => {
    setTimeWindowList(timeWindows.map((tw, index) => {
      const startString = showLocalTime
        ? format(tw.start_date_time!, "hh:mm a z")
        : format(
          toZonedTime(tw.start_date_time!, timezone),
          "hh:mm a z",
          { timeZone: timezone });
      const endString = showLocalTime
        ? format(tw.end_date_time!, "hh:mm a z")
        : format(
          toZonedTime(tw.end_date_time!, timezone),
          "hh:mm a z",
          { timeZone: timezone })
      return (
        <Typography key={index} variant='body2'>
          {format(tw.start_date_time!, "EEE")}: {startString} - {endString}
        </Typography>
      )
    }));
  }, [timeWindows, timezone, showLocalTime]);

  return (
    <Box py={2}>
      {timeWindows.length ? (
        <Box
          sx={{
            maxHeight: '100%',
            overflowY: 'auto',
            py: 1,
            width: '100%',
          }}
        >
          {timeWindowList}
        </Box>
      ) : (
        <Typography variant='body2'>
          {UI_STRINGS.NOT_ASSIGNED}
        </Typography>
      )}
    </Box>
  );
}

export default DisplayTimeWindow;