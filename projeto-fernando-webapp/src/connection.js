import io from 'socket.io-client'

const socket = io('http://api.desafiosdegestao.com.br:3000')
socket.on('connect', () => {
                            console.log('Nova concexao sokcet estabelecida com id: ' + socket.id);
                            socket.emit('teste', socket.id)
                           })
export default socket;