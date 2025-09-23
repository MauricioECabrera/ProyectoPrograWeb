// src/pages/Principal/Principal.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./principal.css";

export default function Principal() {
  const navigate = useNavigate();

  // ---- STATE ----
  const [isEmotionOpen, setIsEmotionOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("--:--");
  const [cameraActive, setCameraActive] = useState(false);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [emotion, setEmotion] = useState({ name: "Analizando...", icon: "😊", confidence: "--" });
  const [playlist, setPlaylist] = useState([]);
  const [userName] = useState("Usuario");

  // ---- REFS ----
  const cameraStreamRef = useRef(null); // guarda MediaStream
  const previewRef = useRef(null);      // div del preview

  // ---- UTILS ----
  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-info-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 100);
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const formatTime = (d = new Date()) => d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  // ---- EFFECTS ----
  useEffect(() => {
    const container = document.querySelector(".container");
    if (container) {
      container.style.opacity = "0";
      container.style.transform = "translateY(20px)";
      setTimeout(() => {
        container.style.transition = "all 0.6s ease";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
      }, 100);
    }

    setCurrentTime(formatTime());
    const t = setInterval(() => setCurrentTime(formatTime()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach((statEl) => {
      const finalValue = statEl.textContent || "0";
      if (!isNaN(Number(finalValue))) {
        let currentValue = 0;
        const target = Number(finalValue);
        const increment = target / 30;
        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= target) {
            statEl.textContent = String(target);
            clearInterval(timer);
          } else {
            statEl.textContent = String(Math.floor(currentValue));
          }
        }, 50);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
    };
  }, []);

  // ---- CÁMARA ----
  const openEmotionAnalysis = () => {
    setIsEmotionOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeEmotionModal = () => {
    setIsEmotionOpen(false);
    document.body.style.overflow = "auto";
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    resetCameraInterface();
  };

  const startCamera = async () => {
    try {
      if (!previewRef.current) return;
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.style.width = "100%";
      video.style.borderRadius = "12px";
      previewRef.current.innerHTML = "";
      previewRef.current.appendChild(video);
      showNotification("Cámara activada correctamente");
    } catch (err) {
      setCameraActive(false);
      showNotification("Error al acceder a la cámara", "error");
    }
  };

  const capturePhoto = () => {
    if (!previewRef.current) return;
    const video = previewRef.current.querySelector("video");
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(video, 0, 0);

    showAnalysisResults();

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const uploadPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file || !previewRef.current) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.createElement("img");
        img.src = String(ev.target && ev.target.result ? ev.target.result : "");
        img.style.width = "100%";
        img.style.borderRadius = "12px";
        previewRef.current.innerHTML = "";
        previewRef.current.appendChild(img);
        showAnalysisResults();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const resetCameraInterface = () => {
    if (previewRef.current) {
      previewRef.current.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Activa tu cámara para comenzar</p>
      `;
    }
    setCameraActive(false);
    setAnalysisVisible(false);
    setEmotion({ name: "Analizando...", icon: "😊", confidence: "--" });
    setPlaylist([]);
  };

  // ---- ANÁLISIS (SIMULADO) ----
  const showAnalysisResults = () => {
    setAnalysisVisible(true);
    setEmotion({ name: "Analizando...", icon: "😊", confidence: "--" });
    setPlaylist([]);

    setTimeout(() => {
      const emotions = [
        { name: "Felicidad", icon: "😊", confidence: 85 },
        { name: "Calma", icon: "😌", confidence: 78 },
        { name: "Energía", icon: "🎵", confidence: 92 },
        { name: "Concentración", icon: "🧘", confidence: 67 },
      ];
      const selected = emotions[Math.floor(Math.random() * emotions.length)];
      setEmotion({
        name: selected.name,
        icon: selected.icon,
        confidence: `${selected.confidence}%`,
      });
      generatePlaylist(selected.name);
    }, 2000);
  };

  const generatePlaylist = (emo) => {
    const playlists = {
      Felicidad: ["Happy - Pharrell Williams", "Good as Hell - Lizzo", "Uptown Funk - Bruno Mars"],
      Calma: ["Weightless - Marconi Union", "River - Joni Mitchell", "Mad World - Gary Jules"],
      Energía: ["Eye of the Tiger - Survivor", "Thunder - Imagine Dragons", "High Hopes - Panic!"],
      Concentración: ["Clair de Lune - Debussy", "Gymnopédie No.1 - Satie", "The Blue Notebooks - Max Richter"],
    };
    setPlaylist(playlists[emo] || ["Música personalizada para ti"]);
  };

  // ---- NAV ----
  const navigateToHistory = () => {
    showNotification("Navegando al historial...");
    navigate("/historial");
  };

  const handleLogout = () => {
    // ✅ corregido para ESLint
    if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
      showNotification("Cerrando sesión...");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <>
      {/* Modal de análisis de emoción */}
      {isEmotionOpen && (
        <div id="emotion-popup" className="emotion-popup" style={{ display: "flex" }}>
          <div className="emotion-modal">
            <div className="emotion-header">
              <h3>Análisis de Emoción</h3>
              <button id="close-emotion" className="close-btn" onClick={closeEmotionModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="emotion-content">
              <div className="camera-section">
                <div className="camera-preview" id="camera-preview" ref={previewRef}>
                  <i className="fas fa-camera camera-icon"></i>
                  <p>Activa tu cámara para comenzar</p>
                </div>

                <div className="camera-controls">
                  {!cameraActive && (
                    <button id="start-camera" className="btn-camera primary" onClick={startCamera}>
                      <i className="fas fa-video"></i> Activar Cámara
                    </button>
                  )}
                  <button
                    id="take-photo"
                    className="btn-camera secondary"
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                  >
                    <i className="fas fa-camera"></i> Capturar Foto
                  </button>
                  <button id="upload-photo" className="btn-camera tertiary" onClick={uploadPhoto}>
                    <i className="fas fa-upload"></i> Subir Imagen
                  </button>
                </div>
              </div>

              {analysisVisible && (
                <div className="analysis-section" id="analysis-section">
                  <div className="emotion-result">
                    <div className="emotion-display">
                      <div className="emotion-icon-large" id="emotion-icon">
                        {emotion.icon}
                      </div>
                      <h4 id="emotion-name">{emotion.name}</h4>
                      <p id="emotion-confidence">Confianza: {emotion.confidence}</p>
                    </div>

                    <div className="music-recommendations">
                      <h5>Recomendaciones musicales:</h5>
                      <div className="playlist-preview" id="playlist-preview">
                        {playlist.length === 0 ? (
                          <div className="loading-music">
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Generando playlist...</span>
                          </div>
                        ) : (
                          playlist.map((song, idx) => (
                            <div className="song-item" key={idx}>
                              <i className="fas fa-music"></i>
                              <span>{song}</span>
                              <button
                                className="play-song-btn"
                                onClick={(e) => {
                                  const btn = e.currentTarget;
                                  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                                  setTimeout(() => (btn.innerHTML = '<i class="fas fa-play"></i>'), 1000);
                                  showNotification("Reproduciendo canción...");
                                }}
                              >
                                <i className="fas fa-play"></i>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="container">
        <header className="header">
          <div className="logo-section">
            <img src="/Assets/logo-anima.png" alt="Logo" />
            <h1 className="app-name">Ánima</h1>
          </div>
          <nav className="nav-menu">
            <button className="nav-btn" id="profileBtn" onClick={() => showNotification("Abriendo perfil...")}>
              <i className="fas fa-user"></i>
              <span>Perfil</span>
            </button>
            <button className="nav-btn" id="settingsBtn" onClick={() => showNotification("Abriendo configuración...")}>
              <i className="fas fa-cog"></i>
              <span>Configuración</span>
            </button>
            <button className="nav-btn logout-btn" id="logoutBtn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Salir</span>
            </button>
          </nav>
        </header>

        {/* Resto de secciones igual que tu archivo original */}
      </div>

      {/* FAB */}
      <button className="fab" id="quickAnalysisBtn" onClick={openEmotionAnalysis}>
        <i className="fas fa-camera"></i>
        <div className="fab-pulse"></div>
      </button>
    </>
  );
}
