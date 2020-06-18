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

  const [adsModal, setAdsModal] = useState(false);
  const [fleetModal, setFleetModal] =useState(false);
  const [promotersModal, setPromotersModal] = useState(false);
  const [comissionModal, setComissionModal] = useState(false);
  const [debtModal, setDebtModal] = useState(false);
  const [pasModal, setPasModal] = useState(false);
  const [distributorsModal, setDistributorsModal] = useState(false);

  const [adsInvestment, setAdsInvestment] = useState();
  const [newFleet, setNewFleet] = useState();
  const [newPromoters, setNewPromoters] = useState();
  const [newComission, setNewComission] = useState();
  const [newDebt, setNewDebt] = useState();
  const [newPas, setNewPas] = useState();
  const [newDistributors, setNewDistributors] = useState();

  function calcRevenue(){
    console.log(">>>>>>>>>>>state do jogo:", props.gameData);
    let revenue = 0;
    props.gameData.slice(0,21).filter(service=>service[1]===1).forEach(service=>{
      revenue += service[3] * service[4]
    })
    return revenue;
  }

  return(
    <>
      <Dialog open={adsModal} aria-labelledby="simple-dialog-title" onClose={()=>setAdsModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Alterar Investimento em Propaganda</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setAdsInvestment(event.target.value)}}
            placeholder='Investimento em propaganda'
          />
          <Button onClick={()=>{
            socket.emit('aumentar-propaganda', adsInvestment);
            setAdsModal(false);
          }}>
            Investir
          </Button>
          <Button onClick={()=>{
            socket.emit('diminuir-propaganda', adsInvestment);
            setAdsModal(false);
          }}>
            Diminuir Investimento
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={distributorsModal} aria-labelledby="simple-dialog-title" onClose={()=>setDistributorsModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Alterar Distribuidores</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setNewDistributors(event.target.value)}}
            placeholder='Distribuidores'
          />
          <Button onClick={()=>{
            socket.emit('aumentar-distribuidores', newDistributors);
            setDistributorsModal(false);
          }}>
            Aumentar
          </Button>
          <Button onClick={()=>{
            socket.emit('diminuir-distribuidores', newDistributors);
            setDistributorsModal(false);
          }}>
            Diminuir
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={fleetModal} aria-labelledby="simple-dialog-title" onClose={()=>setFleetModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Alterar Frota</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setNewFleet(event.target.value)}}
            placeholder='Veículos'
          />
          <Button onClick={()=>{
            socket.emit('aumentar-frota', newFleet);
            setFleetModal(false);
          }}>
            Aumentar
          </Button>
          <Button onClick={()=>{
            socket.emit('vender-frota', newFleet);
            setFleetModal(false);
          }}>
            Diminuir
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={promotersModal} aria-labelledby="simple-dialog-title" onClose={()=>setPromotersModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Alterar Promotores</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setNewPromoters(event.target.value)}}
            placeholder='Novos Promotores'
          />
          <Button onClick={()=>{
            socket.emit('aumentar-promotores', newPromoters);
            setPromotersModal(false);
          }}>
            Investir
          </Button>
          <Button onClick={()=>{
            socket.emit('diminuir-promotores', newPromoters);
            setPromotersModal(false);
          }}>
            Diminuir Investimento
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={comissionModal} aria-labelledby="simple-dialog-title" onClose={()=>setComissionModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Alterar Comissão</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setNewComission(event.target.value)}}
            placeholder='Comissão'
          />
          <Button  onClick={()=>{
            socket.emit('comissao', newComission);
            setComissionModal(false);
          }}>
            Alterar
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={debtModal} aria-labelledby="simple-dialog-title" onClose={()=>setDebtModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Dívida / Empréstimo</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setNewDebt(event.target.value)}}
            placeholder='Valor'
          />
          <Button onClick={()=>{
            socket.emit('quitar-divida', newDebt);
            setDebtModal(false);
          }}>
            Quitar
          </Button>
          <Button onClick={()=>{
            socket.emit('emprestimo', newDebt);
            setDebtModal(false);
          }}>
            Fazer Empréstimo
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={pasModal} aria-labelledby="simple-dialog-title" onClose={()=>setPasModal(prevState=>!prevState)}>
        <DialogTitle id="simple-dialog-title">Alterar PAS</DialogTitle>
        <DialogContent>
          <Input
            onChange={(event)=>{setNewPas(event.target.value)}}
            placeholder='PAS'
          />
          <Button onClick={()=>{
            socket.emit('aumentar-pas', newPas);
            setPasModal(false);
          }}>
            Aumentar
          </Button>
          <Button onClick={()=>{
            socket.emit('diminuir-pas', newPas);
            setPasModal(false);
          }}>
            Diminuir
          </Button>
        </DialogContent>
      </Dialog>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Caixa</h3>
            <br/>
            <h4>{Math.round(props.gameData[21])}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Frota</h3>
            <br/>
            <h4>{props.gameData[22]?props.gameData[22].reduce((a, b)=> a + b) : '-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setFleetModal(true)}
              >Alterar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Promotores</h3>
            <br/>
            <h4>{props.gameData[23]?props.gameData[23]:'-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setPromotersModal(true)}
              >Alterar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8} md={4}>
          <Paper className={classes.paper}>
            <h3>Propaganda Institucional</h3>
            <br/>
            <h4>{props.gameData[27]?props.gameData[27]:'-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setAdsModal(true)}
              >Alterar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Faturamento Esperado</h3>
            <br/>
            <h4>{Math.round(calcRevenue())}</h4>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Comissão</h3>
            <br/>
            <h4>{props.gameData[24]?props.gameData[24]:'-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setComissionModal(true)}
              >Alterar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>PAS</h3>
            <br/>
            <h4>{props.gameData[26]?props.gameData[26]:'-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setPasModal(true)}
              >Alterar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Distribuidores</h3>
            <br/>
            <h4>{props.gameData[25]?props.gameData[25]:'-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setDistributorsModal(true)}
              >Alterar</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8} md={4}>
          <Paper className={classes.paper}>
            <h3>Dívida / Empréstimo</h3>
            <br/>
            <h4>{props.gameData[29]?Math.round(props.gameData[29]):'-'}</h4>
            <br/>
            {props.isAdmin
            ?null
            :(<Button
                variant="contained" color="primary"
                onClick={()=>setDebtModal(true)}
              >Empréstimo</Button>)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper className={classes.paper}>
            <h3>Turno</h3>
            <br/>
            <h4>{props.gameData[30]?props.gameData[30]:'-'}</h4>
            <br/>
          </Paper>
        </Grid>
        {props.children ? (props.children) : null}
      </Grid>
    </>
  )
}

export default GeneralInformation