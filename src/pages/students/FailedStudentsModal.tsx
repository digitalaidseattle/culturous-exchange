import { CloseCircleOutlined } from '@ant-design/icons';
import { List, ListItem, ListItemText, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { FailedStudent } from '../../api/types';
import BootstrapDialog from '../../utils/styles';
;


interface Props {
  isModalOpen: boolean
  onClose: () => void
  failedStudents: FailedStudent[]
}

const FailedStudentsModal: React.FC<Props> = ( { isModalOpen, onClose, failedStudents } ) => {

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={isModalOpen}
      >
        <Stack direction='row' justifyContent='space-between'>
          <DialogTitle>
            Students that require attention:
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={onClose}
          >
            <CloseCircleOutlined />
          </IconButton>
        </Stack>
        <DialogContent dividers>
        {failedStudents.map((student: FailedStudent, idx: number) => (
              <List key={idx}>
                <ListItem>
                  <ListItemText primary={`Name: ${student.name}`} />
                </ListItem>
                {typeof student.failedError === 'string' && (
                  <ListItemText secondary={`Error: ${student.failedError}`} style={{ marginLeft: '10%' }}/>
                )}
                {typeof student.failedError === 'object' && student.failedError !== null && (
                  student.failedError.map((error, idx) => (
                    <ListItem key={`${idx}-${error.field}-${idx}`}>
                        <ListItemText secondary={`${error.field}: ${error.message}`} style={{ marginLeft: '10%' }}/>
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
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}

export default FailedStudentsModal;