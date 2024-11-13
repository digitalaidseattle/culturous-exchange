/**
 *  DrawerHeader/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

// material-ui
import { Box, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import Logo from '../../../../components/Logo/Logo';
import { useNavigate } from 'react-router';

// ==============================|| DRAWER HEADER ||============================== //

const DrawerHeader = (props: { open: boolean }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent={props.open ? 'flex-start' : 'center'}
      paddingLeft={theme.spacing(props.open ? 3 : 0)} >
      <Stack direction="row" m={1} spacing={1} alignItems="center">
        <Button onClick={() => navigate('/')}>
          <Logo />
        </Button>
      </Stack>
    </Box>
  );
};

export default DrawerHeader;
