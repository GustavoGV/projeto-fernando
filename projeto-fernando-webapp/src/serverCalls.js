import socket from './connection';

export function login(creden){
  socket.emit('login-client', creden)
  console.log('login sent:', creden)
}

export function register(creden){
  socket.emit('register-client', creden)
  console.log('register sent:', creden);
}