import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Box, IconButton, Typography, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, DialogContentText } from '@mui/material';
import { Country, SelectAvailability, StudentField, TimeZone } from '../../api/types';
import { CloseCircleOutlined } from '@ant-design/icons';
import { validateAge, validateEmail, validateGender, validateName } from '../../utils/formValidation';
import timeZoneService from '../../api/ceTimeZoneService';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  handleAddStudent: (event: any) => void;
  studentField: StudentField[];
  availabilities: SelectAvailability[];
  setAvailabilities: React.Dispatch<React.SetStateAction<SelectAvailability[]>>
  gender: string;
  setGender: React.Dispatch<React.SetStateAction<string>>
  selectedCountry: string
  setSelectedCountry: React.Dispatch<React.SetStateAction<string>>
  selectedTimeZone: string
  setSelectedTimeZone: React.Dispatch<React.SetStateAction<string>>
}

const AddStudent: React.FC<Props> = ( {isAddStudentModalOpen, onClose, handleAddStudent, studentField, availabilities, setAvailabilities, gender, setGender, selectedCountry, setSelectedCountry, selectedTimeZone, setSelectedTimeZone} ) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dirtyFields, setDirtyFields] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [availbleCountries, setAvailableCountries] = useState<Country[]>([]);
  const [availableTimeZones, setAvailableTimeZones] = useState<TimeZone[]>([]);

  const handleFieldChange = (event: any) => {
    const { name, value } = event.target;

    setDirtyFields((prev) => ( {...prev, [name]: true } ));

    let errorMessage: string | null = null;

    if (name === 'name') errorMessage = validateName(errorMessage, value, 2, 25);
    if (name === 'age') errorMessage = validateAge(errorMessage, value, 5, 100);
    if (name === 'email') errorMessage = validateEmail(errorMessage, value);
    if (name === 'gender') errorMessage = validateGender(errorMessage, value);

    setErrors((prev) => ( {...prev, [name]: errorMessage } ))
  }

  const days = ['Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning', start: '07:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '17:00' },
    { label: 'Evening', start: '17:00', end: '22:00' }
  ];

  const genderOptions = ['female', 'male', 'other']

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
    setGender('');
    setSelectedCountry('');
    setSelectedTimeZone('');
    onClose();
  }

  const handleSelectedCountry = (event: any) => {
    setAvailableTimeZones([]);
    setSelectedTimeZone('');
    //when api chosen, make handler async and await fetches
    const countryName = event.target.value;
    setSelectedCountry(countryName);
    timeZoneService.loadTimeZones();
    const countryTimeZones = timeZoneService.getTimeZoneByCountry(countryName);
    setAvailableTimeZones(countryTimeZones);
  }

  useEffect(() => {
    if (isAddStudentModalOpen) {
      timeZoneService.loadCountries()
      const countries = timeZoneService.getCountries();
      setAvailableCountries(countries)
    }
  }, [isAddStudentModalOpen])

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
              {(key === 'name' || key === 'age' || key === 'email') && (
                <Box>
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
              )}
              {(key === 'gender') && (
                <Box my={2}>
                  <FormControl required sx={{minWidth: '6rem'}}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                      name={key}
                      label={label}
                      defaultValue={gender}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      {genderOptions.map((genderOption: string, idx: number) => (
                        <MenuItem key={idx} value={genderOption}>{genderOption}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Stack direction={'row'} justifyContent='space-between' mt={1}>
                {(key === 'country') && (
                  <Box my={2}>
                    <FormControl required sx={{minWidth: '6rem'}}>
                      <InputLabel>{label}</InputLabel>
                      <Select
                      autoWidth
                      name={key}
                      label={label}
                      defaultValue={selectedCountry}
                      value={selectedCountry}
                      onChange={handleSelectedCountry}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: '10rem',
                            overflowY: 'auto',
                          },
                        },
                      }}
                      >
                        {availbleCountries.map((country: Country, idx: number) => (
                          <MenuItem key={idx} value={country.country}>{country.country}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
                {(key === 'timeZone') && (
                  <Box my={2}>
                    <FormControl required sx={{minWidth: '7rem'}}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                    autoWidth
                    name={key}
                    label={label}
                    value={selectedTimeZone}
                    onChange={(e) => setSelectedTimeZone(e.target.value)}
                    disabled={!selectedCountry}
                    >
                      {availableTimeZones?.map((timeZone: TimeZone, idx: number) => (
                        <MenuItem key={idx} value={timeZone.timeZoneId}>{timeZone.timeZoneId}</MenuItem>
                      ))}
                    </Select>
                    </FormControl>
                  </Box>
                )}
              </Stack>
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
                    autoWidth
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
                    autoWidth
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

