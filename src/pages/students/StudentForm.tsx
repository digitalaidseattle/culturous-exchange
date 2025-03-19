import TextField from '@mui/material/TextField';
import { Box, IconButton, Typography, Stack, Button, MenuItem, Select, FormControl, InputLabel, DialogContentText } from '@mui/material';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Student, StudentField, TimeWindow } from '../../api/types';
import { useContext, useState } from 'react';
import { StudentContext } from '.';

const studentField: StudentField[] = [
  { key: 'name', label: 'Full Name', type: 'string', required: true },
  { key: 'age', label: 'Age', type: 'number', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'country', label: 'Country', type: 'string', required: true },
];

interface Props {
  availabilities: TimeWindow[];
  setAvailabilities: React.Dispatch<React.SetStateAction<TimeWindow[]>>
}

const StudentForm: React.FC<Props> = ( { availabilities, setAvailabilities } ) => {
  const { student, setStudent } = useContext(StudentContext);

  console.log('student: ', student)

  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const days = ['Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning', start: '07:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '17:00' },
    { label: 'Evening', start: '17:00', end: '22:00' }
  ];

  const handleFieldChange = (event: any) => {
    const { name, value } = event.target;
    setStudent((prevStudent: Student) => ({
      ...prevStudent,
      [name]: value
    }))
  }

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
    <Box>
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
          onChange={handleFieldChange}
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

    </Box>
  )
}

export default StudentForm;