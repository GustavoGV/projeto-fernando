import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Login from './components/Login/Login';
import Game from './components/Game/Game';
import './App.css';



function App() {
  return (
    <BrowserRouter>
        <Switch>
            <Route exact path="/">
              <Redirect to="/login"/>
            </Route>
            <Route path="/login" component={Login} />
            <Route path="/game" component={Game}/>
        </Switch>
    </ BrowserRouter>
  );
}

export default App;
 