// src/pages/RecuperacionContrasena/RecuperacionContrasena.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  requestPasswordReset, 
  verifyResetCode, 
  resetPassword, 
  resendResetCode 
} from "../../utils/api";
import Navbar from "../../components/Navbar";
import "./RecuperacionContrasena.css";

export default function RecuperacionContrasena() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: ""
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    if (!formData.email.trim()) {
      return { isValid: false, error: "El correo electrónico es obligatorio" };
    }
    if (!validateEmail(formData.email)) {
      return { isValid: false, error: "Por favor ingresa un correo electrónico válido" };
    }
    return { isValid: true };
  };

  const validateStep2 = () => {
    if (!formData.verificationCode.trim()) {
      return { isValid: false, error: "El código de verificación es obligatorio" };
    }
    if (formData.verificationCode.length !== 6) {
      return { isValid: false, error: "El código debe tener 6 dígitos" };
    }
    return { isValid: true };
  };

  const validateStep3 = () => {
    if (!formData.newPassword) {
      return { isValid: false, error: "La nueva contraseña es obligatoria" };
    }
    if (formData.newPassword.length < 6) {
      return { isValid: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }
    if (!formData.confirmPassword) {
      return { isValid: false, error: "La confirmación de contraseña es obligatoria" };
    }
    if (formData.newPassword !== formData.confirmPassword) {
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

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    const validation = validateStep1();

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordReset(formData.email);
      
      showPopup("success", "¡Código enviado!", `Se ha enviado un código de verificación a ${formData.email}. Revisa tu bandeja de entrada.`);
      
      setTimeout(() => {
        setCurrentStep(2);
        closePopup();
      }, 2000);
    } catch (error) {
      console.error(error);
      showPopup("error", "Error", error.message || "No se pudo enviar el código. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    const validation = validateStep2();

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    setIsLoading(true);

    try {
      await verifyResetCode(formData.email, formData.verificationCode);
      
      showPopup("success", "¡Código verificado!", "Ahora puedes establecer tu nueva contraseña.");
      
      setTimeout(() => {
        setCurrentStep(3);
        closePopup();
      }, 1500);
    } catch (error) {
      console.error(error);
      showPopup("error", "Código incorrecto", error.message || "El código ingresado no es válido. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    const validation = validateStep3();

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(formData.email, formData.verificationCode, formData.newPassword);
      
      showPopup("success", "¡Contraseña actualizada!", "Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login.");
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      console.error(error);
      showPopup("error", "Error", error.message || "No se pudo actualizar la contraseña. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      await resendResetCode(formData.email);
      showPopup("info", "Código reenviado", `Se ha enviado un nuevo código de verificación a ${formData.email}`);
    } catch (error) {
      console.error(error);
      showPopup("error", "Error", error.message || "No se pudo reenviar el código. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
        <span className="step-number">1</span>
        <span className="step-label">Correo</span>
      </div>
      <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
      <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
        <span className="step-number">2</span>
        <span className="step-label">Código</span>
      </div>
      <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`}></div>
      <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
        <span className="step-number">3</span>
        <span className="step-label">Nueva contraseña</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <form className="recovery-form" onSubmit={handleStep1Submit}>
      <div className="form-content">
        <h2>Recuperar contraseña</h2>
        <p>Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>
        
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar código'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form className="recovery-form" onSubmit={handleStep2Submit}>
      <div className="form-content">
        <h2>Verificar código</h2>
        <p>Hemos enviado un código de 6 dígitos a <strong>{formData.email}</strong></p>
        
        <div className="form-group">
          <label htmlFor="verificationCode">Código de verificación</label>
          <input
            type="text"
            id="verificationCode"
            placeholder="123456"
            maxLength="6"
            value={formData.verificationCode}
            onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
            required
            className="code-input"
            disabled={isLoading}
          />
        </div>
        
        <div className="resend-container">
          <span>¿No recibiste el código? </span>
          <button 
            type="button" 
            className="resend-btn" 
            onClick={handleResendCode}
            disabled={isLoading}
          >
            Reenviar código
          </button>
        </div>
      </div>
      
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Verificando...' : 'Verificar código'}
      </button>
    </form>
  );

  const renderStep3 = () => (
    <form className="recovery-form" onSubmit={handleStep3Submit}>
      <div className="form-content">
        <h2>Nueva contraseña</h2>
        <p>Establece una nueva contraseña segura para tu cuenta.</p>
        
        <div className="form-group">
          <label htmlFor="newPassword">Nueva contraseña</label>
          <input
            type="password"
            id="newPassword"
            placeholder="********"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="********"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );

  return (
    <>
      <Navbar variant="recovery" />

      {/* Popup */}
      {popup.show && (
        <div className="popup-overlay show" onClick={closePopup}>
          <div className={`popup popup-${popup.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <span className="popup-icon">
                {popup.type === "error" ? "⚠️" : popup.type === "success" ? "✅" : "ℹ️"}
              </span>
              <h3 className="popup-title">{popup.title}</h3>
            </div>
            <p className="popup-message">{popup.message}</p>
            <button className="popup-btn" onClick={closePopup}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="recovery-container">
        {renderStepIndicator()}

        <div className="recovery-card">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {currentStep > 1 && (
          <div className="recovery-actions">
            <button className="back-btn" onClick={handleBack} disabled={isLoading}>
              ← Volver
            </button>
          </div>
        )}
      </div>
    </>
  );
}