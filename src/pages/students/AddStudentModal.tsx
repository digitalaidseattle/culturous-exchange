import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Box, IconButton, Typography, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, DialogContentText } from '@mui/material';
import { StudentField, TimeWindow } from '../../api/types';
import { CloseCircleOutlined } from '@ant-design/icons';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  handleAddStudent: (event: any) => void;
  studentField: StudentField[];
  availabilities: TimeWindow[];
  setAvailabilities: React.Dispatch<React.SetStateAction<TimeWindow[]>>
}

const AddStudent: React.FC<Props> = ( {isAddStudentModalOpen, onClose, handleAddStudent, studentField, availabilities, setAvailabilities} ) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const days = ['Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning', start: '07:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '17:00' },
    { label: 'Evening', start: '17:00', end: '22:00' }
  ];

  const handleAddAvailability = () => {
    if (!selectedDay || !selectedTime) return;
    const timeSlot = timeSlots.find(slot => slot.label === selectedTime);

    //FIX ME -- id, student_id, group_id temp vals. Use partial type or create other for the form
    if (!timeSlot) return
    const newAvailability: TimeWindow = {
      id: 0,
      student_id: null,
      group_id: null,
      day_in_week: selectedDay,
      start_t: timeSlot.start,
      end_t: timeSlot.end
    }
    setAvailabilities([...availabilities, newAvailability]);
    setSelectedDay('');
    setSelectedTime('');
  }
  const handleDeleteAvailability = (day: string, start: string, end: string) => {
    const remainingAvailabilities = availabilities.filter((val) => (
      !(val.day_in_week === day && val.start_t === start && val.end_t === end)
    ))
    setAvailabilities(remainingAvailabilities)
  }

  return (
    <React.Fragment>
      <Dialog
        open={isAddStudentModalOpen}
        onClose={onClose}
        PaperProps={{
          sx: { width: '40rem', maxWidth: '90vw' },
          component: 'form',
          onSubmit: handleAddStudent,
        }}
      >
        <DialogTitle>New Student Details</DialogTitle>
        <DialogContent>
          {studentField.map(( {key, label, type, required} ) => (
            <TextField
              autoFocus
              required={required}
              key={key}
              margin="dense"
              id={key}
              name={key}
              label={label}
              type={type}
              fullWidth
              variant="standard"
            />
          ))}
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
          <Box my={4}>
          <DialogContentText>
            Select Availabilities
          </DialogContentText>
            <Stack direction='row' my={2} spacing={2}>
                <FormControl>
                  <InputLabel shrink>Day</InputLabel>
                  <Select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {days.map((day: string, idx: number) => (
                      <MenuItem key={idx} value={day}>{day}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{minWidth: '5rem'}}>
                  <InputLabel shrink>Time Slot</InputLabel>
                  <Select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {timeSlots.map((timeSlot: {label: string, start: string, end: string}, idx: number) => (
                      <MenuItem key={idx} value={timeSlot.label}>{timeSlot.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              <Button
                onClick={handleAddAvailability}
                variant="outlined"
                color='primary'
                size='small'
                disabled={!selectedDay || ! selectedTime}
                >
                Add Availability
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default AddStudent;

