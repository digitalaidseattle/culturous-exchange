/**
 *  DetailsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { CloseCircleOutlined } from '@ant-design/icons';
import { List, ListItem, ListItemText, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { FailedProfile } from '../api/types';
import { UI_STRINGS } from '../constants';
import BootstrapDialog from '../utils/styles';

interface Props {
  isModalOpen: boolean
  onClose: () => void
  failedProfiles: FailedProfile[]
}
const FailedUploadModal: React.FC<Props> = ({ isModalOpen, onClose, failedProfiles }) => {
  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={isModalOpen}
      >
        <Stack direction='row' justifyContent='space-between'>
          <DialogTitle>
            {UI_STRINGS.STUDENTS_ATTENTION}
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={onClose}
          >
            <CloseCircleOutlined />
          </IconButton>
        </Stack>
        <DialogContent dividers>
          {failedProfiles.map((profile: FailedProfile, idx: number) => (
            <List key={idx}>
              <ListItem>
                <ListItemText primary={`${UI_STRINGS.NAME_FIELD} ${profile.name}`} />
              </ListItem>
              {typeof profile.failedError === 'string' && (
                <ListItemText secondary={`${UI_STRINGS.ERROR} ${profile.failedError}`} style={{ marginLeft: '10%' }} />
              )}
              {typeof profile.failedError === 'object' && profile.failedError !== null && (
                profile.failedError.map((error, idx) => (
                  <ListItem key={`${idx}-${error.field}-${idx}`}>
                    <ListItemText secondary={`${error.field}: ${error.message}`} style={{ marginLeft: '10%' }} />
                  </ListItem>
                ))
              )}
            </List>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={onClose}
            variant='contained'
            color='primary'
          >
            {UI_STRINGS.CLOSE}
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}

export default FailedUploadModal;