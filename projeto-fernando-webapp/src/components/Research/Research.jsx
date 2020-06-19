import React, {useState, useEffect} from 'react'
import {Form, Input} from 'reactstrap';
import Button from '@material-ui/core/Button';
import Select from 'react-select';
import socket from '../../connection';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  form: {
    display:'flex',
    flexDirection: 'column',
  },
  textField: {
    margin: '10px',
  },
  label: {
    textAlign:'initial',
  },
  button: {
    marginLeft:'auto',
    marginRight:'auto',
  },
  select: {
    margin: '10px',
  }
}));

function Research(props) {

  const options=[
    {value:'01', label:'Não realizar uma pesquisa'},
    {value:'02', label:'Modelos de serviços oferecidos pela concorrência'},
    {value:'03', label:'Intensidade de distribuidores da concorrência'},
    {value:'04', label:'Quantidade de postos avançados de serviços (PAS)'},
    {value:'05', label:'Participação da concorrência – serviço único'},
    {value:'06', label:'Participação da concorrência – serviços múltiplos'},
  ]

  const [researchData, setResearchData] = useState({});
  const [response, setResponse] = useState(null)
  const classes = useStyles();

  const serviceOptions = generateAllOptions();
  
  function generateAllOptions(){
    let options=[];
    props.gameData.slice(0,21).forEach(activeService=>{
      options.push({value:activeService[8], label:activeService[8]})
    });
    return options
  }

  function doResearch(){
    switch(researchData.researchType){
      case '01':
        return;
      case '02':
        socket.emit('pesquisar-servicos-oferecidos-concorrencia');
        break;
      case '03':
        socket.emit('pesquisar-distribuidores');
        break;
      case '04':
        socket.emit('pesquisar-pas')
        break;
      case '05':
        socket.emit('pesquisar-participacao-servicos', [researchData.researchService1])
        break;
      case '06':
          socket.emit('pesquisar-participacao-servicos', [researchData.researchService1, researchData.researchService2])
        break;
      default:
        return
    }
  }

  useEffect(()=>{
    socket.on('resposta-pesquisa', response => {
      setResponse(response);
    })
  },[])

  return(
    <>
      <h3>Pesquisas</h3>
      <Form className={classes.form}>
      <Select
        defaultValue={''}
        options={options}
        onChange={event=>setResearchData({...researchData, researchType:event.value})}
        className={classes.select}
      />
      {researchData.researchType==='05'
      ?
      <div>
        <Select
          defaultValue={''}
          options={serviceOptions}
          onChange={event=>setResearchData({...researchData, researchService1:event.value})}
          className={classes.select}
        />
      </div>
      :null}

      {researchData.researchType==='06'
      ?
      <div>
        <Select
          defaultValue={''}
          options={serviceOptions}
          onChange={event=>setResearchData({...researchData, researchService1:event.value})}
          className={classes.select}
        />
        <Select
          defaultValue={''}
          options={serviceOptions}
          onChange={event=>setResearchData({...researchData, researchService2:event.value})}
          className={classes.select}
        />
      </div>
      :null}

      <Button variant="contained" color="primary" style={{margin:'16px'}} onClick={()=> doResearch()}>
        Pesquisar
      </Button>

      {
        response !== null
        ?(
          <>
            <label>Resultado:</label>
            {response}
          </>
        )
        :null
      }
      
      
      </Form>
      
    </>
  )
}

export default Research