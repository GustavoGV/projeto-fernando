import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import socket from '../../connection';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height:'100%',
  },
}));

const gameState = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  325,
  333,
  32,
  14,
  32,
  45,
  46,
  34,
  87,
  2
]


function GeneralInformation(props){
  socket.emit('teste', 'teste batata')
  const classes = useStyles();
  return(
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Caixa</h3>
            <br/>
            <h4>{gameState[21]}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Frota</h3>
            <br/>
            <h4>{gameState[22]}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Promotores</h3>
            <br/>
            <h4>{gameState[23]}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8} md={4}>
          <Paper className={classes.paper}>
            <h3>Propaganda Institucional</h3>
            <br/>
            <h4>{gameState[27]}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Faturamento Esperado</h3>
          </Paper>
        </Grid>
      </Grid>
      
    </>
  )
}

export default GeneralInformation