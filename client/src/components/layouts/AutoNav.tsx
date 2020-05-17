import React, { useState } from 'react';
import { Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import HomeIcon from '@material-ui/icons/Home';
import Menu from '@material-ui/core/Menu';
import { Popup } from 'semantic-ui-react';
import { ReactComponent as Logo } from '../../autotrader.svg';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  })
);

const AutoNav: React.FunctionComponent<RouteComponentProps> = () => {
  const classes = useStyles();
  const [auth, setAuth] = React.useState(true);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuth(event.target.checked);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.root}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={auth}
              onChange={handleChange}
              aria-label="login switch"
            />
          }
          label={auth ? 'Logout' : 'Login'}
        />
      </FormGroup>
      <AppBar style={{ backgroundColor: '#313c53' }} position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => setRedirectTo('/')}
          >
            <Logo
              style={{
                width: '200px',
                height: '50',
              }}
            />
          </IconButton>
          <Typography
            variant="h5"
            className={classes.title}
            style={{
              textAlign: 'left',
            }}
          >
            |
          </Typography>
          <div>
            <Popup
              content="Saved ads"
              basic
              trigger={
                <div>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={() => setRedirectTo('/savedAds')}
                  >
                    <FavoriteBorderIcon />
                  </IconButton>
                </div>
              }
            />
          </div>
          <div>
            <Popup
              content={auth ? 'User options' : 'Sign in'}
              basic
              trigger={
                <div>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={() => auth || setRedirectTo('/login')}
                  >
                    {auth ? <AccountCircle /> : <ExitToAppIcon />}
                  </IconButton>
                  {auth && (
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={open}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleClose}>Profile</MenuItem>
                      <MenuItem onClick={handleClose}>Logout</MenuItem>
                    </Menu>
                  )}
                </div>
              }
            />
          </div>
        </Toolbar>
      </AppBar>
      {redirectTo && <Redirect to={redirectTo} />}
    </div>
  );
};

export default withRouter(AutoNav);
