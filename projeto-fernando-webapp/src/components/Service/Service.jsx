import React from 'react';
import { Formik } from 'formik';
import {Form, Input} from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import useRound from '../../hooks/useRound';

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
  const [roundData, addNewValue] = useRound()

  return(
  <div>
    <h3>{props.serviceName}</h3>
    <Form className={classes.form}>
      <label className={classes.label}>Comprar Insumos</label>
      <Input onChange={(event)=>{addNewValue({closedContractsForecast:event.target.value})}} placeholder='Quantidade de Insumos'/>
      <label className={classes.label}>Transferir insumos para outro serviço</label>
      <Input onChange={(event)=>{addNewValue({installedCapacity:event.target.value})}} placeholder='Quantidade de Insumos'/>
      <label className={classes.label}>Investimento em propaganda para este serviço</label>
      <Input onChange={(event)=>{addNewValue({contractedResources:event.target.value})}} placeholder='Investimento'/>
      <label className={classes.label}>Contratar vendedores</label>      
      <Input onChange={(event)=>{addNewValue({availableCapacity:event.target.value})}} placeholder='Vendedores'/>
      <label className={classes.label}>Demitir vendedores</label>
      <Input onChange={(event)=>{addNewValue({adInvestment:event.target.value})}} placeholder='Vendedores'/>
      <label className={classes.label}>Aumentar a frota de veículos</label>
      <Input onChange={(event)=>{addNewValue({promotionTeam:event.target.value})}} placeholder='Veículos'/>
      <label className={classes.label}>Diminuir a frota de veículos</label>
      <Input onChange={(event)=>{addNewValue({salesCommission:event.target.value})}} placeholder='Veículos'/>
      <label className={classes.label}>Aumentar número de varejistas</label>
      <Input onChange={(event)=>{addNewValue({outposts:event.target.value})}} placeholder='Varejistas'/>
      <label className={classes.label}>Diminuir número de varejistas</label>
      <Input onChange={(event)=>{addNewValue({initialFleet:event.target.value})}} placeholder='Varejistas'/>
    </Form>
  </div>
)};

export default Service;