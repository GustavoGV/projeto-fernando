import React, {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {Input} from 'reactstrap';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import socket from '../../connection';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle'
import { DialogContent } from '@material-ui/core';


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

  const classes = useStyles();

  const [modal, setModal] = useState(false);
  const [adsInvestment, setAdsInvestment] = useState()

  function calcRevenue(){
    let revenue = 0;
    props.gameData.slice(0,21).filter(service=>service[1]===1).forEach(service=>{
      revenue += service[3] * service[4]
    })
    return revenue;
  }

  return(
    <>
      <Dialog open={modal} aria-labelledby="simple-dialog-title" onClose={()=>setModal(!modal)}>
        <DialogTitle id="simple-dialog-title">Aumentar Investimento em Propaganda</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setAdsInvestment(event.target.value)}}
            placeholder='Investimento em propaganda'
          />
          <Button onClick={()=>{
            socket.emit('aumentar-propaganda', adsInvestment);
            setModal(false);
          }}>
            Investir
          </Button>
        </DialogContent>
      </Dialog>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Caixa</h3>
            <br/>
            <h4>{props.gameData[21]}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Frota</h3>
            <br/>
            <h4>{props.gameData[22]?props.gameData[22].reduce((a, b)=> a + b) : '-'}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Promotores</h3>
            <br/>
            <h4>{props.gameData[23]}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8} md={4}>
          <Paper className={classes.paper}>
            <h3>Propaganda Institucional</h3>
            <br/>
            <h4>{props.gameData[27]}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                onClick={()=>setModal(true)}
              >Aumentar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Faturamento Esperado</h3>
            <br/>
            <h4>{calcRevenue()}</h4>
          </Paper>
        </Grid>
        {props.children ? (props.children) : null}
      </Grid>
      
    </>
  )
}

export default GeneralInformation