/**
 *  StudentForm.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { StarFilled } from '@ant-design/icons';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Input,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { CEStudentDao } from '../../api/ceStudentDao';
import { CETimeSlotService, TIME_SLOTS } from '../../api/ceTimeSlotService';
import { Cohort, Student, TimeSlot, TimeWindow, ValidationError } from '../../api/types';
import { StudentValidationService } from '../../api/ValidationService';
import { CETextInput } from '../../components/CETextInput';
import { GENDER_OPTION, UI_STRINGS } from '../../constants';



interface Props {
  student: Student;
  fieldErrors: ValidationError[],
  onChange: (student: Student, validationErrors: ValidationError[]) => void;
}

const StudentForm: React.FC<Props> = ({ student, fieldErrors, onChange }) => {
  const studentDao = CEStudentDao.getInstance();
  const validationService = StudentValidationService.getInstance();
  const timeSlotService = CETimeSlotService.getInstance();

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [updated, setUpdated] = useState<Student>(student);

  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    setUpdated(student)
  }, [student]);

  useEffect(() => {
    setErrors(fieldErrors);
  }, [fieldErrors]);

  // Need to lookup which cohorts the student is assigned to
  useEffect(() => {
    studentDao.getCohortsForStudent(updated)
      .then(ccs => setCohorts(ccs))
  }, [updated]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const next = { ...updated, [name]: value };
    setUpdated(next);

    console.log(name)
    const validationErrors = updateValidationErrors(next, name);
    onChange(next, validationErrors);
  }

  const handleAnchorChange = async (student: Student) => {
    const next = { ...updated, anchor: !student.anchor };
    setUpdated(next);

    // no changes to fieldErrors
    onChange(next, fieldErrors);
  };

  const handleTimeSlotChange = (event: any) => {
    const newTimeWindows = event.target.value
      .map((tsLabel: string) => {
        const ts = TIME_SLOTS.find(test => test.label === tsLabel)!;
        const tw = student.timeWindows!.find(tw => timeSlotService.isTimeWindowEqual(tw, ts));
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

    const next = { ...updated, timeWindows: newTimeWindows };
    setUpdated(next);

    const validationErrors = updateValidationErrors(next, 'timeWindows');
    onChange(next, validationErrors);
  }

  const updateValidationErrors = (student: Student, field?: string): ValidationError[] => {
    const error = validationService.validate(student, field);
    if (error.length === 0) {
      return errors.filter(e => e.field !== field)
    } else {
      const removeOld = errors.filter(e => e.field !== field)
      return [...removeOld, ...error]
    }
  }

  function isChecked(ts: TimeSlot): boolean {
    return (updated.timeWindows ?? []).some(tw => timeSlotService.isTimeWindowEqual(tw, ts));
  }

  // Helper function to get error message for a specific field
  const getFieldError = (fieldName: string): string => {
    const fieldError = errors.find(err => err.field === fieldName);
    return fieldError?.message || '';
  }

  // Helper function to check if a field has an error
  const hasFieldError = (fieldName: string): boolean => {
    return Boolean(getFieldError(fieldName));
  }


  return (
    <Box gap={1.5} display="flex" flexDirection="column">
      <CETextInput
        name="name"
        value={updated.name || ''}
        label={UI_STRINGS.FULL_NAME}
        required={true}
        type="text"
        handleFieldChange={handleFieldChange}
        isError={hasFieldError('name')}
        errorText={getFieldError('name')}
      />
      <CETextInput
        name="email"
        value={updated.email || ''}
        label={UI_STRINGS.EMAIL}
        required={true}
        type="email"
        handleFieldChange={handleFieldChange}
        isError={hasFieldError('email')}
        errorText={getFieldError('email')}
      />
      <Box display="flex" gap={1} flexDirection={"row"}>
        <CETextInput
          name="city"
          value={updated.city || ''}
          label={UI_STRINGS.CITY}
          required={true}
          type="text"
          handleFieldChange={handleFieldChange}
          isError={hasFieldError('city')}
          errorText={getFieldError('city')}
        />
        <CETextInput
          name="country"
          value={updated.country || ''}
          label={UI_STRINGS.COUNTRY}
          required={true}
          type="text"
          handleFieldChange={handleFieldChange}
          isError={hasFieldError('country')}
          errorText={getFieldError('country')}
        />
      </Box>
      <Box display="flex" gap={1} flexDirection={"row"}>
        <FormControl fullWidth>
          <FormLabel required>{UI_STRINGS.ANCHOR}</FormLabel>
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
          label={UI_STRINGS.AGE}
          required={true}
          type="number"
          handleFieldChange={handleFieldChange}
          isError={hasFieldError('age')}
          errorText={getFieldError('age')}
        />
        <FormControl fullWidth>
          <FormLabel id="gender-group" required>{UI_STRINGS.GENDER}</FormLabel>
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
      <FormControl fullWidth error={hasFieldError('timeWindows')}>
        <FormLabel id="time-window-label" required>{UI_STRINGS.TIME_SLOTS}</FormLabel>
        <Select
          labelId="time-window-label"
          id="time-window-checkbox"
          name='timeWindows'
          multiple
          value={updated.timeWindows ? updated.timeWindows.map(tw => timeSlotService.findTimeSlot(tw)?.label) : []}
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
        <FormHelperText>{getFieldError('timeWindows') || ' '}</FormHelperText>
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="cohort-display">{UI_STRINGS.COHORTS}</FormLabel>
        <TextField
          id="cohort-display"
          variant="standard"
          value={cohorts && cohorts.length > 0
            ? cohorts.map((cc: Cohort) => cc.name).join(', ')
            : UI_STRINGS.NOT_ASSIGNED_COHORT
          }
          disabled={true}
        />
      </FormControl>
    </Box>
  )
}

export default StudentForm;