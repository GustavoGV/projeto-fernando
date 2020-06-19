import socket from './connection';

export function login(creden){
  socket.emit('login-client', creden)
}

export function register(creden){
  socket.emit('register-client', creden)
}