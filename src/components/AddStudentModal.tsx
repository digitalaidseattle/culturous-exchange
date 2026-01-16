import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import React, { useState } from "react";
import { Student } from "../api/types";
import { UI_STRINGS } from '../constants';

interface Props {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (students: Student[]) => void;
}

const AddStudentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  students,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  function handleChange(event: SelectChangeEvent<typeof selectedStudents>) {
    const ids = event.target.value as unknown as string[];
    setSelectedStudents(ids);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // prevent form from refreshing the page
    onSubmit(students.filter(student => selectedStudents.includes(student.id as string)));
    setSelectedStudents([]);
  }

  function findStudent(id: string) {
    return students.find((student) => id === student.id);
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
        <DialogTitle>{UI_STRINGS.ADD_STUDENT}</DialogTitle>
        <DialogContent>
          <Stack sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                sx={{ m: 1, width: "100%" }}
                multiple
                value={selectedStudents}
                onChange={handleChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) =>
                  selected.map((s_id) => findStudent(s_id)!.name).join(", ")
                }
              >
                {students.map((student) => (
                  <MenuItem key={student.id as string | undefined} value={student.id as string | undefined}>
                    <Checkbox
                      checked={
                        selectedStudents.find((s_id) => s_id === student.id) !==
                        undefined
                      }
                    />
                    <ListItemText primary={student.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{UI_STRINGS.CANCEL}</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            onClick={handleSubmit}>{UI_STRINGS.SUBMIT}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default AddStudentModal;
