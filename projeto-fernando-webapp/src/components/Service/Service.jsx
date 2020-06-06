import React, { useState, useEffect } from 'react';
import {Form, Input} from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Select from 'react-select';
import socket from '../../connection';


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
  dialog:{
    height:'400px',
  }
}));

const Service = (props) => {

  const classes = useStyles();
  const [roundData, setRoundData] = useState({volume:0, price:0});
  const [changeServiceModal, setChangeServiceModal] = useState(false);
  const options=generateOptions();
  const allOptions=generateAllOptions();

  useEffect(()=>{
    socket.on('resetado', () => {
      setRoundData({volume:0, price:0});
    });
  })

  function generateOptions(){
    let options=[];
    props.game.slice(0,21).filter(service=>service[1]===1).forEach(activeService=>{
      options.push({value:activeService[8], label:activeService[8]})
    });
    return options
  }

  function generateAllOptions(){
    let options=[];
    props.game.slice(0,21).forEach(activeService=>{
      options.push({value:activeService[8], label:activeService[8]})
    });
    return options
  }

  return(
  <div>
    <Dialog open={changeServiceModal} aria-labelledby="simple-dialog-title" onClose={()=>setChangeServiceModal(!changeServiceModal)}>
      <DialogTitle id="simple-dialog-title">Escolha a sua Simulação</DialogTitle>
      <DialogContent className={classes.dialog}>
      <Select
        defaultValue={allOptions[0]}
        options={allOptions}
        onChange={event=>setRoundData({...roundData, serviceToSubstitute:event.value})}
      />
      <Button className={classes.button} onClick={()=>{socket.emit('substituir-servico', [props.service[8], roundData.serviceToSubstitute])}}>
        Substituir
      </Button>
      </DialogContent>
    </Dialog>
    <h3>Serviço {props.service[8]}</h3>
    <h4>Insumos: {Math.round(props.service[0])}</h4>
    <h4>Custo Unitário: {Math.round(props.service[2])}</h4>
    <Form className={classes.form}>
      <label className={classes.label}>Comprar Insumos</label>
      <Input
        onChange={(event)=>{setRoundData({...roundData, resourcesAmount:event.target.value})}}
        placeholder='Quantidade de Insumos'
        onBlur={()=>{socket.emit('comprar-servico',[props.service[8], roundData.resourcesAmount])}}
      />
      <label className={classes.label}>Transferir insumos para outro serviço</label>
      <Select
        defaultValue={options[0]}
        options={options}
        onChange={event=>setRoundData({...roundData, serviceToTranfer:event.value})}
      />
      <Input
        onChange={(event)=>{setRoundData({...roundData, resourcesAmountToTransfer:event.target.value})}}
        placeholder='Quantidade de Insumos'
        onBlur={()=>{socket.emit('trocar-servico',[props.service[8],roundData.serviceToTranfer, roundData.resourcesAmountToTransfer])}}
      />
      <label className={classes.label}>Investimento em propaganda para este serviço</label>
      <Input
        onChange={(event)=>{setRoundData({...roundData, unitaryAdsInvestiment:event.target.value})}}
        placeholder='Investimento'
        onBlur={()=>{socket.emit('propaganda-unitaria', [roundData.unitaryAdsInvestiment])}}
      />
      <label className={classes.label}>Alterar Volume</label>
      <Input
        onChange={(event)=>{setRoundData({...roundData, volume:event.target.value})}}
        placeholder='Volume'
        onBlur={()=>{socket.emit('alterar-volume',[props.service[8],roundData.volume])}}
      />
      <label className={classes.label}>Alterar Preço</label>
      <Input
        onChange={(event)=>{setRoundData({...roundData, price:event.target.value})}}
        placeholder='Preço'
        onBlur={()=>{socket.emit('alterar-preco',[props.service[8],roundData.price])}}
      />
      <Button onClick={()=>setChangeServiceModal(true)}>
        Substituir Serviço
      </Button>
      <Button onClick={()=>socket.emit('encerrar-servico', props.service[8])}>
        Encerrar Serviço
      </Button>
    </Form>
  </div>
)};

export default Service;