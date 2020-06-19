import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import socket from '../../connection';
import Select from 'react-select';
import GeneralInformation from '../GeneralInformation/GeneralInformation';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Row } from 'reactstrap';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import CsvDownload from 'react-json-to-csv';
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
    marginRight:'16px',
  },
  h3:{
    color:'rgba(0, 0, 0, 0.54)',
    margin: '10px 0px',
  }
}));

function AdminOptions(){

  const [globalState, setGlobalState] = useState([]);
  const [selectedState, setSelectedState] = useState({});
  const [modal, setModal] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState({});
  const [round, setRound] = useState();
  const history = useHistory();

  const classes = useStyles();

  function generateOptions(){
    const options = [{value:-1, label:'Selecione uma cooperativa'}];
    globalState.forEach((user, index)=>{
      options.push({value:index, label:user[31]});
    })
    return options;
  }

  function startRound(){
    socket.emit('iniciar-turno')
  }

  function finishRound(){
    socket.emit('finalizar-turno')
  }

  useEffect(()=>{
    socket.emit('puxar-tds-states');
    socket.on('final-turno',()=>{
      socket.emit('puxar-state');

    });
    socket.on('tds-states', state => {
      console.log("global state:", state);
      setGlobalState(state);
    })
    socket.on('balancos-adm', balanco => {
      setDownloadInfo(balanco)
    })
    return ()=>{
      socket.off('state-global')
    }
  },[])

  const options = generateOptions();
  const gameData = globalState.find(user => user[31] === selectedState.label);
  const activeServices = gameData ? gameData.slice(0,21).filter(service => service[1] === 1) : null;
  const activeServicesNames = activeServices ? activeServices.map(activeService => activeService[8]).join(", ") : null;
  const currentRound = gameData ? gameData[30] || 0 : 0;

  function generateRounds(){
    const currentRound = gameData ? gameData[30] || 0 : 0;
    let rounds = []
    let i;
    for(i=1; i<currentRound; i++){
      rounds.push({value:i, label:i});
    }
    return rounds
  }

  let rounds = []
  for(var i=1; i===currentRound; i++){
    rounds.push(i);
  }
  
  return(
    <>
      <Dialog open={modal} aria-labelledby="simple-dialog-title" onClose={()=>setModal(!modal)}>
        <DialogTitle>
          Selecione um turno
        </DialogTitle>
        <DialogContent>
          <Select
            defaultValue={currentRound}
            options={generateRounds()}
            onChange={event=>{
              setRound(event.value);
            }}
          />
          <Button onClick={()=>{
            history.push(`/reports/${round}`)
          }}>
            Ver Balanços
          </Button>
        </DialogContent>
        
      </Dialog>
      <Row>
        <Button className={classes.button} onClick={()=>startRound()} variant="contained" color="primary">
          Iniciar Turno
        </Button>
        <Button onClick={()=>finishRound()} variant="contained" color="primary">
          Finalizar Turno
        </Button>
      </Row>
      <br/>
      <h3 className={classes.h3}>Selecione a cooperativa desejada:</h3>
      <Select
        defaultValue={options[-1]}
        options={options}
        onChange={event=>setSelectedState(event)}
      />
      <br/>
      <br/>
      {(selectedState.label && selectedState.label!=="Selecione uma cooperativa" )
      ?<GeneralInformation isAdmin={true} gameData={gameData}>
        <Grid item xs={12} sm={12} md={12}>
          <Paper className={classes.paper}>
            <h3>Serviços Ativos</h3>
            <br/>
            <h4>{activeServicesNames}</h4>
          </Paper>
        </Grid>
        <br/>
        <Button className={classes.button} onClick={()=>setModal(true)} variant="contained" color="primary">
          Balanços
        </Button>
      </GeneralInformation>
      : null
      }

    </>
  )
}

export default AdminOptions;