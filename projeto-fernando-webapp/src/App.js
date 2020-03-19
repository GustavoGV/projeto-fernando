import React from 'react';
import logo from './logo.svg';
import video from './assets/video.mp4';
import './App.css';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Em construção
        </p>
        <video width="640" height="480" controls>
          <source src={video} type="video/mp4">
          </source>
        </video>
        
      </header>
    </div>
  );
}

export default App;
