import React ,{useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { Grid, Paper, Box, TextField, CssBaseline, Container, Button, Typography, Card, FormControl, InputLabel, Input, Snackbar, Alert, AlertTitle } from '@mui/material'
import { styled } from '@mui/material/styles';
import LoginIcon from '@mui/icons-material/Login';
import axios from "axios";
import store from "store-js";
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoadingButton from '@mui/lab/LoadingButton';
import { LOGISTIQ_CONSTANTS } from './Constants';

function LoginPage({setIsAuthenticated}) {

    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
    const [showPwd, setShowPwd] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [logginErrorMsg, setLogginErrorMsg] = useState('');
    
    function handleSubmit() {
        setLoginLoading(true);
        invokeLoginAPI();
    }

    useEffect(() => {
        setLogginErrorMsg(logginErrorMsg);
    }, [logginErrorMsg]);

    const handleClose = (event, reason) => {
        if(reason === 'clickaway'){
            return;
        }
        setOpen(false);
    }

    useEffect(() => {
        setLoginLoading(loginLoading);
    }, [loginLoading])
    

    const invokeLoginAPI = async () => {
        const body = {
            "email": username,
            "password": password
        }
    
        await axios.post(`${LOGISTIQ_CONSTANTS.AUTH_API_BASE_URL}/${LOGISTIQ_CONSTANTS.LOGIN_URL}`, body)
        .then((res)=> {
            const uid = res.data.uid
            // Call the Userdetails API to get the webhook configuration
            axios.get(`${LOGISTIQ_CONSTANTS.AUTH_API_BASE_URL}/${LOGISTIQ_CONSTANTS.USER_DETAILS_URL}=${uid}`)
            .then((userResponse) => {
                store.set('isAuthenticated', true);
                store.set('user', build_userdetails(res.data, userResponse.data));
                setLoginLoading(false);
                setIsAuthenticated(true);
            })
            .catch((err)=>{
                console.log(err);
                store.remove('user');
                store.set('isAuthenticated', false);
                setLogginErrorMsg('Could not find the user details. Please contact Logistiq support team');
                setLoginLoading(false);
                setOpen(true);
                setIsAuthenticated(false);
            });
        })
        .catch((err)=> {
            console.log(err);
            store.remove('user');
            store.set('isAuthenticated', false);
            setLogginErrorMsg('Login Failed!!!. Please provide valid username and password');
            setLoginLoading(false);
            setOpen(true);
            setIsAuthenticated(false);
        });

    }

    function build_userdetails(login_response, user_response) {
        console.log(user_response)
        console.log(user_response.data.channel)
        let user_data = login_response
        user_data['webhook'] = user_response.data.channel
        console.log(user_data)
        return user_data
    }



    const snakeBarContent = (
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} sx={{ width: '100%' }} anchorOrigin={{vertical: 'top',horizontal: 'right',}}>
            <Alert onClose={handleClose} severity='error'>
                <AlertTitle>
                    Error
                </AlertTitle>
                {logginErrorMsg}
            </Alert>
        </Snackbar>
    );

  return (
    // <React.Fragment>
    //         <Box sx={{ height: '100vh' }}>
    //         <div style={{ padding: 30 }}>
    //             <Grid container justifyContent={'center'} spacing={3} alignItems={'center'} direction={'column'}>
    //                 <Grid item xs={12}>
    //                    <Typography>Email</Typography>  <input type={'email'} placeholder="Email" value={username} onChange={(e)=> setUserName(e.target.value)}></input>
    //                 </Grid>
    //                 <Grid item xs={12}>
    //                    <Typography>Password</Typography> <input type={'password'} placeholder="Password" value={password} onChange={(e)=> setPassword(e.target.value)}></input>
    //                 </Grid>
    //                 <Grid item xs={12}>
    //                     <Button variant="contained" startIcon={<LoginIcon/>} onClick={handleSubmit}>Login</Button>
    //                 </Grid>
    //             </Grid>
    //             </div>
    //         </Box>
    // </React.Fragment>
    <Box component="form" sx={{'& > :not(style)': { m: 2 },}}
      noValidate
      autoComplete="off">
        <div style={{ padding: 30 }}>
            <Grid container justifyContent={'center'} spacing={3} alignItems={'center'} direction={'column'}>
                <Grid item xs={12}>
                    {snakeBarContent}
                </Grid>
                <Grid item xs={12}>
                    <FormControl>
                        <InputLabel htmlFor='email'>Email</InputLabel>
                        <Input id='email' placeholder='Username' value={username} onChange={(e)=> setUserName(e.target.value)}></Input>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl>
                        <InputLabel htmlFor='pwd'>Password</InputLabel>
                        <Input id='pwd' placeholder='Password' type={showPwd ? 'text': 'password'} value={password} onChange={(e)=> setPassword(e.target.value)}></Input>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <LoadingButton variant="contained" loading={loginLoading} 
                    loadingPosition={'end'} endIcon={<LoginIcon/>} 
                    onClick={handleSubmit}>Login</LoadingButton>
                </Grid>
            </Grid>
        </div>
    </Box>

  );
}

LoginPage.propTypes = {}

export default LoginPage
