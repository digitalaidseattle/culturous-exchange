import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';;
import { CloseCircleOutlined } from '@ant-design/icons';
import { List, ListItem, ListItemText, Stack } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface Props {
  isModalOpen: boolean
  onClose: () => void
  failedStudents: Student[]
}

const FailedStudentsModal: React.FC<Props> = ( { isModalOpen, onClose, failedStudents } ) => {

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={isModalOpen}
      >
        <Stack direction='row'>
          <DialogTitle>
            Some Uploads Failed:
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={onClose}
          >
            <CloseCircleOutlined />
          </IconButton>
        </Stack>
        <DialogContent dividers>
          {failedStudents.map((student: Student, idx: number) => (
              <List key={idx}>
                <ListItem>
                  <ListItemText>
                    {`ID: ${student.id} | Name: ${student.name}` }
                  </ListItemText>
                </ListItem>
              </List>
          ))}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}

export default FailedStudentsModal;