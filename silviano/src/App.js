import React from "react";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.main.css";
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import "primeicons.css";
import './App.css';

function App() {
  return (


    <BrowserRouter>
      <Switch>
        <Route exact path="/"> en esora de home 
   
        </Route>
      </Switch>
      
   <div>
     <h3>Probado la aplicacion</h3>
   </div>

    </BrowserRouter>

  );
}

export default App;
