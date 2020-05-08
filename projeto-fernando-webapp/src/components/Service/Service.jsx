import React, { useState } from 'react';
import {Form, Input} from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
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
  }
}));

const Service = (props) => {

  const classes = useStyles();
  const [roundData, setRoundData] = useState();
  const options=[
    {value:'', label:'Serviço que terá insumos transferidos'},
    {value:'', label:'Serviço 1'},
    {value:'', label:'Serviço 2'},
    {value:'', label:'Serviço 3'},
    {value:'', label:'Serviço 4'},
    {value:'', label:'Serviço 5'},
  ]

  return(
  <div>
    <h3>{props.serviceName}</h3>
    <Form className={classes.form}>
      <label className={classes.label}>Comprar Insumos</label>
      <Input
        onChange={(event)=>{setRoundData({resourcesAmount:event.target.value})}}
        placeholder='Quantidade de Insumos'
      />
      <label className={classes.label}>Transferir insumos para outro serviço</label>
      <Select
        defaultValue={options[0]}
        options={options}
        onChange={event=>setRoundData({serviceToTranfer:event.target.value})}
      />
      <Input
        onChange={(event)=>{setRoundData({resourcesAmountToTransfer:event.target.value})}}
        placeholder='Quantidade de Insumos'
        onBlur={()=>{socket.emit('comprar-servico',[roundData.serviceToTranfer, roundData.resourcesAmountToTransfer])}}
      />
      <label className={classes.label}>Investimento em propaganda para este serviço</label>
      <Input
        onChange={(event)=>{setRoundData({unitaryAdsInvestiment:event.target.value})}}
        placeholder='Investimento'
        onBlur={()=>{console.log("propaganda unitaria", typeof(Number(roundData.unitaryAdsInvestiment)), Number(roundData.unitaryAdsInvestiment)); socket.emit('propaganda-unitaria', [0,roundData.unitaryAdsInvestiment])}}
      />
      <label className={classes.label}>Contratar vendedores</label>      
      <Input
        onChange={(event)=>{setRoundData({hireSalespeople:event.target.value})}}
        placeholder='Vendedores'
        //onBlur={()=>socket.emit()}
      />
      <label className={classes.label}>Demitir vendedores</label>
      <Input onChange={(event)=>{setRoundData({adInvestment:event.target.value})}} placeholder='Vendedores'/>
      <label className={classes.label}>Aumentar a frota de veículos</label>
      <Input
        onChange={(event)=>{setRoundData({vehiclesToIncrease:event.target.value})}}
        placeholder='Veículos'
        onBlur={()=>{socket.emit('aumentar-frota', roundData.vehiclesToIncrease)}}
      />
      <label className={classes.label}>Diminuir a frota de veículos</label>
      <Input
        onChange={(event)=>{setRoundData({vehiclesToDecrease:event.target.value})}}
        placeholder='Veículos'
        onBlur={()=>{socket.emit('diminuir-frota', roundData.vehiclesToDecrease)}}
      />
    </Form>
  </div>
)};

export default Service;