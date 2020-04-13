import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Service from '../Service/Service';
import GeneralInformation from '../GeneralInformation/GeneralInformation';
import Research from '../Research/Research';

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

  return (
    <div className={classes.root}>
      <Grid container justify="center" spacing={2}>
        <Grid item sm={12}>
          <GeneralInformation/>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <Research/>
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