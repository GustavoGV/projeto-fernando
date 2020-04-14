import React from 'react';
import Normalize from 'react-normalize';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Game from './components/Game/Game';
import './App.css';

import socket from './connection.js';

//socket.emit('teste', 'Enviando-info');
//socket.emit('teste', 'Mais-info')


function App() {
  return (
    <BrowserRouter>
        <Normalize/>
        <Switch>
            <Route exact path="/">
              <Redirect to="/login"/>
            </Route>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/game" component={Game} />
        </Switch>
    </ BrowserRouter>
  );
}

export default App;
 