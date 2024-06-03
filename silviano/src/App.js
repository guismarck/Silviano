import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
//import '../App.css';
import ListarGrados from "./Componetes/Academico/controllers/ListarGrados";
import Estudiantes from "./Componetes/Academico/controllers/Estudiantes"
import AgregarGrados from "./Componetes/Academico/controllers/AgregarGrados";
import "./estilosCSS/flags.css"
import "./index.css"
import ListMatriculas from "./Servicios/MatriculasServicios/ListMatriculas";
import ListarCatalogoSalon from "./Componetes/Academico/controllers/ListarCatalogoSalon";
// import AgregarSalon from "./Componetes/Academico/controllers/AgregarSalon";


function App() {
  console.log('Hi broooo')
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1></h1>}/>
        <Route path="/grados" element={<ListarGrados/>}/>
        <Route path="/agregargados" element={<AgregarGrados/>}/>
        <Route path="/salon" element={<ListarCatalogoSalon/>}/>
        {/*<Route path="/catalogo/salon" element={<Estudiantes/>}/>*/}
        {/*<Route path="/catalogo/salon/create" element={<AgregarSalon/>}/>*/}
        <Route path="/estudiantes" element={<Estudiantes/>} /*{<h1>estudiante</h1>}*//>  
        <Route path="/matriculas" element={<ListMatriculas/>} /*{<h1>estudiante</h1>}*//>
      </Routes>
    </BrowserRouter>

  );
}

export default App;
