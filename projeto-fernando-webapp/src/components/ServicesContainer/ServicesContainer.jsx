import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Service from '../Service/Service';
import GeneralInformation from '../GeneralInformation/GeneralInformation';
import Research from '../Research/Research';
import socket from '../../connection';
import { stat } from 'fs';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  button:{
    margin:'16px',
  }
}));

export default function ServicesContainer() {
  const classes = useStyles();
  const [game, setGame] = useState([])

  useEffect(()=>{
    console.log('puxando state')
    socket.emit('puxar-state');
    socket.emit('aumentar-frota', 1);
    socket.on('update', state => {
      console.log('estado atual: ', state)
      setGame(state)
    return ()=>{
      socket.off('update');
      console.log('unmounting servicesContainer');
    }
    })
  },[])

  return (
    <div className={classes.root}>
      <Grid container justify="center" spacing={2}>
        <Grid item sm={12}>
          <GeneralInformation gameData={game}/>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <Research gameData={game} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Service serviceName="Serviço 1"/>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Service serviceName="Serviço 2"/>
          </Paper>
        </Grid>
        <Button variant="contained" color="primary" className={classes.button}>
          Salvar
        </Button>
      </Grid>
    </div>
  );
}