import { useEffect, useState } from 'react';
import { StarFilled } from '@ant-design/icons';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Input,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField
} from '@mui/material';
import { Cohort, Student, TimeWindow } from '../../api/types';
import { v4 as uuid } from 'uuid';
import { GENDER_OPTION, TimeSlot, TIME_SLOTS } from '../../constants';
import { studentService } from '../../api/ceStudentService';


function findTimeSlot(timeWindow: TimeWindow): TimeSlot | null {
  return TIME_SLOTS.find(slot =>
    slot.day_in_week === timeWindow.day_in_week &&
    slot.start_t === timeWindow.start_t &&
    slot.end_t === timeWindow.end_t) || null;
}

function isTimeWindowEqual(timeWindow: TimeWindow, ts: TimeSlot): boolean {
  return ts.day_in_week === timeWindow.day_in_week &&
    ts.start_t === timeWindow.start_t &&
    ts.end_t === timeWindow.end_t;
}

interface CETextInputProps {
  name: string;
  value: any;
  label: string;
  required: boolean;
  type: string;
  handleFieldChange: (event: any) => void;
}

const CETextInput: React.FC<CETextInputProps> = ({ name, value, label, required, type, handleFieldChange }) => {
  return (
    <FormControl key={name} fullWidth>
      <FormLabel id="gender-group" required>{label}</FormLabel>
      <TextField
        autoFocus
        required={required}
        margin="dense"
        id={name}
        name={name}
        type={type}
        variant="standard"
        value={value ?? ''}
        onChange={handleFieldChange}
      />
    </FormControl>);
}

interface Props {
  student: Student;
  onChange: (student: Student) => void;
}

const StudentForm: React.FC<Props> = ({ student, onChange }) => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [updated, setUpdated] = useState<Student>(student);

  useEffect(() => {
    setUpdated(student)
  }, [student]);

  useEffect(() => {
    studentService.getCohortsForStudent(updated)
      .then(ccs => setCohorts(ccs))
  }, [updated]);

  const handleFieldChange = (event: any) => {
    const { name, value } = event.target;
    onChange({
      ...updated,
      [name]: value
    })
  }

  const handleAnchorChange = async (student: Student) => {
    try {
      handleFieldChange({
        target: {
          name: 'anchor',
          value: !student.anchor
        }
      })
    } catch (error) {
      console.error('Error toggling anchor:', error);
    }
  };

  const handleTimeSlotChange = (event: any) => {
    const newTimeWindows = event.target.value
      .map((tsLabel: string) => {
        const ts = TIME_SLOTS.find(test => test.label === tsLabel)!;
        const tw = student.timeWindows!.find(tw => isTimeWindowEqual(tw, ts));
        if (tw) {
          return tw;
        } else {
          return {
            id: uuid(),
            student_id: updated.id,
            group_id: null,
            day_in_week: ts.day_in_week,
            start_t: ts.start_t,
            end_t: ts.end_t,
            start_date_time: undefined,
            end_date_time: undefined
          } as unknown as TimeWindow;
        }
      })

    handleFieldChange({
      target: {
        name: 'timeWindows',
        value: newTimeWindows
      }
    });
  }

  function isChecked(ts: TimeSlot): boolean {
    return (updated.timeWindows ?? []).some(tw => isTimeWindowEqual(tw, ts));
  }

  return (
    <Box gap={1.5} display="flex" flexDirection="column">
      <CETextInput
        name="name"
        value={updated.name || ''}
        label="Full Name"
        required={true}
        type="text"
        handleFieldChange={handleFieldChange} />
      <CETextInput
        name="email"
        value={updated.email || ''}
        label="Email"
        required={true}
        type="email"
        handleFieldChange={handleFieldChange} />
      <Box display="flex" gap={1} flexDirection={"row"}>
        <CETextInput
          name="city"
          value={updated.city || ''}
          label="City"
          required={true}
          type="text"
          handleFieldChange={handleFieldChange} />
        <CETextInput
          name="country"
          value={updated.country || ''}
          label="Country"
          required={true}
          type="text"
          handleFieldChange={handleFieldChange} />
      </Box>
      <Box display="flex" gap={1} flexDirection={"row"}>
        <FormControl fullWidth>
          <FormLabel required>Anchor</FormLabel>
          <StarFilled
            style={{
              fontSize: "150%",
              color: updated.anchor ? "green" : "gray",
            }}
            onClick={() => handleAnchorChange(updated)}
          />
        </FormControl>
        <CETextInput
          name="age"
          value={updated.age || ''}
          label="Age"
          required={true}
          type="number"
          handleFieldChange={handleFieldChange} />
        <FormControl fullWidth>
          <FormLabel id="gender-group" required>Gender</FormLabel>
          <RadioGroup
            id="gender-group"
            aria-labelledby="gender-group"
            name="gender"
            value={updated.gender ?? GENDER_OPTION[0]}
            onChange={handleFieldChange}
            row={true}
          >
            {GENDER_OPTION.map((genderOption: string, idx: number) => (
              <FormControlLabel
                key={idx}
                value={genderOption}
                control={<Radio />}
                label={genderOption}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
      <FormControl fullWidth>
        <FormLabel id="time-window-label" required>Time Slot(s)</FormLabel>
        <Select
          labelId="time-window-label"
          id="time-window-checkbox"
          name='timeWindows'
          multiple
          value={updated.timeWindows ? updated.timeWindows.map(tw => findTimeSlot(tw)?.label) : []}
          onChange={handleTimeSlotChange}
          input={<Input />}
          renderValue={(selected) =>
            selected.join(', ')
          }
        >
          {TIME_SLOTS.map((ts) => (
            <MenuItem key={ts.label} value={ts.label}>
              <Checkbox checked={isChecked(ts)} />
              <ListItemText primary={ts.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel htmlFor="cohort-display">Cohorts</FormLabel>
        <TextField
          id="cohort-display"
          variant="standard"
          value={cohorts && cohorts.length > 0
            ? cohorts.map((cc: Cohort) => cc.name).join(', ')
            : "Not assigned to any cohort"
          }
          disabled={true}
        />
      </FormControl>
    </Box>
  )
}

export default StudentForm;