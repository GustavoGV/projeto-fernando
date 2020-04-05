import React from 'react'
import chroma from 'chroma-js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Select from 'react-select';

function Research(props) {

  const options=[
    {value:'', label:'Não realizar uma pesquisa'},
    {value:'', label:'Modelos de serviços oferecidos pela concorrência'},
    {value:'', label:'Intensidade de distribuidores da concorrência'},
    {value:'', label:'Quantidade de postos avançados de serviços (PAS)'},
    {value:'', label:'Participação da concorrência – serviço único'},
    {value:'', label:'Participação da concorrência – serviços múltiplos'},
  ]
  return(
    <>
      <h3>Pesquisas</h3>
      <Select
        defaultValue={options[0]}
        options={options}
      />
      
    </>
  )
}

export default Research