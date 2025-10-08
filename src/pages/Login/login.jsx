import { useState } from "react";
import { Link } from "react-router-dom";
import { login as apiLogin } from '../../utils/api';
import "./login.css";

export default function Login() {
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({ email: "", password: "" });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = ({ email, password }) => {
    if (!email.trim()) {
      return { isValid: false, error: "El correo electrónico es obligatorio" };
    }
    if (!password) {
      return { isValid: false, error: "La contraseña es obligatoria" };
    }
    if (!validateEmail(email)) {
      return { isValid: false, error: "Por favor ingresa un correo electrónico válido" };
    }
    return { isValid: true };
  };

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, show: false });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const validation = validateLoginForm(formData);

  if (!validation.isValid) {
    showPopup("error", "Error de validación", validation.error);
    return;
  }

  try {
    const data = await apiLogin(formData.email, formData.password);

    // Guardar token y usuario en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showPopup("success", "¡Inicio de sesión exitoso!", "Bienvenido de nuevo. Serás redirigido a la aplicación principal.");

    setTimeout(() => {
      window.location.href = "/principal"; // redirigir a la vista principal
    }, 2000);
  } catch (err) {
    console.error(err);
    showPopup("error", "Error de conexión", err.message || "No se pudo conectar con el servidor. Intenta nuevamente.");
  }
};


  return (
    <>
      {/* Popup */}
      {popup.show && (
        <div id="popup-overlay" className="popup-overlay show" onClick={closePopup}>
          <div className={`popup popup-${popup.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <span id="popup-icon" className="popup-icon">
                {popup.type === "error" ? "⚠️" : popup.type === "success" ? "✅" : "ℹ️"}
              </span>
              <h3 className="popup-title">{popup.title}</h3>
            </div>
            <p className="popup-message">{popup.message}</p>
            <button id="popup-close" className="popup-btn" onClick={closePopup}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Login Container */}
      <div className="login-container">
        <div className="logo">
          <img src="/Assets/logo-anima.png" alt="Logo" />
        </div>

        <h1>Iniciar Sesión</h1>
        <p>
          Bienvenido de nuevo a <strong>Ánima</strong>
        </p>

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tu@email.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn">
            Entrar
          </button>
        </form>

        <div className="extra-links">
          <Link to="/recuperar-contrasena" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
          <br />
          <br />
          <Link to="/register" className="create-account">
            Crear una cuenta nueva
          </Link>
        </div>

        {/* Botón de regreso al inicio */}
        <div className="back-to-home">
          <Link to="/index" className="btn-secondary">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </>
  );
}