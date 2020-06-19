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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import CsvDownload from 'react-json-to-csv';
import Select from 'react-select';
import { height } from '@material-ui/system';
import {useHistory} from 'react-router-dom';


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
    marginLeft:'auto',
    marginRight:'auto',
    display:'flex',
  },
  csvButton:{
    margin:'16px',
    marginLeft:'auto',
    marginRight:'auto',
    display:'flex',
    backgroundColor:'#3f51b5',
    color:'#fff',
    borderColor:'transparent',
    textTransform:'uppercase',
    padding:'8px',
    borderRadius:'4px',
  },
  dialog:{
    height:'400px',
  }
}));

export default function ServicesContainer() {

  const classes = useStyles();
  const [game, setGame] = useState([])
  const [downloadModal, setDownloadModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState({frango:true})  
  const [round, setRound] = useState();

  const history = useHistory();

  function generateRounds(){
    const currentRound = game[30] ? game[30] : 0;
    let rounds = []
    let i;
    for(i=1; i<currentRound; i++){
      rounds.push({value:i, label:i});
    }
    return rounds
  }

  useEffect(()=>{
    socket.emit('puxar-state');
    socket.on('final-turno',()=>{
      console.log("final-turno")
      socket.emit('puxar-state');

    })
    socket.on('update', state => {
      setGame(state)
    return ()=>{
      socket.off('update');
    }});
    socket.on('balancos', balanco => {
      setDownloadInfo(balanco)
    });
  },[])



  function generateServices(services){
    return services.filter(service=>service[1]===1).map((service, index)=>{
      return(
        <Grid key={index} item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Service service={service} game={game}/>
          </Paper>
        </Grid>
      )
    })
  }

  function generateServicesOptions(){
    return game.slice(0,21).map(service=>{return{value:service[8], label:service[8]}})
  }

  return (
    <div className={classes.root}>
      <Dialog open={serviceModal} aria-labelledby="simple-dialog-title" onClose={()=>setServiceModal(prevState=>!prevState)}>
        <DialogTitle>
          Novo Serviço
        </DialogTitle>
        <DialogContent className={classes.dialog}>
          <Select
            defaultValue={game[0] ? game[0][8] : ''}
            options={generateServicesOptions()}
            onChange={event=>{
              setSelectedService(event)
            }}
          />
          <Button variant="contained" color="primary" className={classes.button} onClick={()=>{socket.emit('ativar-servico', selectedService.value)}}>
            Adicionar Serviço
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={downloadModal} aria-labelledby="simple-dialog-title" onClose={()=>setDownloadModal(prevState=>!prevState)}>
        <DialogTitle>
          Selecione um turno
        </DialogTitle>
        <DialogContent className={classes.dialog}>
          <Select
            defaultValue={game[30] ? game[30]-1 : 0}
            options={generateRounds()}
            onChange={event=>{
              setRound(event.value)
            }}
          />
          <Button
            onClick={round ? history.push(`/reports/${round}`) : null}
          >
            Ver Demonstrativos
          </Button>
          
        </DialogContent>
      </Dialog>
      <Grid container justify="center" spacing={2}>
        <Grid item sm={12}>
          <GeneralInformation isAdmin={false} gameData={game}/>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Paper className={classes.paper}>
            <Research gameData={game} />
          </Paper>
        </Grid>
        {generateServices(game.slice(0,21))}
        <Grid item xs={12} sm={12}>
          <Button variant="contained" color="primary" className={classes.button} onClick={()=>setServiceModal(true)}> 
            Novo Serviço
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={()=>{setDownloadModal(true)}}> 
            Balanço
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={()=>{socket.emit('salvar')}}> 
            Salvar
          </Button>
          <Button className={classes.button} onClick={()=>{socket.emit('resetar')}}> 
            Resetar Jogada
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}