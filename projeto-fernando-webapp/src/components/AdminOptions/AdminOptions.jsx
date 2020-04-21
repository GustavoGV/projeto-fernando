import React from 'react';
import Button from '@material-ui/core/Button';
import socket from '../../connection';

function AdminOptions(){

  function startRound(){
    console.log('iniciando o turno')
    socket.emit('iniciar-turno')
  }

  function finishRound(){
    console.log('finalizando o turno')
    socket.emit('finalizar-turno')
  }

  return(
    <>
      <Button onClick={()=>startRound()} variant="contained" color="primary">
        Iniciar Turno
      </Button>
      <br/>
      <br/>
      <Button onClick={()=>finishRound()} variant="contained" color="primary">
        Finalizar Turno
      </Button>
    </>
  )
}

export default AdminOptions;