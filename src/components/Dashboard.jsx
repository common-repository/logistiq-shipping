import React from 'react';
import { Button, Tab, Tabs } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import UnfulfilledOrder from './UnfulfilledOrder';
import AlphaOrderPage from './AlphaOrderPage';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AnalyticsIcon from '@mui/icons-material/Analytics';

function Dashboard({setIsAuthenticated}) {
    const [value, setValue] = React.useState('panel-1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
        <Box sx={{ width: '100%' }}>
            <TabContext value={value}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="primary"
                  indicatorColor="primary"
                  aria-label="Logistiq Dashboard"
                >
                    <Tab value="panel-1" icon={<StorefrontIcon/>} label="Unfulfilled Orders" iconPosition='start'></Tab>
                    {/* <Tab value="panel-2" icon={<AddBusinessIcon/>} label="Orders with Logistiq" />*/} 
              </Tabs>
              <TabPanel value="panel-1"><UnfulfilledOrder setIsAuthenticated={setIsAuthenticated}></UnfulfilledOrder></TabPanel>
               {/* <TabPanel value='panel-2'><AlphaOrderPage setIsAuthenticated={setIsAuthenticated}></AlphaOrderPage></TabPanel>*/} 
            </TabContext>
    </Box>
    );
}

export default Dashboard