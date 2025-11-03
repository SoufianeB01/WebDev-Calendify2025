import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './loginPage/Login';



function App() {
   const [counter, setCounter] = useState<number>(0);

  return (
    <div className="App">
      <header className="App-header">
    
        
        <Login></Login>

      </header>
    </div>
  );
}

export default App;
