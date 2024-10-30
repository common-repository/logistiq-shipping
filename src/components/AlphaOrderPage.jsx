import React, {useState, useEffect} from 'react';
import { AppBar, Badge, Box, SwipeableDrawer, Tab, Tabs, useTheme } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import FWD_OrderPage from './FWD_OrderPage';
import RVP_OrderPage from './RVP_OrderPage';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';



function AlphaOrderPage({setIsAuthenticated}) {
    const theme = useTheme();
    const [value, setValue] = useState('fwd');
    const [fwbCount, setFwdCount] = useState(0);
    const [rvpCount, setRvpCount] = useState(0);


    // const handleChange = (event, newValue) => {
    //     setValue(newValue);
    //   };

    useEffect(() => {
        if (fwbCount) {
          setFwdCount(fwbCount);
        }
      }, [fwbCount]);
    
      useEffect(() => {
        if (rvpCount) {
          setRvpCount(rvpCount);
        }
      }, [rvpCount]);

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
        <TabContext value={value}>
            <Tabs value={value}
                  onChange={(event, newValue) => setValue(newValue)}
                  textColor="primary"
                  indicatorColor="primary"
                  aria-label="Logistiq Orders">
                    {/* <Tab label={<Badge badgeContent={0} color="warning" showZero>Forward</Badge>} value='fwd' />
                    <Tab label={<Badge badgeContent={0} color="warning" showZero>Return</Badge>} value='rvp' /> */}
                    <Tab label="Forward" value='fwd' icon={<Badge badgeContent={fwbCount} color="warning" showZero><DriveFileMoveIcon/></Badge>} iconPosition='end'/>
                    <Tab label="Return" value='rvp' icon={<Badge badgeContent={rvpCount} color="warning" showZero><AssignmentReturnIcon/></Badge>} iconPosition='end'/>
            </Tabs>
            <TabPanel value='fwd'>
                <FWD_OrderPage setFwdCount={setFwdCount} setIsAuthenticated={setIsAuthenticated}></FWD_OrderPage>
            </TabPanel>
            <TabPanel value='rvp'>
               <RVP_OrderPage setRvpCount={setRvpCount} setIsAuthenticated={setIsAuthenticated}></RVP_OrderPage>
            </TabPanel>
        </TabContext>
    </Box>
  )
}

export default AlphaOrderPage