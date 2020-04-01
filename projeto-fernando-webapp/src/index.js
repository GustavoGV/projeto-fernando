import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import io from 'socket.io-client'

const socket = io('http://api.desafiosdegestao.com.br:3000')
socket.on('connect', () => console.log('Nova concexao sokcet estabelecida com id: ' + socket.id))
socket.emit('teste', 'bananeira')


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
