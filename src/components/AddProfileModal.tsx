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
import { CEProfile } from "../api/types";
import { UI_STRINGS } from '../constants';

interface Props {
  title: string;
  profiles: CEProfile[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profiles: CEProfile[]) => void;
}

const AddProfileModal: React.FC<Props> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  profiles,
}) => {
  const [selectedProfiles, setSelecteProfiles] = useState<string[]>([]);

  function handleChange(event: SelectChangeEvent<typeof selectedProfiles>) {
    const ids = event.target.value as unknown as string[];
    setSelecteProfiles(ids);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // prevent form from refreshing the page
    onSubmit(profiles.filter(prof => selectedProfiles.includes(prof.id as string)));
    setSelecteProfiles([]);
  }

  function findFacilitator(id: string) {
    return profiles.find((prof) => id === prof.id);
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
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
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
                      checked={
                        selectedProfiles.find((s_id) => s_id === prof.id) !==
                        undefined
                      }
                    />
                    <ListItemText primary={prof.name} />
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

export default AddProfileModal;
