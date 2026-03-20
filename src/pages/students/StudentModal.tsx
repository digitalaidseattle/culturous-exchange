import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Student, ValidationError } from '../../api/types';
import StudentForm from './StudentForm';
import { UI_STRINGS } from '../../constants';
import { StudentValidationService } from '../../services/ValidationService';

interface Props {
  mode: 'add' | 'edit';
  student: Student;
  open: boolean;
  onClose: () => void;
  onChange: (updated: Student) => void;
}

const StudentModal: React.FC<Props> = ({ mode, student, open, onClose, onChange }) => {
  const validationService = StudentValidationService.getInstance();

  const [updated, setUpdated] = useState<Student>(student);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (open) {
      setValidationErrors([]);
    }
  }, [open]);

  useEffect(() => {
    setUpdated(student);
  }, [student]);

  function handleChange(updatedStudent: Student, validationErrors: ValidationError[]) {
    setUpdated(updatedStudent);
    setValidationErrors(validationErrors);
  };

  function handleSubmit(): void {
    const errors = validationService.validate(updated);
    setValidationErrors(errors);
    if (errors.length === 0) {
      onChange(updated);
    }
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={'md'}
      >
        <DialogTitle>{mode === 'add' ? `${UI_STRINGS.NEW} ${UI_STRINGS.DETAILS}` : `${UI_STRINGS.EDIT} ${UI_STRINGS.DETAILS}`}</DialogTitle>
        <DialogContent>
          <StudentForm
            student={updated}
            fieldErrors={validationErrors}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{UI_STRINGS.CANCEL}</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={validationErrors.length > 0}
            onClick={handleSubmit}
          >
            {UI_STRINGS.SUBMIT}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default StudentModal;

