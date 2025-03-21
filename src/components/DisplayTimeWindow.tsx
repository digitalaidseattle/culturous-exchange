import { TimeWindow } from "../api/types";
import { Typography, Box } from "@mui/material";

interface Props {
  timeWindows: TimeWindow[]
}

const DisplayTimeWindow: React.FC<Props> = ( { timeWindows } ) => {

  const timeWindowList = timeWindows.map((tw, index) => (
    <Typography key={index} variant='body2'>
      {tw.day_in_week}: {tw.start_t} - {tw.end_t}
    </Typography>
  ));

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
          not assigned
        </Typography>
      )}
    </Box>
  );
}

export default DisplayTimeWindow;