import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, Stack } from '@mui/material';
import React, { useState } from 'react';
import { Student } from '../api/types';

interface Props {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentIds: string[]) => void;
}

const AddStudentModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, students }) => {
  const [seletedStudents, setSeletedStudents] = useState<string[]>([]);

  function handleChange(event: SelectChangeEvent<typeof seletedStudents>) {
    const ids = event.target.value as unknown as string[];
    setSeletedStudents(ids);
  }

  function handleSubmit() {
    onSubmit(seletedStudents)
  }

  function findStudent(id: string) {
    return students.find(student => id === student.id)
  }

  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: { width: '40rem', maxWidth: '90vw' },
        }}
      >
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Stack sx={{ display: 'flex', flexWrap: 'wrap' }}>

            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                sx={{ m: 1, width: '100%' }}
                multiple
                value={seletedStudents}
                onChange={handleChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.map(s_id => findStudent(s_id)!.name).join(', ')}
              >
                {students.map(student => (
                  <MenuItem key={student.id} value={student.id}>
                    <Checkbox checked={seletedStudents.find(s_id => s_id === student.id) !== undefined} />
                    <ListItemText primary={student.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default AddStudentModal;

