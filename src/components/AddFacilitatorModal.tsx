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
import { Facilitator } from "../api/types";
import { UI_STRINGS } from '../constants';

interface Props {
  facilitators: Facilitator[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facilitators: Facilitator[]) => void;
}

const AddFacilitatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  facilitators,
}) => {
  const [selecteFacilitators, setSelecteFacilitators] = useState<string[]>([]);

  function handleChange(event: SelectChangeEvent<typeof selecteFacilitators>) {
    const ids = event.target.value as unknown as string[];
    setSelecteFacilitators(ids);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // prevent form from refreshing the page
    onSubmit(facilitators.filter(f => selecteFacilitators.includes(f.id as string)));
    setSelecteFacilitators([]);
  }

  function findStudent(id: string) {
    return facilitators.find((f) => id === f.id);
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
        <DialogTitle>{UI_STRINGS.CHANGE_FACILITATOR}</DialogTitle>
        <DialogContent>
          <Stack sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                sx={{ m: 1, width: "100%" }}
                multiple
                value={selecteFacilitators}
                onChange={handleChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) =>
                  selected.map((s_id) => findStudent(s_id)!.name).join(", ")
                }
              >
                {facilitators.map((f) => (
                  <MenuItem key={f.id as string | undefined} value={f.id as string | undefined}>
                    <Checkbox
                      checked={
                        selecteFacilitators.find((s_id) => s_id === f.id) !==
                        undefined
                      }
                    />
                    <ListItemText primary={f.name} />
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

export default AddFacilitatorModal;
