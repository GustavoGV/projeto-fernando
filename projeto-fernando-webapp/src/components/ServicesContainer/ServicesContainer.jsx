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
  }
}));

export default function ServicesContainer() {

  const classes = useStyles();
  const [game, setGame] = useState([])
  const [downloadModal, setDownloadModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState({})
  const currentRound = game[30] ? game[30] : 0;
  let rounds = []
  for(var i=1; i===currentRound; i++){
    rounds.push(i);
  }

  useEffect(()=>{
    socket.emit('puxar-state');
    socket.on('update', state => {
      console.log('estado atual: ', state)
      setGame(state)
    socket.on('balancos', balanco => {
      setDownloadInfo(balanco)
    })
    return ()=>{
      socket.off('update');
    }
    })
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
    return game.slice(0,21).map(service=>service[8])
  }

  return (
    <div className={classes.root}>
      <Dialog open={serviceModal} aria-labelledby="simple-dialog-title" onClose={()=>setServiceModal(prevState=>!prevState)}>
        <DialogTitle>
          Novo Serviço
        </DialogTitle>
        <DialogContent>
          <Select
            defaultValue={game[0] ? game[0][8] : ''}
            options={generateServicesOptions()}
            onChange={event=>{
              setSelectedService(event)
            }}
          />
          <Button onClick={()=>{socket.emit('ativar-servico', selectedService)}}>
            Adicionar Serviço
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={downloadModal} aria-labelledby="simple-dialog-title" onClose={()=>setDownloadModal(prevState=>!prevState)}>
        <DialogTitle>
          Selecione um turno
        </DialogTitle>
        <DialogContent>
          <Select
            defaultValue={currentRound}
            options={rounds}
            onChange={event=>{
              socket.emit('puxar-balancos-adm', [event])
            }}
          />
          <CsvDownload data={downloadInfo}>
            Baixar Balanços
          </CsvDownload>
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
          <Button variant="contained" color="primary" className={classes.button} onClick={()=>{socket.emit('salvar')}}> 
            Baixar Balanço
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={()=>{socket.emit('salvar')}}> 
            Salvar
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}