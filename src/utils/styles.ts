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

// Raised, softly rounded card used for cohorts, plans and the cohort summary.
export const raisedCardSx: SxProps<Theme> = {
  borderRadius: 1,
  boxShadow: 3
};

// Light, raised button used for shortcuts inside cards.
export const tonalButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
  color: 'primary.main',
  boxShadow: 2,
  '&:hover': {
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
    boxShadow: 3
  }
};

// Softly tinted, outlined box for grouping related numbers or a chart inside a card.
export const insetPanelSx: SxProps<Theme> = {
  borderRadius: 1,
  border: 1,
  borderColor: 'divider',
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
  padding: 1.5
};

// A raised card that can be clicked as a whole: the pointer shows it, and it lifts a little on hover.
export const clickableCardSx: SxProps<Theme> = {
  borderRadius: 1,
  boxShadow: 3,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: 6
  }
};

// The surface and border of an "Active" status tag: a pale, slightly grey (sage) mint green, light
// enough that the main text color reads clearly on it (about 12 to 1).
export const ACTIVE_STATUS_SURFACE = '#e2f0df';
export const ACTIVE_STATUS_BORDER = '#9fcf99';
