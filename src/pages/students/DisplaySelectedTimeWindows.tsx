import React from "react";
import { TimeWindow } from "../../api/types";
import { Stack, DialogContentText, Typography, IconButton, } from '@mui/material';
import { CloseCircleOutlined } from '@ant-design/icons';


interface Props {
  availabilities: TimeWindow[];
  setAvailabilities: React.Dispatch<React.SetStateAction<TimeWindow[]>>
}

const DisplaySelectedTimeWindows: React.FC<Props> = ( {availabilities, setAvailabilities} ) => {

  const handleDeleteAvailability = (day: string, start: string, end: string) => {
    const remainingAvailabilities = availabilities.filter((val) => (
      !(val.day_in_week === day && val.start_t === start && val.end_t === end)
    ))
    setAvailabilities(remainingAvailabilities)
  }
  return (
    <Stack spacing={1} mt={1}>
        <DialogContentText>Current Availabilities</DialogContentText>
        {!availabilities.length && (
          <Typography>none</Typography>
        )}
        {availabilities.map((avilability, idx) => (
          <Stack key={idx} direction='row' justifyContent='space-between'>
            <Typography>{avilability.day_in_week}</Typography>
            <Typography>{`${avilability.start_t} - ${avilability.end_t}`}</Typography>
            <IconButton
              size="small"
              onClick={() => handleDeleteAvailability(avilability.day_in_week, avilability.start_t, avilability.end_t)}>
                <CloseCircleOutlined />
            </IconButton>
          </Stack>
        ))}
      </Stack>
  )
};

export default DisplaySelectedTimeWindows;