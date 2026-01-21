import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Student, ValidationError } from '../api/types';
import StudentForm from '../pages/students/StudentForm';
import { UI_STRINGS } from '../constants';

interface Props {
  mode: 'add' | 'edit';
  student: Student;
  open: boolean;
  onClose: () => void;
  onChange: (updated: Student) => void;
}

const StudentModal: React.FC<Props> = ({ mode, student, open, onClose, onChange }) => {
  const [updated, setUpdated] = useState<Student>(student);
  const [hasErrors, setHasErrors] = useState(false);

  const handleStudentChange = (updatedStudent: Student, validationErrors: ValidationError[]) => {
    setUpdated(updatedStudent);
    setHasErrors(validationErrors.length > 0);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: '75vw', maxWidth: '90vw' },
        }}
      >
        <DialogTitle>{mode === 'add' ? `${UI_STRINGS.NEW} ${UI_STRINGS.DETAILS}` : `Edit ${UI_STRINGS.DETAILS}`}</DialogTitle>
        <DialogContent>
          <StudentForm
            student={updated}
            onChange={handleStudentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{UI_STRINGS.CANCEL}</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={hasErrors}
            onClick={() =>{ 
              onChange(updated)
            }}
          >
            {UI_STRINGS.SUBMIT}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default StudentModal;

