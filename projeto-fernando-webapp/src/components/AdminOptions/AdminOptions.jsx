import React, { useEffect } from 'react';
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

  useEffect(()=>{
    socket.emit('state-global')
    socket.on('state-global', state => {

    })
    return ()=>{
      socket.off('state-global')
    }
  })

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
      <br/>
      <br/>

    </>
  )
}

export default AdminOptions;