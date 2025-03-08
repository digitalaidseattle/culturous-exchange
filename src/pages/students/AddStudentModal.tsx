import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Box, IconButton, Typography, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, DialogContentText } from '@mui/material';
import { SelectAvailability, StudentField } from '../../api/types';
import { CloseCircleOutlined } from '@ant-design/icons';
import { validateAge, validateEmail, validateName } from '../../utils/formValidation';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  handleAddStudent: (event: any) => void;
  studentField: StudentField[];
  availabilities: SelectAvailability[];
  setAvailabilities: React.Dispatch<React.SetStateAction<SelectAvailability[]>>
}

const AddStudent: React.FC<Props> = ( {isAddStudentModalOpen, onClose, handleAddStudent, studentField, availabilities, setAvailabilities} ) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dirtyFields, setDirtyFields] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});


  const handleFieldChange = (event: any) => {
    const { name, value } = event.target;

    setDirtyFields((prev) => ( {...prev, [name]: true } ));

    let errorMessage: string | null = null;

    if (name === 'name') errorMessage = validateName(errorMessage, value, 2, 25);
    if (name === 'age') errorMessage = validateAge(errorMessage, value, 5, 100);
    if (name === 'email') errorMessage = validateEmail(errorMessage, value);

    setErrors((prev) => ( {...prev, [name]: errorMessage } ))
  }

  const days = ['Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning', start: '07:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '17:00' },
    { label: 'Evening', start: '17:00', end: '22:00' }
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

  const handleClose = () => {
    setErrors({});
    setDirtyFields({});
    onClose();
  }

  useEffect(() => {
    //call for timezone data
  })

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
          {studentField.map(({key, label, type, required}, idx ) => (
            <Box key={idx}>
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
                onChange={handleFieldChange}
                error={!!errors[key] && dirtyFields[key]}
              />
              {errors[key] && dirtyFields[key] && (
                <Typography>{`${errors[key]}`}</Typography>
              )}
            </Box>

          ))}
          <Stack spacing={1} mt={1}>
            <DialogContentText>Current Availabilities</DialogContentText>
            {!availabilities.length && (
              <Typography>none</Typography>
            )}
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
          <Button onClick={handleClose}>Cancel</Button>
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

