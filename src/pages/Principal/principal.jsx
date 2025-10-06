import { useState, useEffect } from "react";
import "./principal.css";

export default function AnimaSimplified() {
  const [emotionPopup, setEmotionPopup] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    return () => {
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

  const startCamera = async () => {
    try {
      const startBtn = document.getElementById('start-camera');
      if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.style.width = '100%';
      videoElement.style.borderRadius = '12px';
      
      const preview = document.getElementById('camera-preview');
      if (preview) {
        preview.innerHTML = '';
        preview.appendChild(videoElement);
      }
      
      const takeBtn = document.getElementById('take-photo');
      if (takeBtn) takeBtn.disabled = false;
      if (startBtn) startBtn.style.display = 'none';
      
      showNotification('Cámara activada correctamente');
    } catch (error) {
      showNotification('Error al acceder a la cámara', 'error');
      const startBtn = document.getElementById('start-camera');
      if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-video"></i> Activar Cámara';
      }
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) return;
    
    const video = document.querySelector('#camera-preview video');
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      showAnalysisResults();
      
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
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
          img.style.borderRadius = '12px';
          
          const preview = document.getElementById('camera-preview');
          if (preview) {
            preview.innerHTML = '';
            preview.appendChild(img);
          }
          
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
    const startBtn = document.getElementById('start-camera');
    const takeBtn = document.getElementById('take-photo');
    
    if (preview) {
      preview.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Activa tu cámara para comenzar</p>
      `;
    }
    if (startBtn) {
      startBtn.style.display = 'inline-flex';
      startBtn.innerHTML = '<i class="fas fa-video"></i> Activar Cámara';
    }
    if (takeBtn) takeBtn.disabled = true;
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
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      showNotification('Cerrando sesión...');
    }
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
              <span>Tomar foto</span>
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
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {/* Camera Section */}
              <div className="camera-section">
                <div id="camera-preview" className="camera-preview">
                  <i className="fas fa-camera camera-icon"></i>
                  <p>Activa tu cámara para comenzar</p>
                </div>

                {/* Camera Controls */}
                <div className="camera-controls">
                  <button id="start-camera" onClick={startCamera} className="btn-camera btn-primary">
                    <i className="fas fa-video"></i>
                    Activar Cámara
                  </button>
                  
                  <button id="take-photo" onClick={capturePhoto} disabled className="btn-camera btn-success">
                    <i className="fas fa-camera"></i>
                    Capturar Foto
                  </button>
                  
                  <button onClick={uploadPhoto} className="btn-camera btn-secondary">
                    <i className="fas fa-upload"></i>
                    Subir Imagen
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
    </div>
  );
}