import React, { useEffect, useRef } from 'react';
import Normalize from 'react-normalize';
import { Switch, Route, Redirect, useHistory} from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Game from './components/Game/Game';
import LoginAdmin from './components/LoginAdmin/LoginAdmin';
import NotificationAlert from 'react-notification-alert';
import './App.css';
import "react-notification-alert/dist/animate.css";
import './alerts.css';


import socket from './connection.js';
import { Button } from '@material-ui/core';
import PanelAdmin from './components/PanelAdmin/PanelAdmin';

function App() {

  const notificationAlert = useRef(null);
  const history = useHistory()
  console.log("history", history);

  useEffect(()=>{
    socket.on('feedback', feedback => {
      console.log(feedback);
      var options = {
        place: 'tc' ,
        message: (
          <div>
            <div className='alert-message'>
              {feedback[1]}
            </div>
          </div>
        ),
        type: feedback[0],
        icon: 'fas fa-bell',
        autoDismiss: 3,
        closeButton: false,
      }
      if(feedback[0]==="danger" && feedback[1]==="voce precisa estar logado para puxar o state atual da simulação"){
        if(history.location.pathname.includes('admin')){
          history.push('/admin/login');
        }
        else{
          history.push('/');
        }
      }
      notificationAlert.current.notificationAlert(options);
    })
  },[])

  return (
      <>
        <NotificationAlert ref={notificationAlert} />
        <Normalize/>
        <Switch>
            <Route exact path="/">
              <Redirect to="/login"/>
            </Route>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/game" component={Game} />
            <Route path="/admin">
              <Route path="/admin/login">
                <LoginAdmin/>
              </Route>
              <Route path="/admin/panel">
                <PanelAdmin/>
              </Route>
            </Route>
        </Switch>
      </>
  );
}

export default App;
 