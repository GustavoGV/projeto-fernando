import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Game from './components/Game/Game';
import video from './assets/video.mp4';
import './App.css';

function App() {
  return (
    <BrowserRouter>
        <Switch>
            <Route path="/login" component={Login} />
            <Route path="/game" component={Game}/>
        </Switch>
    </ BrowserRouter>
  );
}

export default App;
