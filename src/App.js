// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Bienvenida: usamos index.jsx dentro de la carpeta
import Bienvenida from "./pages/Bienvenida/index";


// Estos tres están como Nombre/Nombre.jsx
import Login from "./pages/Login/login";
import Register from "./pages/Register/register";
import Principal from "./pages/Principal/principal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/index" replace />} />
        <Route path="/index" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
