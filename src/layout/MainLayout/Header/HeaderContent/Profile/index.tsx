import { useContext, useEffect, useRef, useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  ButtonBase,
  CardContent,
  ClickAwayListener,
  Grid,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import Transitions from '../../../../../components/@extended/Transitions';
import MainCard from '../../../../../components/MainCard';

// assets
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { UserContext } from '../../../../../components/contexts/UserContext';
import { authService } from '../../../../../services/authService';

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const theme = useTheme();
  const { user } = useContext(UserContext)
  const [username, setUsername] = useState<string>("")
  const [avatar, setAvatar] = useState<string>("")
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setAvatar(user.user_metadata.avatar_url)
      setUsername(user.user_metadata.name ? user.user_metadata.name : user.user_metadata.email)
    }
  }, [user])

  const handleLogout = async () => {
    authService.signOut()
      .then(() => navigate('/login'))
  };

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    // FIXME
    // eslint-disable-next-line 
    const ref = anchorRef as any;
    if (ref.current && ref.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = 'grey.300';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter' }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 0.5 }}>
          <Avatar alt="profile user" src={avatar} sx={{ width: 32, height: 32 }} />
          <Typography variant="subtitle1">{username}</Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            {open && (
              <Paper
                sx={{
                  boxShadow: theme.shadows['1'],
                  width: 290,
                  minWidth: 240,
                  maxWidth: 290,
                  [theme.breakpoints.down('md')]: {
                    maxWidth: 250
                  }
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <CardContent sx={{ px: 2.5, pt: 3 }}>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar alt="profile user" src={avatar} sx={{ width: 32, height: 32 }} />
                            <Stack>
                              <Typography variant="h6">{username}</Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <IconButton size="large" color="secondary" onClick={handleLogout}>
                            <LogoutOutlined />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            )}
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;
