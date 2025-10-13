// src/components/Navbar/Navbar.jsx
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ variant = "default" }) {
  // Diferentes variantes de navegación según la página
  const navOptions = {
    default: [
      { to: "/register", text: "Crear cuenta", className: "nav-link" },
      { to: "/login", text: "Iniciar sesión", className: "nav-link btn-outline" }
    ],
    login: [
      { to: "/register", text: "Crear cuenta", className: "nav-link" },
      { to: "/index", text: "Volver al inicio", className: "nav-link btn-outline" }
    ],
    register: [
      { to: "/login", text: "Iniciar sesión", className: "nav-link" },
      { to: "/index", text: "Volver al inicio", className: "nav-link btn-outline" }
    ],
    recovery: [
      { to: "/login", text: "Iniciar sesión", className: "nav-link" },
      { to: "/index", text: "Volver al inicio", className: "nav-link btn-outline" }
    ]
  };

  const links = navOptions[variant] || navOptions.default;

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/index" className="logo-header">
            <img className="logo-img" src="/Assets/logo-anima.png" alt="Logo Ánima" />
            <span className="logo-text">Ánima</span>
          </Link>
          <div className="nav-links">
            {links.map((link, index) => (
              <Link key={index} to={link.to} className={link.className}>
                {link.text}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}