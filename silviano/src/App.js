import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import './App.css';
import ListarGrados from "./Componetes/Academico/controllers/ListarGrados";
import Estudiantes from "./Componetes/Academico/controllers/Estudiantes"
import AgregarGrados from "./Componetes/Academico/controllers/AgregarGrados";
import "./estilosCSS/flags.css"
import "./index.css"


function App() {
  console.log('Hi broooo')
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1></h1>}/> entutamineto de inicio
        <Route path="/grados" element={<ListarGrados/>}/> en rutamiento de grados 
        <Route path="/agregargados" element={<AgregarGrados/>}/> en rutamiento de grados 
        <Route path="/estudiantes" element={<Estudiantes/>} /*{<h1>estudiante</h1>}*//>  
      </Routes>
    </BrowserRouter>

  );
}

export default App;
