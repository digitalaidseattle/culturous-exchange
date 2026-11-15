
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import { Plan } from "../api/types";
import { OPTIMIZATION_STYLES, UI_STRINGS } from '../constants';

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

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setUpdatedPlan({
      ...updatedPlan,
      [event.target.name]: event.target.value
    });
  }

  function handleOptimizationStyleChange(event: SelectChangeEvent<string>): void {
    setUpdatedPlan({
      ...updatedPlan,
      optimization_style: event.target.value
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
        <DialogTitle><Typography>{UI_STRINGS.SETTINGS}</Typography></DialogTitle>
        <DialogContent>
          <Stack sx={{ display: "flex", flexWrap: "wrap" }}>
            <TextField
              sx={{ m: 1 }}
              name="name"
              label={UI_STRINGS.NAME}
              value={updatedPlan.name ?? ''}
              onChange={handleTextChange}
            />
            <TextField
              sx={{ m: 1 }}
              name="note"
              label={UI_STRINGS.NOTES_LABEL}
              value={updatedPlan.note ?? ''}
              onChange={handleTextChange}
              multiline
              minRows={2}
            />
            {/* MUI Slider component does not have a label prop, so we use InputLabel to create a label for the slider */}
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel
                shrink
                id="group-size-label"
                sx={{ bgcolor: 'background.paper', px: 0.5 }}
              >
                {UI_STRINGS.GROUP_SIZE}
              </InputLabel>
              <Box
                sx={{
                  border: 1,
                  borderRadius: 1,
                  borderColor: (theme) =>
                    theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                  '&:hover': { borderColor: 'text.primary' },
                  px: 2.5,
                  pt: 4.5,
                  pb: 0.5,
                }}
              >
                <Slider
                  aria-labelledby="group-size-label"
                  value={updatedPlan.group_size ?? 10}
                  step={1}
                  min={5}
                  max={15}
                  valueLabelDisplay="on"
                  marks={true}
                  onChange={handleChange}
                />
              </Box>
            </FormControl>

            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="optimization-style-label">{UI_STRINGS.GENERATION_METHOD}</InputLabel>
              <Select
                labelId="optimization-style-label"
                id="optimization-style"
                label={UI_STRINGS.GENERATION_METHOD}
                value={updatedPlan.optimization_style ?? 'largest_first'}
                onChange={handleOptimizationStyleChange}
              >
                {OPTIMIZATION_STYLES.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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

export default PlanSettingsDialog;
