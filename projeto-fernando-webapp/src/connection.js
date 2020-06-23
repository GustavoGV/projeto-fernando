import io from 'socket.io-client'

const socket = io('http://api.desafiosdegestao.com.br:3000')
socket.on('connect', () => {
                            socket.emit('teste', 'ID: ' + socket.id + ' (REACT-APP connected with SOCKET)')
                           })
export default socket;