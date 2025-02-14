import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Student, StudentField } from '../../api/types';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  newStudent: Student[];
  handleAddStudent: (event: any) => void;
  studentField: StudentField[];
}

const AddStudent: React.FC<Props> = ( {isAddStudentModalOpen, onClose, newStudent, handleAddStudent, studentField} ) => {

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
          {studentField.map(( {key, label, type, required} ) => (
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
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
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

