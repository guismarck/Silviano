import React from "react";
// import "primereact/resources/themes/lara-light-cyan/theme.css";
// import "primereact/resources/primereact.main.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "primeicons.css";
// import './App.css';
import ListarGrados from "./Componetes/controllers/ListarGrados";

function App() {
  console.log('Hi broooo')
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>HELLO MOTO</h1>}/>
        <Route path="/grados" element={<ListarGrados/>}/>
          
      </Routes>
    </BrowserRouter>

  );
}

export default App;
