/**
 *  StudentForm.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Facilitator, TimeSlot, TimeWindow, ValidationError } from '../../api/types';
import { CETextInput } from '../../components/CETextInput';
import { UI_STRINGS } from '../../constants';
import { FacilitatorValidationService } from '../../services/ValidationService';
import { CETimeSlotService, TIME_SLOTS } from '../../api/ceTimeSlotService';

interface Props {
  facilitator: Facilitator;
  fieldErrors: ValidationError[],
  onChange: (facilitator: Facilitator, validationErrors: ValidationError[]) => void;
}

const FacilitatorForm: React.FC<Props> = ({ facilitator, fieldErrors, onChange }) => {
  const validationService = FacilitatorValidationService.getInstance();
  const timeSlotService = CETimeSlotService.getInstance();

  const [updated, setUpdated] = useState<Facilitator>(facilitator);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const zones = Intl.supportedValuesOf("timeZone");
  // const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setUpdated(facilitator);
  }, [facilitator]);

  useEffect(() => {
    setErrors(fieldErrors);
  }, [fieldErrors]);

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const next = { ...updated, [name]: checked };
    setUpdated(next);
    onChange(next, []);  // no validation needed for a switch
  }

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const next = { ...updated, [name]: value };
    setUpdated(next);

    const validationErrors = updateValidationErrors(next, name);
    onChange(next, validationErrors);
  }

  const handleTimezoneChange = (_event: any, newValue: string | null) => {
    const next = { ...updated, time_zone: newValue ?? "" };
    setUpdated(next);

    const validationErrors = updateValidationErrors(next, 'time_zone');
    onChange(next, validationErrors);
  }

  const handleTimeSlotChange = (event: any) => {
    const newTimeWindows = event.target.value
      .map((tsLabel: string) => {
        const ts = TIME_SLOTS.find(test => test.label === tsLabel)!;
        const tw = (facilitator.timeWindows ?? []).find(tw => timeSlotService.isTimeWindowEqual(tw, ts));
        if (tw) {
          return tw;
        } else {
          return {
            id: uuid(),
            facilitator_id: updated.id,
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

  const updateValidationErrors = (facilitator: Facilitator, field?: string): ValidationError[] => {
    const error = validationService.validate(facilitator, field);
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

      <FormControl fullWidth >
        <FormLabel id="active-label" required>{UI_STRINGS.ACTIVE}</FormLabel>
        <Switch
          name="active"
          checked={updated.active}
          onChange={handleActiveChange}
          slotProps={{ input: { 'aria-label': 'controlled' } }}
        />

      </FormControl>

      <FormControl fullWidth error={hasFieldError('time_zone')}>
        <FormLabel id="time-zones-label" required>{UI_STRINGS.TIME_ZONES}</FormLabel>
        <Autocomplete
          id="time-zones-autocomplete"
          disablePortal
          options={zones}
          fullWidth
          value={updated.time_zone || ''}
          renderInput={(params) => <TextField {...params} variant="standard" />}
          onChange={handleTimezoneChange}
          sx={{ marginTop: 1 }}
        />
        <FormHelperText>{getFieldError('time_zone') || ' '}</FormHelperText>
      </FormControl>

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
    </Box>
  )
}

export default FacilitatorForm;