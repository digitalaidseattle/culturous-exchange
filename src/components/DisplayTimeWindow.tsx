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

  // const [timeWindowList, setTimeWindowList] = useState<React.ReactNode[]>([]);
  const [timeWindowList, setTimeWindowList] = useState<string[]>([]);
  const { showLocalTime } = useContext(ShowLocalTimeContext);

  useEffect(() => {
    setTimeWindowList(timeWindows.map((tw) => {
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
      return (`${format(tw.start_date_time!, "EEE")} : ${startString} - ${endString}`)
    }));
  }, [timeWindows, timezone, showLocalTime]);

  return (
    <Box>
      {timeWindows.length ? (
        <Typography variant='body2'>
          {timeWindowList.join(', ')}
        </Typography>
      ) : (
        <Typography variant='body2'>
          {UI_STRINGS.NOT_ASSIGNED}
        </Typography>
      )}
    </Box>
  );
}

export default DisplayTimeWindow;