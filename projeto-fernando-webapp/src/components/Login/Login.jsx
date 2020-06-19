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
import Hidden from '@material-ui/core/Hidden';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { CardMedia } from '@material-ui/core';
import video from './../../assets/video.mp4'
import { makeStyles } from '@material-ui/core/styles';
import socket from '../../connection';
import {register, login} from '../../serverCalls';

socket.emit('teste', 'teste01')


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
    marginBottom: '64px',
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

export default function Login(props) {
  const classes = useStyles();
  const [error, setError] = useState(false);
  const [signInData, setSignInData] = useState({
    cooperative:null,
    instance:null,
    password:null,
  })

  function onSimulationClick(){
    const {cooperative, instance, password} = signInData
    const creden = [cooperative, password, instance];
    login(creden)
    props.history.push('/game/manual')
    setError(true);
  }

  useEffect(()=>{
    socket.on('login-client-aprovado',creden=>{
      props.history.push('/game/manual')
    })
    return(()=>{
      socket.off('login-aprovado')
    })
  }, [])

  return (
    <>
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Hidden xsDown>
        <Grid item xs={false} sm={12} md={7} className={classes.image}>
          <video width="551" height="310" controls className={classes.video}>
            <source src={video} type="video/mp4">
            </source>
          </video>
        </Grid>
      </Hidden>
      <Grid item xs={12} sm={12} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Entrar
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              error={error}
              helperText={error? "falha no login" : null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="cooperative"
              label="Cooperativa"
              name="cooperativa"
              autoComplete="cooperativa"
              autoFocus
              onChange={e=>setSignInData({...signInData, cooperative:e.target.value})}
            />
            <TextField
              error={error}
              helperText={error? "falha no login" : null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={e=>setSignInData({...signInData, password:e.target.value})}
            />
           <TextField
              error={error}
              helperText={error? "falha no login" : null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="instance"
              label="Instância"
              name="instância"
              autoComplete="instância"
              autoFocus
              onChange={e=>setSignInData({...signInData, instance:e.target.value})}
            />
            <Button
              //type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={()=>onSimulationClick()}
            >
              Entrar
            </Button>
            <Grid container>
              <Grid item xs>
              </Grid>
              <Grid item>
                <Link to='/register' variant="body2">
                  {"Não tem uma conta? Cadastre-se"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
    </Grid>
    </>
  );
}