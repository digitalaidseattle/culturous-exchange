import { Box, Stack, Button, MenuItem, Select, FormControl, InputLabel, DialogContentText } from '@mui/material';
import { Student, TimeWindow } from '../../api/types';
import { useContext, useState } from 'react';
import { StudentContext } from '.';
import StudentInfo from './StudentInfo';
import DisplaySelectedTimeWindows from './DisplaySelectedTimeWindows';

interface Props {
  availabilities: TimeWindow[];
  setAvailabilities: React.Dispatch<React.SetStateAction<TimeWindow[]>>
}

const StudentForm: React.FC<Props> = ( { availabilities, setAvailabilities } ) => {
  const { setStudent } = useContext(StudentContext);

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

  return (
    <Box>
      <StudentInfo
        handleFieldChange={handleFieldChange}
      />
      <DisplaySelectedTimeWindows
        availabilities={availabilities}
        setAvailabilities={setAvailabilities}
      />
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