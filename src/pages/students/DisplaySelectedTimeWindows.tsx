import React, { useContext } from "react";
import { Stack, DialogContentText, Typography, IconButton, } from '@mui/material';
import { UI_STRINGS } from '../../constants';
import { CloseCircleOutlined } from '@ant-design/icons';
import { TimeWindowSelectionContext } from "../../components/TimeWindowSelectionContext";


const DisplaySelectedTimeWindows: React.FC = () => {
  const { selection, setSelection } = useContext(TimeWindowSelectionContext);

  const handleDeleteSelection = (timeSlot: string) => {
    const remainingSelections = selection.filter((val) => val !== timeSlot);
    setSelection(remainingSelections);
  };

  return (
    <Stack spacing={1} mt={1}>
      <DialogContentText>{UI_STRINGS.CURRENT_TIME_SLOT_SELECTIONS}</DialogContentText>
      {!selection.length && <Typography>{UI_STRINGS.NONE}</Typography>}
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