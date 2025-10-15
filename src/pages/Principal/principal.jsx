import { useState, useEffect } from "react";
import "./principal.css";

export default function AnimaSimplified() {
  const [emotionPopup, setEmotionPopup] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirmation, setLogoutConfirmation] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const openEmotionAnalysis = () => {
    setEmotionPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEmotionModal = () => {
    setEmotionPopup(false);
    document.body.style.overflow = 'auto';
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    resetCameraInterface();
  };

  const takePhotoAndStart = async () => {
    try {
      const captureBtn = document.getElementById('capture-photo');
      if (captureBtn) {
        captureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Iniciando...</span>';
        captureBtn.disabled = true;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      videoElement.style.borderRadius = '12px';
      
      const preview = document.getElementById('camera-preview');
      if (preview) {
        preview.innerHTML = '';
        preview.appendChild(videoElement);
      }
      
      if (captureBtn) {
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> <span>Capturar Foto</span>';
        captureBtn.disabled = false;
      }
      
      showNotification('Cámara activada correctamente');
    } catch (error) {
      showNotification('Error al acceder a la cámara', 'error');
      const captureBtn = document.getElementById('capture-photo');
      if (captureBtn) {
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> <span>Tomarme una Foto</span>';
        captureBtn.disabled = false;
      }
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) {
      takePhotoAndStart();
      return;
    }
    
    const video = document.querySelector('#camera-preview video');
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Crear imagen desde el canvas
      const imgDataUrl = canvas.toDataURL('image/jpeg');
      
      // Mostrar la imagen capturada en el preview
      const img = document.createElement('img');
      img.src = imgDataUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '12px';
      
      const preview = document.getElementById('camera-preview');
      if (preview) {
        preview.innerHTML = '';
        preview.appendChild(img);
      }
      
      // Detener el stream de la cámara
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      
      // Actualizar el botón de captura
      const captureBtn = document.getElementById('capture-photo');
      if (captureBtn) {
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> <span>Tomarme una Foto</span>';
        captureBtn.disabled = false;
      }
      
      // Iniciar análisis
      showAnalysisResults();
    }
  };

  const uploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '12px';
          
          const preview = document.getElementById('camera-preview');
          if (preview) {
            preview.innerHTML = '';
            preview.appendChild(img);
          }
          
          // Iniciar análisis
          showAnalysisResults();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const showAnalysisResults = () => {
    setAnalysisVisible(true);
    
    setTimeout(() => {
      const emotions = [
        { name: 'Felicidad', icon: '😊', confidence: 85 },
        { name: 'Calma', icon: '😌', confidence: 78 },
        { name: 'Energía', icon: '🎵', confidence: 92 },
        { name: 'Concentración', icon: '🧘', confidence: 67 }
      ];
      
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      const emotionIcon = document.getElementById('emotion-icon');
      const emotionName = document.getElementById('emotion-name');
      const emotionConfidence = document.getElementById('emotion-confidence');
      
      if (emotionIcon) emotionIcon.textContent = randomEmotion.icon;
      if (emotionName) emotionName.textContent = randomEmotion.name;
      if (emotionConfidence) emotionConfidence.textContent = `Confianza: ${randomEmotion.confidence}%`;
      
      generatePlaylist(randomEmotion.name);
    }, 2000);
  };

  const generatePlaylist = (emotion) => {
    const playlists = {
      'Felicidad': ['Happy - Pharrell Williams', 'Good as Hell - Lizzo', 'Uptown Funk - Bruno Mars'],
      'Calma': ['Weightless - Marconi Union', 'River - Joni Mitchell', 'Mad World - Gary Jules'],
      'Energía': ['Eye of the Tiger - Survivor', 'Thunder - Imagine Dragons', 'High Hopes - Panic!'],
      'Concentración': ['Clair de Lune - Debussy', 'Gymnopédie No.1 - Satie', 'The Blue Notebooks - Max Richter']
    };
    
    const songs = playlists[emotion] || ['Música personalizada para ti'];
    const playlistDiv = document.getElementById('playlist-preview');
    
    if (playlistDiv) {
      playlistDiv.innerHTML = songs.map(song => 
        `<div class="song-item">
          <i class="fas fa-music"></i>
          <span>${song}</span>
          <button class="play-song-btn"><i class="fas fa-play"></i></button>
        </div>`
      ).join('');
    }
  };

  const resetCameraInterface = () => {
    const preview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-photo');
    
    if (preview) {
      preview.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Haz clic en el botón para comenzar</p>
      `;
    }
    if (captureBtn) {
      captureBtn.innerHTML = '<i class="fas fa-camera"></i><span>Tomarme una Foto</span>';
      captureBtn.disabled = false;
    }
    setAnalysisVisible(false);
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-info-circle"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleLogout = () => {
    setLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    showNotification('Cerrando sesión...', 'info');
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }, 1000);
  };

  const cancelLogout = () => {
    setLogoutConfirmation(false);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">
              <span>🎵</span>
            </div>
            <h1 className="logo-text">Ánima</h1>
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav">
            <button className="nav-item">
              <i className="fas fa-user"></i>
              <span>Perfil</span>
            </button>
            
            <button className="nav-item">
              <i className="fas fa-history"></i>
              <span>Historial</span>
            </button>
          </nav>

          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-menu-toggle">
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Main Content */}
      <main className="main-content">
        <div className="main-container">
          {/* Main Question Card */}
          <div className="question-card">
            <h2 className="question-title">¿Cómo me siento?</h2>
            
            {/* Camera Button */}
            <button onClick={openEmotionAnalysis} className="camera-button">
              <i className="fas fa-camera"></i>
              <span>Tomarme una foto</span>
            </button>
          </div>
        </div>
      </main>

      {/* Emotion Analysis Modal */}
      {emotionPopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title">Análisis de Emoción</h3>
              <button onClick={closeEmotionModal} className="close-button">
                <i className="fas fa-times"></i>X
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {/* Camera Section */}
              <div className="camera-section">
                <div id="camera-preview" className="camera-preview">
                  <i className="fas fa-camera camera-icon"></i>
                  <p>Haz clic en el botón para comenzar</p>
                </div>

                {/* Camera Controls */}
                <div className={`camera-controls-grid ${isMobile ? 'mobile' : ''}`}>
                  <button 
                    id="capture-photo" 
                    onClick={capturePhoto}
                    className="btn-capture"
                  >
                    <i className="fas fa-camera"></i>
                    <span>Tomarme una Foto</span>
                  </button>
                  
                  <button 
                    onClick={uploadPhoto}
                    className="btn-upload"
                  >
                    <i className="fas fa-upload"></i>
                    <span>Subir Imagen</span>
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              {analysisVisible && (
                <div className="analysis-section">
                  <div className="analysis-grid">
                    {/* Emotion Display */}
                    <div className="emotion-display">
                      <div id="emotion-icon" className="emotion-icon">😊</div>
                      <h4 id="emotion-name" className="emotion-name">Analizando...</h4>
                      <p id="emotion-confidence" className="emotion-confidence">Confianza: --</p>
                    </div>

                    {/* Music Recommendations */}
                    <div className="music-section">
                      <h5 className="music-title">Recomendaciones musicales:</h5>
                      <div id="playlist-preview" className="playlist-preview">
                        <div className="loading-music">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Generando playlist...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutConfirmation && (
        <div className="modal-overlay logout-modal-overlay">
          <div className="logout-confirmation-modal">
            <h3 className="logout-modal-title">¿Cerrar sesión?</h3>
            <p className="logout-modal-message">
              ¿Estás seguro de que deseas cerrar tu sesión en Ánima?
            </p>
            <div className="logout-modal-actions">
              <button onClick={cancelLogout} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={confirmLogout} className="btn-confirm-logout">
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}