import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Facilitator, ValidationError } from '../../api/types';
import { UI_STRINGS } from '../../constants';
import FacilitatorForm from './FacilitatorForm';
import { FacilitatorValidationService } from '../../services/ValidationService';

interface Props {
  mode: 'add' | 'edit';
  facilitator: Facilitator;
  open: boolean;
  onClose: () => void;
  onChange: (updated: Facilitator) => void;
}

const FacilitatorModal: React.FC<Props> = ({ mode, facilitator, open, onClose, onChange }) => {
  const validationService = FacilitatorValidationService.getInstance();

  const [updated, setUpdated] = useState<Facilitator>(facilitator);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (open) {
      setValidationErrors([]);
    }
  }, [open]);

  useEffect(() => {
    setUpdated(facilitator);
  }, [facilitator]);

  function handleChange(updatedFacilitator: Facilitator, validationErrors: ValidationError[]) {
    setUpdated(updatedFacilitator);
    setValidationErrors(validationErrors);
  };

  function handleSubmit(): void {
    const errors = validationService.validate(updated);
    setValidationErrors(errors);
    if (errors.length === 0) {
      onChange(updated);
    }
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={'md'}
      >
        <DialogTitle>{mode === 'add' ? `${UI_STRINGS.NEW} ${UI_STRINGS.DETAILS}` : `${UI_STRINGS.EDIT} ${UI_STRINGS.DETAILS}`}</DialogTitle>
        <DialogContent>
          <FacilitatorForm
            facilitator={updated}
            fieldErrors={validationErrors}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{UI_STRINGS.CANCEL}</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={validationErrors.length > 0}
            onClick={handleSubmit}
          >
            {UI_STRINGS.SUBMIT}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default FacilitatorModal;

