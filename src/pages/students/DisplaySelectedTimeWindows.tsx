import React, { useContext } from "react";
import { Stack, DialogContentText, Typography, IconButton, } from '@mui/material';
import { CloseCircleOutlined } from '@ant-design/icons';
import { TimeWindowSelectionContext } from ".";


const DisplaySelectedTimeWindows: React.FC = () => {
  const { selection, setSelection } = useContext(TimeWindowSelectionContext);

  const handleDeleteSelection = (timeSlot: string) => {
    const remainingSelections = selection.filter((val) => val !== timeSlot);
    setSelection(remainingSelections);
  };

  return (
    <Stack spacing={1} mt={1}>
      <DialogContentText>Current Time Slot Selections</DialogContentText>
      {!selection.length && <Typography>none</Typography>}
      {selection.map((timeSlot, idx) => (
        <Stack key={idx} direction="row" justifyContent="space-between">
          <Typography>{timeSlot}</Typography>
          <IconButton size="small" onClick={() => handleDeleteSelection(timeSlot)}>
            <CloseCircleOutlined />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
};

export default DisplaySelectedTimeWindows;