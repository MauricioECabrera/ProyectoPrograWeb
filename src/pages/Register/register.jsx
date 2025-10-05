import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = ({ name, email, password, confirmPassword }) => {
    if (!name.trim()) {
      return { isValid: false, error: "El nombre completo es obligatorio" };
    }
    if (!email.trim()) {
      return { isValid: false, error: "El correo electrónico es obligatorio" };
    }
    if (!password) {
      return { isValid: false, error: "La contraseña es obligatoria" };
    }
    if (!confirmPassword) {
      return { isValid: false, error: "Debes confirmar tu contraseña" };
    }
    if (!validateEmail(email)) {
      return { isValid: false, error: "Por favor ingresa un correo electrónico válido" };
    }
    if (password.length < 6) {
      return { isValid: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }
    if (password !== confirmPassword) {
      return { isValid: false, error: "Las contraseñas no coinciden" };
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

  const validation = validateForm(formData);

  if (!validation.isValid) {
    showPopup("error", "Error de validación", validation.error);
    return;
  }

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup("error", "Error al registrarse", data.message || "No se pudo crear la cuenta");
      return;
    }

    showPopup("success", "¡Registro exitoso!", "Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.");

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } catch (err) {
    console.error(err);
    showPopup("error", "Error de conexión", "No se pudo conectar con el servidor. Intenta nuevamente.");
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
                {popup.type === "error" ? "⚠️" : "✅"}
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

      {/* Register Container */}
      <div className="login-container">
        <div className="logo">
          <img src="/Assets/logo-anima.png" alt="Logo" />
        </div>

        <h1>Crear Cuenta</h1>
        <p>
          Únete a <strong>Ánima</strong> y comienza ahora
        </p>

        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              placeholder="Tu nombre"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirm-password">Confirmar contraseña</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="********"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button type="submit" className="btn">
            Registrarse
          </button>
        </form>

        <div className="extra-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </>
  );
}
