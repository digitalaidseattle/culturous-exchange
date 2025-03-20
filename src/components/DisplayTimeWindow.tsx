import { TimeWindow } from "../api/types";
import { Typography, Tooltip, Box } from "@mui/material";

interface Props {
  timeWindows: TimeWindow[]
}

const DisplayTimeWindow: React.FC<Props> = ( { timeWindows } ) => {

  return (
    <Box>
      <Tooltip
        title={
          <Box>
            {timeWindows.map((tw) => (
              <Typography key={tw.id}>
                {tw.day_in_week}: {tw.start_t} - {tw.end_t}
              </Typography>
            ))}
          </Box>
        }
        placement="top-start"
      >
        <Box sx={{ "&:hover": { cursor: "pointer" } }}>
          <Typography>{`${timeWindows.length} Availability(s)`}</Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}

export default DisplayTimeWindow;