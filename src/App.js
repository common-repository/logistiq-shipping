import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import React from 'react';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

const App = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleChange = (event) => {
      setAuth(event.target.checked);
    };
  
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
        <div>
            {/* <h2 className='app-title'>Logistiq | Shipping App</h2>
            <hr /> */}
            <Home/>
        </div>
    //     <Box sx={{ flexGrow: 1 }}>
    //     <AppBar position="static">
    //       <Toolbar>
    //         <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
    //           Logistiq
    //         </Typography>
    //           <div>
    //             <IconButton
    //               size="large"
    //               aria-label="account of current user"
    //               aria-controls="menu-appbar"
    //               aria-haspopup="true"
    //               onClick={handleMenu}
    //               color="inherit"
    //             >
    //               <AccountCircle />
    //             </IconButton>
    //             <Menu
    //               id="menu-appbar"
    //               anchorEl={anchorEl}
    //               anchorOrigin={{
    //                 vertical: 'top',
    //                 horizontal: 'right',
    //               }}
    //               keepMounted
    //               transformOrigin={{
    //                 vertical: 'top',
    //                 horizontal: 'right',
    //               }}
    //               open={Boolean(anchorEl)}
    //               onClose={handleClose}
    //             >
    //               <MenuItem onClick={handleClose}>Profile</MenuItem>
    //               <MenuItem onClick={handleClose}>My account</MenuItem>
    //             </Menu>
    //           </div>
    //       </Toolbar>
    //     </AppBar>
    //     <Home></Home>
    //   </Box>
    );
}

export default App;