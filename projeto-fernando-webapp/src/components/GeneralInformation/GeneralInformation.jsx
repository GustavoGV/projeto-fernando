import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height:'100%',
  },
}));

function GeneralInformation(props){
  const classes = useStyles();
  return(
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Caixa</h3>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Frota</h3>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Promotores</h3>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8} md={4}>
          <Paper className={classes.paper}>
            <h3>Propaganda Institucional</h3>
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