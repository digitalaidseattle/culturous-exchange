/**
 *  StudentForm.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  ListItemText,
  MenuItem,
  Select
} from '@mui/material';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Facilitator, TimeWindow, ValidationError } from '../../api/types';
import { CETextInput } from '../../components/CETextInput';
import { TIME_SLOTS, TimeSlot, UI_STRINGS } from '../../constants';
import { FacilitatorValidationService } from '../../api/ValidationService';

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

interface Props {
  facilitator: Facilitator;
  onChange: (facilitator: Facilitator, validationErrors: ValidationError[]) => void;
}

const FacilitatorForm: React.FC<Props> = ({ facilitator, onChange }) => {
  const validationService = new FacilitatorValidationService();
  const [updated, setUpdated] = useState<Facilitator>(facilitator);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const zones = Intl.supportedValuesOf("timeZone");
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setUpdated(facilitator)
  }, [facilitator]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const next = { ...updated, [name]: value };
    setUpdated(next);

    const validationErrors = updateValidationErrors(next);
    onChange(next, validationErrors);
  }

  const handleTimezoneChange = (event: any) => {
    const next = { ...updated, time_zone: event.target.value };
    setUpdated(next);

    const validationErrors = updateValidationErrors(next);
    onChange(next, validationErrors);
  }

  const updateValidationErrors = (facilitator: Facilitator): ValidationError[] => {
    const allErrors = validationService.validate(facilitator);
    setErrors(allErrors);
    return allErrors;
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

  const handleTimeSlotChange = (event: any) => {
    const newTimeWindows = event.target.value
      .map((tsLabel: string) => {
        const ts = TIME_SLOTS.find(test => test.label === tsLabel)!;
        const tw = (facilitator.timeWindows ?? []).find(tw => isTimeWindowEqual(tw, ts));
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

    const validationErrors = updateValidationErrors(next);
    onChange(next, validationErrors);
  }

  function isChecked(ts: TimeSlot): boolean {
    return (updated.timeWindows ?? []).some(tw => isTimeWindowEqual(tw, ts));
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

      <FormControl fullWidth error={hasFieldError('time_zone')}>
        <FormLabel id="time-zones-label" required>{UI_STRINGS.TIME_ZONES}</FormLabel>
        <Select
          labelId="time-zones-label"
          id="time-zones-select"
          name='time_zone'
          value={updated.time_zone || userTimezone}
          onChange={handleTimezoneChange}
          input={<Input />}
        >
          {zones.map((tz) => (
            <MenuItem key={tz} value={tz}>{tz}</MenuItem>
          ))}
        </Select>
        <FormHelperText>{getFieldError('time_zone') || ' '}</FormHelperText>
      </FormControl>

      <FormControl fullWidth error={hasFieldError('timeWindows')}>
        <FormLabel id="time-window-label" required>{UI_STRINGS.TIME_SLOTS}</FormLabel>
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
        <FormHelperText>{getFieldError('timeWindows') || ' '}</FormHelperText>
      </FormControl>
    </Box>
  )
}

export default FacilitatorForm;