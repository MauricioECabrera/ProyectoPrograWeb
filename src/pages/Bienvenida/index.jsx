import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

export default function Bienvenida() {
  useEffect(() => {
    // Animaciones al hacer scroll
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = "0.2s";
          entry.target.classList.add("fade-in");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".step, .feature");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Header/Navigation */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo-header">
              {/* 👇 clase para controlar tamaño del logo */}
              <img className="logo-img" src="/Assets/logo-anima.png" alt="Logo Ánima" />
              <span className="logo-text">Ánima</span>
            </div>
            <div className="nav-links">
              <Link to="/register" className="nav-link">Crear cuenta</Link>
              <Link to="/login" className="nav-link btn-outline">Iniciar sesión</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* 👇 Compensar el header fijo */}
      <main className="page-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content fade-in">
              <h1 className="hero-title">Música que refleja cómo te sentís</h1>
              <p className="hero-subtitle">
                Ánima detecta tu emoción a través de una foto y te sugiere la playlist perfecta
                para amplificar tu ánimo o ayudarte a cambiarlo.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn-primary">Comenzar ahora</Link>
                <p className="cta-note">En segundos tendrás tu música ideal</p>
              </div>

              {/* Phone mockup */}
              <div className="hero-visual">
                <div className="phone-mockup">
                  <div className="phone-screen">
                    <div className="app-interface">
                      <div className="emotion-circle">
                        <span className="emotion-icon">😊</span>
                      </div>
                      <p className="emotion-text">Detectando felicidad...</p>
                      <div className="music-suggestions">
                        <div className="song-item">♪ Feel Good Hit</div>
                        <div className="song-item">♪ Happy Vibes</div>
                        <div className="song-item">♪ Positive Energy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="section how-it-works">
          <div className="container">
            <h2 className="section-title">¿Cómo funciona?</h2>
            <div className="steps">
              <div className="step fade-in">
                <div className="step-number">1</div>
                <div className="step-icon">📸</div>
                <h3 className="step-title">Toma una foto</h3>
                <p className="step-description">
                  Usa tu cámara o sube una selfie. Ánima analizará tu expresión facial para
                  detectar tu estado emocional actual.
                </p>
              </div>

              <div className="step fade-in">
                <div className="step-number">2</div>
                <div className="step-icon">🧠</div>
                <h3 className="step-title">Detectamos tu emoción</h3>
                <p className="step-description">
                  Nuestra inteligencia artificial identifica tu estado de ánimo actual con
                  precisión avanzada en tiempo real.
                </p>
              </div>

              <div className="step fade-in">
                <div className="step-number">3</div>
                <div className="step-icon">🎵</div>
                <h3 className="step-title">Recibe tu playlist</h3>
                <p className="step-description">
                  Obtén música personalizada de Spotify que se adapta perfectamente a tu momento
                  y estado emocional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section features">
          <div className="container">
            <h2 className="section-title">¿Por qué elegir Ánima?</h2>
            <div className="features-grid">
              <div className="feature fade-in">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Detección instantánea</h3>
                <p className="feature-description">
                  Análisis de emociones en tiempo real con resultados precisos en pocos segundos.
                </p>
              </div>

              <div className="feature fade-in">
                <div className="feature-icon">🎯</div>
                <h3 className="feature-title">Recomendaciones precisas</h3>
                <p className="feature-description">
                  Algoritmos avanzados que sugieren la música perfecta según tu estado emocional.
                </p>
              </div>

              <div className="feature fade-in">
                <div className="feature-icon">📊</div>
                <h3 className="feature-title">Historial personal</h3>
                <p className="feature-description">
                  Guarda todos tus análisis y descubre patrones únicos en tu estado emocional.
                </p>
              </div>

              <div className="feature fade-in">
                <div className="feature-icon">🎧</div>
                <h3 className="feature-title">Integración con Spotify</h3>
                <p className="feature-description">
                  Acceso directo a millones de canciones desde la plataforma de música líder
                  mundial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="section cta-final">
          <div className="container">
            <div className="cta-content fade-in">
              <h2 className="cta-title">¿Listo para descubrir tu banda sonora emocional?</h2>
              <p className="cta-subtitle">
                Únete a Ánima y permite que la música refleje quien realmente eres. Descubre cómo
                tus emociones pueden conectar con la música perfecta.
              </p>
              <Link to="/register" className="btn-primary">Crear cuenta gratis</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-header">
                {/* 👇 también pequeño en el footer */}
                <img className="logo-img" src="/Assets/logo-anima.png" alt="Logo Ánima" />
                <span className="logo-text">Ánima</span>
              </div>
              <p className="footer-tagline">Música que refleja cómo te sentís</p>
            </div>
            <div className="footer-links">
              <Link to="/register">Crear cuenta</Link>
              <Link to="/login">Iniciar sesión</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Ánima. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
