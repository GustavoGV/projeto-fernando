import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Link} from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { CardMedia } from '@material-ui/core';
import video from './../../assets/video.mp4'
import { makeStyles } from '@material-ui/core/styles';
import socket from '../../connection';


function Copyright() {
  return (
    // <Typography variant="body2" color="textSecondary" align="center">
    //   {'Copyright © '}
    //   <Link color="inherit" href="https://material-ui.com/">
    //     Your Website
    //   </Link>{' '}
    //   {new Date().getFullYear()}
    //   {'.'}
    // </Typography>
    <></>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.primary[50] : theme.palette.primary[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  video: {
    display:'block',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: '64px',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Register(props) {
  const classes = useStyles();
  const [signUpData, setSignUpData] = useState({
    cooperative:null,
    instance:null,
    password:null,
  });

  function register(){
    let {cooperative, instance, password, instancePassword} = signUpData
    if(cooperative && instance && password){
      let creden = [cooperative, password, instance, instancePassword]
      socket.emit('register-client', creden )
    }
    
  }

  useEffect(()=>{
    socket.on('login-client-aprovado',data=>{
      props.history.push('/game/inputs')
    })
    return(()=>{
      socket.off('login-client-aprovado')
    })
  })

  return (
    <>
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image}>
        <video width="640" height="360" controls className={classes.video}>
          <source src={video} type="video/mp4">
          </source>
        </video>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Registro
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="cooperative"
              label="Cooperativa"
              name="cooperativa"
              autoComplete="cooperativa"
              autoFocus
              onChange={e=>setSignUpData({...signUpData, cooperative:e.target.value})}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={e=>setSignUpData({...signUpData, password:e.target.value})}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="instance"
              label="Instância"
              name="instância"
              autoComplete="instância"
              autoFocus
              onChange={e=>setSignUpData({...signUpData, instance:e.target.value})}
            />
            

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha da instância"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={e=>setSignUpData({...signUpData, instancePassword:e.target.value})}
            />
           
            <Button
              //type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={()=>register()}
            >
              Registrar-se
            </Button>
            <Grid container>
              <Grid item xs>
              </Grid>
              <Grid item>
                <Link to='/login' variant="body2">
                  {"Já tem uma conta? Faça login"}
                </Link>
              </Grid>
            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
    </>
  );
}