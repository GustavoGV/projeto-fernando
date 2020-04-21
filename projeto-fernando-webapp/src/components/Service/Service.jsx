import React, { useState } from 'react';
import {Form, Input} from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Select from 'react-select';

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
      <Input onChange={(event)=>{setRoundData({closedContractsForecast:event.target.value})}} placeholder='Quantidade de Insumos'/>
      <label className={classes.label}>Transferir insumos para outro serviço</label>
      <Select
        defaultValue={options[0]}
        options={options}
      />
      <Input onChange={(event)=>{setRoundData({installedCapacity:event.target.value})}} placeholder='Quantidade de Insumos'/>
      <label className={classes.label}>Investimento em propaganda para este serviço</label>
      <Input onChange={(event)=>{setRoundData({contractedResources:event.target.value})}} placeholder='Investimento'/>
      <label className={classes.label}>Contratar vendedores</label>      
      <Input onChange={(event)=>{setRoundData({availableCapacity:event.target.value})}} placeholder='Vendedores'/>
      <label className={classes.label}>Demitir vendedores</label>
      <Input onChange={(event)=>{setRoundData({adInvestment:event.target.value})}} placeholder='Vendedores'/>
      <label className={classes.label}>Aumentar a frota de veículos</label>
      <Input onChange={(event)=>{setRoundData({promotionTeam:event.target.value})}} placeholder='Veículos'/>
      <label className={classes.label}>Diminuir a frota de veículos</label>
      <Input onChange={(event)=>{setRoundData({salesCommission:event.target.value})}} placeholder='Veículos'/>
      <label className={classes.label}>Aumentar número de varejistas</label>
      <Input onChange={(event)=>{setRoundData({outposts:event.target.value})}} placeholder='Varejistas'/>
      <label className={classes.label}>Diminuir número de varejistas</label>
      <Input onChange={(event)=>{setRoundData({initialFleet:event.target.value})}} placeholder='Varejistas'/>
    </Form>
  </div>
)};

export default Service;