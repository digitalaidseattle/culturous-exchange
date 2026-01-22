import {
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  ListItemText,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { MockFilitatorService } from '../api/ceFacilitatorService';
import { FacilitatorValidationService } from '../api/spreadsheetValidationService';
import { Cohort, Facilitator, TimeWindow, ValidationError } from '../api/types';
import { TIME_SLOTS, TimeSlot, UI_STRINGS } from '../constants';
import { CETextInput } from './CETextInput';


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

// const service = CEFacilitatorService.getInstance();
const service = new MockFilitatorService();
const validationService = FacilitatorValidationService.getInstance();

interface Props {
  facilitator: Facilitator;
  onChange: (facilitator: Facilitator, validationErrors: ValidationError[]) => void;
}

const FacilitatorForm: React.FC<Props> = ({ facilitator, onChange }) => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [updated, setUpdated] = useState<Facilitator>(facilitator);

  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    setUpdated(facilitator)
  }, [facilitator]);

  useEffect(() => {
    service.getCohorts(updated)
      .then(ccs => setCohorts(ccs))
  }, [updated]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const next = { ...updated, [name]: value };
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
        const tw = facilitator.timeWindows!.find(tw => isTimeWindowEqual(tw, ts));
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

export default FacilitatorForm;