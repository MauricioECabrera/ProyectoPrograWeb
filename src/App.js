// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas
import Bienvenida from "./pages/Bienvenida/index";
import Login from "./pages/Login/login";
import Register from "./pages/Register/register";
import Principal from "./pages/Principal/principal";
import RecuperacionContrasena from "./pages/RecuperacionContrasena/RecuperacionContrasena";

// Componente de protección de rutas
import ProtectedRoute from "./components/ProtectRout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/index" replace />} />
        <Route path="/index" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-contrasena" element={<RecuperacionContrasena />} />
        
        {/* Ruta protegida - Solo accesible con autenticación */}
        <Route 
          path="/principal" 
          element={
            <ProtectedRoute>
              <Principal />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}