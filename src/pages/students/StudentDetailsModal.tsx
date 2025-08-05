/**
 *  StudentsDetailsModal.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import * as React from 'react';

import { InputForm, InputOption } from '@digitalaidseattle/mui';
import { Cohort, Student, TimeWindow } from '../../api/types';
import BootstrapDialog from '../../utils/styles';
import { studentService } from '../../api/ceStudentService';

interface Props {
  student: Student;
  isModalOpen: boolean
  onClose: () => void
}

const StudentDetailsModal: React.FC<Props> = ({ student, isModalOpen, onClose }) => {
  const dialogTitle = student.name;
  const [cohorts, setCohorts] = React.useState<Cohort[]>([]);

  React.useEffect(() => {
    studentService.getCohortsForStudent(student)
      .then(ccs => setCohorts(ccs))
  }, [student]);


  const fields: InputOption[] = [
    {
      name: "name",
      label: 'Name',
      type: 'string',
      disabled: true,
    },
    {
      name: "age",
      label: 'Age',
      type: 'number',
      disabled: true,
    },
    {
      name: "gender",
      label: 'Gender',
      type: 'string',
      disabled: true,
    },
    {
      name: "city",
      label: 'City',
      type: 'string',
      disabled: true,
    },
    {
      name: "country",
      label: 'Country',
      type: 'string',
      disabled: true,
    },
    {
      name: "email",
      label: 'Email',
      type: 'string',
      disabled: true,
    },
    {
      name: "timeWindows",
      label: 'Availabilities',
      type: 'custom',
      disabled: true,
      inputRenderer(idx, option, value) {
        return (
          <FormControl
            key={idx}
            fullWidth
            variant='outlined'
            disabled={option.disabled}>
            <InputLabel htmlFor="time-windows-display">Availability (Entered)</InputLabel>
            <OutlinedInput
              id="time-windows-display"
              label="Availability (Entered)"
              value={value && value.length > 0
                ? value.map((tw: TimeWindow) => (
                  `${tw.day_in_week} ${tw.start_t} - ${tw.end_t} ${student.time_zone}`
                )).join('\n')
                : "No availabilities set"
              }
              multiline={true}
              rows={value.length + 1}
            ></OutlinedInput>
          </FormControl>
        );
      }
    },
    {
      name: "cohorts",
      label: 'Cohorts',
      type: 'custom',
      disabled: true,
      inputRenderer(idx, option, value) {
        return (
          <FormControl
            key={idx}
            fullWidth
            variant='outlined'
            disabled={option.disabled}>
            <InputLabel htmlFor="time-windows-display">Cohorts</InputLabel>
            <OutlinedInput
              id="time-windows-display"
              label="Cohorts"
              value={cohorts && cohorts.length > 0
                ? cohorts.map((cc: Cohort) => cc.name).join(', ')
                : "No availabilities set"
              }
            ></OutlinedInput>
          </FormControl>
        );
      }
    },

  ]

  return (
    <BootstrapDialog
      fullWidth={true}
      open={isModalOpen}
      onClose={() => onClose()}>
      <DialogContent>
        <Stack gap={2}>
          <Typography variant='h4'>{dialogTitle}</Typography>
          <InputForm
            entity={student}
            inputFields={fields}
            onChange={() => { }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          sx={{ color: 'text.success' }}
          onClick={() => onClose()} >
          OK
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default StudentDetailsModal;