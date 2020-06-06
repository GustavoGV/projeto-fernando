import io from 'socket.io-client'

const socket = io('http://api.desafiosdegestao.com.br:3000')
socket.on('connect', () => {
                            socket.emit('teste', socket.id)
                           })
export default socket;