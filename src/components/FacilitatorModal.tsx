import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useState } from 'react';
import { Facilitator, ValidationError } from '../api/types';
import { UI_STRINGS } from '../constants';
import FacilitatorForm from './FacilitatorForm';

interface Props {
  mode: 'add' | 'edit';
  facilitator: Facilitator;
  open: boolean;
  onClose: () => void;
  onChange: (updated: Facilitator) => void;
}
const FacilitatorModal: React.FC<Props> = ({ mode, facilitator, open, onClose, onChange }) => {
  const [updated, setUpdated] = useState<Facilitator>(facilitator);
  const [hasErrors, setHasErrors] = useState(false);

  const handleChange = (updatedEntity: Facilitator, validationErrors: ValidationError[]) => {
    setUpdated(updatedEntity);
    setHasErrors(validationErrors.length > 0);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: '75vw', maxWidth: '90vw' },
        }}
      >
        <DialogTitle>{mode === 'add' ? `${UI_STRINGS.NEW} ${UI_STRINGS.DETAILS}` : `Edit ${UI_STRINGS.DETAILS}`}</DialogTitle>
        <DialogContent>
          <FacilitatorForm
            facilitator={updated}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{UI_STRINGS.CANCEL}</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={hasErrors}
            onClick={() => {
              onChange(updated)
            }}
          >
            {UI_STRINGS.SUBMIT}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default FacilitatorModal;

