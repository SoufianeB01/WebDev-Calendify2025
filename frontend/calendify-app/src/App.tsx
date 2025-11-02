import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './loginPage/Login';
import MyComponent from './MyComponent';
import { Fun } from './Functional';


function App() {
   const [counter, setCounter] = useState<number>(0);

  return (
    <div className="App">
      <header className="App-header">
        <MyComponent></MyComponent>
        
        <Login></Login>
        <Fun counter={counter} setCounter={setCounter} name={"my cuner"}></Fun>
        <Fun counter={counter} setCounter={setCounter} name={"my cunter"}></Fun>
      </header>
    </div>
  );
}

export default App;
