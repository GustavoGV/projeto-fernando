import React from 'react';
import { Formik } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  form: {
    display:'flex',
    flexDirection: 'column',
  },
  textField: {
    margin: '10px',
  },
}));

const Service = (props) => {

  const classes = useStyles();

  return(
  <div>
    <h3>{props.serviceName}</h3>
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={values => {
        const errors = {};
        if (!values.email) {
          errors.email = 'Required';
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        ) {
          errors.email = 'Invalid email address';
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Previsão de Contratos Fechados"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          {errors.email && touched.email && errors.email}
          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Capacidade Instalada"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          {errors.password && touched.password && errors.password}
          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Recursos Contratados"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Capacidade Disponível"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Investimento em Propaganda do Modelo de Serviço"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Equipe de Promoção"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Comissão de Vendas"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Postos Avançados"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Frota Inicial"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Alteração na Frota"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Frota Atual"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Pesquisas de Mercado"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Teste entre Serviço"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Tipos de Serviço dos Concorrentes"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Postos Avançados dos Concorrentes"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Número de Promotores"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Comissão pelos Concorrentes"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />

          <TextField
            type="text"
            name="text"
            id="standard-basic"
            label="Share em Unidade dos Concorrentes"
            handle
            className={classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      )}
    </Formik>
  </div>
)};

export default Service;