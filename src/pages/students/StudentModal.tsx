import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import StudentForm from './StudentForm';
import { Student, ValidationError } from '../../api/types';

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
        <DialogTitle>{`${mode === 'add' ? 'New' : 'Edit'} Details`}</DialogTitle>
        <DialogContent>
          <StudentForm
            student={updated}
            onChange={handleStudentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={hasErrors}
            onClick={() =>{ 
              onChange(updated)
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default StudentModal;

