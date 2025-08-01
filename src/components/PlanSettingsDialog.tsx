
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Slider,
  Stack,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import { Plan } from "../api/types";

interface Props {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: Plan) => void;
}

const PlanSettingsDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  plan,
}) => {

  const [updatedPlan, setUpdatedPlan] = useState<Plan>({ ...plan });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // prevent form from refreshing the page
    onSubmit(updatedPlan);
  }

  function handleChange(_event: Event, newValue: number | number[]): void {
    setUpdatedPlan({
      ...updatedPlan,
      group_size: newValue as number
    });
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
        <DialogTitle><Typography variant="h2">Settings</Typography></DialogTitle>
        <DialogContent>
          <Stack sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Stack direction={'row'} padding={5} spacing={5}>
                <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
                  Group Size:
                </Typography>
                <Box sx={{ width: 400 }}>
                  <Slider
                    aria-label="Group size"
                    value={updatedPlan.group_size ?? 10}
                    step={1}
                    min={5}
                    max={15}
                    valueLabelDisplay="on"
                    marks={true}
                    onChange={handleChange}
                  />
                </Box>
              </Stack>
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
};

export default PlanSettingsDialog;
