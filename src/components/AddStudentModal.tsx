import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CEProfile, Student, ValidationError } from "../api/types";
import { UI_STRINGS } from '../constants';
import StudentForm from "./StudentForm";
import { CEStudentService } from "../services/student/CEStudentService";


const AddForm: React.FC<{
  profiles: CEProfile[],
  onChange: (selected: string[]) => void
}> = ({ profiles, onChange }) => {

  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  function handleChange(event: SelectChangeEvent<typeof selectedProfiles>) {
    const ids = event.target.value as unknown as string[];
    setSelectedProfiles(ids);
    onChange(ids);
  }

  function findFacilitator(id: string) {
    return profiles.find((prof) => id === prof.id);
  }

  return (
    <FormControl id='select' sx={{ m: 1, width: '100%' }} >
      <Select
        sx={{ m: 1, width: "100%" }}
        multiple
        value={selectedProfiles}
        onChange={handleChange}
        input={<OutlinedInput label="Tag" />}
        renderValue={(selected) =>
          selected.map((s_id) => findFacilitator(s_id)!.name).join(", ")
        }
      >
        {profiles.map((prof) => (
          <MenuItem key={prof.id as string | undefined} value={prof.id as string | undefined}>
            <Checkbox
              checked={selectedProfiles.find((s_id) => s_id === prof.id) !== undefined}
            />
            <ListItemText primary={prof.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl >
  )
}

interface Props {
  title: string;
  profiles: CEProfile[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profiles: CEProfile[]) => void;
}

export const AddStudentModal: React.FC<Props> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  profiles,
}) => {
  const [mode, setMode] = useState<string>('select');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

  const [newStudent, setNewStudent] = useState<Student>(CEStudentService.getInstance().empty());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  function updateStudent(student: Student, validationErrors: ValidationError[]): void {
    setNewStudent(student);
    setValidationErrors(validationErrors);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // prevent form from refreshing the page
    const toAdd = mode === 'select'
      ? profiles.filter(prof => selectedProfiles.includes(prof.id as string))
      : [await CEStudentService.getInstance().save(newStudent)]
    onSubmit(toAdd);
    setSelectedProfiles([]);
  }


  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth={true}
        maxWidth={'lg'}
      >
        <DialogTitle><Typography fontWeight={600}>{title}</Typography></DialogTitle>
        <DialogContent>
          <Stack sx={{ display: "flex", flexWrap: "wrap" }}>
            <Stack direction={'row'} alignItems={'center'}>
              <Radio value="select" checked={mode === 'select'} onChange={() => setMode('select')} />
              <Typography>Add students not assigned to a cohort</Typography>
            </Stack>
            <Collapse in={mode === 'select'} timeout="auto" unmountOnExit>
              <AddForm profiles={profiles} onChange={ids => setSelectedProfiles(ids)} />
            </Collapse>
            <Divider>Or</Divider>
            <Stack direction={'row'} alignItems={'center'}>
              <Radio value="add" checked={mode === 'add'} onChange={() => setMode('add')} />
              <Typography>Add a student to the cohort</Typography>
            </Stack>
          </Stack>
          <Collapse in={mode === 'add'} timeout="auto" unmountOnExit>
            <Box sx={{ m: 2 }}>
              <StudentForm
                student={newStudent}
                fieldErrors={validationErrors}
                showCohort={false}
                onChange={updateStudent} />
            </Box>
          </Collapse>
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
    </React.Fragment >
  );
};

