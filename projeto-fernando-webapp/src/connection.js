import io from 'socket.io-client'

const socket = io('http://104.41.52.145:3000')
socket.on('connect', () => {
                            socket.emit('teste', socket.id)
                           })
export default socket;