import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import { Box, IconButton, Typography, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel} from '@mui/material';
import { SelectAvailability, Student, StudentField } from '../../api/types';
import { CloseCircleOutlined } from '@ant-design/icons';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  newStudent: Student[];
  handleAddStudent: (event: any) => void;
  studentField: StudentField[];
}

const AddStudent: React.FC<Props> = ( {isAddStudentModalOpen, onClose, newStudent, handleAddStudent, studentField} ) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [availabilities, setAvailabilities] = useState<SelectAvailability[]>([])

  const days = ['Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning', start: '07:00 (PST)', end: '12:00 (PST)' },
    { label: 'Afternoon', start: '12:00 (PST)', end: '17:00 (PST)' },
    { label: 'Evening', start: '17:00 (PST)', end: '22:00 (PST)' }
  ];

  const handleAddAvailability = () => {
    if (!selectedDay || !selectedTime) return;
    const timeSlot = timeSlots.find(slot => slot.label === selectedTime);

    if (!timeSlot) return
    const newAvailability: SelectAvailability = {
      day: selectedDay,
      start: timeSlot.start,
      end: timeSlot.end
    }
    setAvailabilities([...availabilities, newAvailability]);
    setSelectedDay('');
    setSelectedTime('');
  }
  const handleDeleteAvailability = (day: string, start: string, end: string) => {
    const remainingAvailabilities = availabilities.filter((val) => (
      !(val.day === day && val.start === start && val.end === end)
    ))
    setAvailabilities(remainingAvailabilities)
  }
  console.log('selectedDay: ', selectedDay, 'selectedTime: ', selectedTime)

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
            {availabilities.map((avilability, idx) => (
              <Stack key={idx} direction='row' justifyContent='space-between'>
                <Typography>{avilability.day}</Typography>
                <Typography>{`${avilability.start} - ${avilability.end}`}</Typography>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteAvailability(avilability.day, avilability.start, avilability.end)}>
                    <CloseCircleOutlined />
                </IconButton>
              </Stack>
            ))}
          </Stack>
          <Box>
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

