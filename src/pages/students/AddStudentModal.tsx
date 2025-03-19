import React, {} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { TimeWindow } from '../../api/types';
import StudentForm from './StudentForm';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  handleAddStudent: (event: any) => void;
  availabilities: TimeWindow[];
  setAvailabilities: React.Dispatch<React.SetStateAction<TimeWindow[]>>
}

const AddStudent: React.FC<Props> = ( {isAddStudentModalOpen, onClose, handleAddStudent, availabilities, setAvailabilities} ) => {

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
          <StudentForm
            availabilities={availabilities}
            setAvailabilities={setAvailabilities}
          />
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

