import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import {Link} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import video from './../../assets/video.mp4'
import { makeStyles } from '@material-ui/core/styles';
import socket from '../../connection';
import Image from '../../assets/business.jpg';


const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
  },
  container:{
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  button:{
    margin:'14px'
  },
  image:{
    objectFit:'cover',
    height:'100%',
    width:'100%'
  },
  grid:{
    marginTop:'10%'
  }
}))

function SimSelect(props){
  const classes = useStyles();
  const history = useHistory();
  return(
    <>
      <CssBaseline />
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={12} md={6}>
          <img src={Image} alt="business" className={classes.image}/>
        </Grid>
        <Grid item xs={false} sm={12} md={6} className={classes.grid}>
          <div className = {classes.container}>
          <Typography component="h1" variant="h5" className={classes.button}>
            Bem vindo ao Desafio de Gestão!
          </Typography>
          <Typography component="p" variant="body1" className={classes.button}>
            Aqui esperamos que você apreenda se divertindo. 
            E dessa forma possa entender de forma dinâmica como os vários elementos 
            da administração interferem no processo de gestão.
          </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={()=>{
                history.push('/login');
              }}
              className={classes.button}
            >
              HSG - Health Service Game
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={()=>{
                history.push('/login');
              }}
              className={classes.button}
            >
              CBG - Cooperative Business Game
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default SimSelect;