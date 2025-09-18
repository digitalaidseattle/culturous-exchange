import React, {} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import StudentForm from './StudentForm';

interface Props {
  isAddStudentModalOpen: boolean;
  onClose: () => void;
  handleAddStudent: (event: any) => void;
}

const AddStudent: React.FC<Props> = ({ isAddStudentModalOpen, onClose, handleAddStudent }) => {
  const onSubmit = (event: any) => {
    const form = event.currentTarget as HTMLFormElement;

    Array.from(form.elements).forEach((el: any) => {
      if (el && typeof el.setCustomValidity === 'function') el.setCustomValidity('');
    });

    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    if (nameInput) {
      const v = (nameInput.value || '').trim();
      if (v.length < 4) nameInput.setCustomValidity('Name must be at least 4 characters');
    }

    const genderRadios = form.querySelectorAll<HTMLInputElement>('input[name="gender"]');
    if (genderRadios.length && !Array.from(genderRadios).some(r => r.checked)) {
      genderRadios[0].setCustomValidity('Please select a gender');
    }

    ['email', 'age', 'city', 'country'].forEach((n) => {
      const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${n}"]`);
      if (el && typeof (el as any).value !== 'undefined') {
        const val = String((el as any).value ?? '').trim();
        if (!val) (el as any).setCustomValidity('This field is required');
      }
    });

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    handleAddStudent(event);
  };

  return (
    <React.Fragment>
      <Dialog
        open={isAddStudentModalOpen}
        onClose={onClose}
        PaperProps={{
          sx: { width: '40rem', maxWidth: '90vw' },
          component: 'form',
          noValidate: true,
          onSubmit
        }}
      >
        <DialogTitle>New Student Details</DialogTitle>
        <DialogContent>
          <StudentForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default AddStudent;
