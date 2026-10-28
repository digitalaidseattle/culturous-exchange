import Dialog from '@mui/material/Dialog';
import { SxProps, Theme, alpha, styled } from '@mui/material/styles';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default BootstrapDialog;

// Softly tinted, outlined box for grouping related numbers or a chart inside a card.
export const insetPanelSx: SxProps<Theme> = {
  borderRadius: 1,
  border: 1,
  borderColor: 'divider',
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
  padding: 1.5
};
