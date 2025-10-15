import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

class EmailService:
    """Servicio de email funcional y simplificado"""
    
    # Configuración
    EMAIL_METHOD = os.getenv('EMAIL_METHOD', 'gmail')
    GMAIL_USER = os.getenv('GMAIL_USER', '')
    GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD', '')
    FROM_EMAIL = os.getenv('EMAIL_FROM', GMAIL_USER)
    FROM_NAME = os.getenv('EMAIL_FROM_NAME', 'Ánima')
    
    @staticmethod
    def _send_via_gmail(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """Envía email usando Gmail SMTP"""
        try:
            # Validar configuración
            if not EmailService.GMAIL_USER or not EmailService.GMAIL_APP_PASSWORD:
                print("\n❌ ERROR: GMAIL_USER y GMAIL_APP_PASSWORD no están configurados")
                print("📝 Configura en backend/.env:")
                print("   GMAIL_USER=tu-email@gmail.com")
                print("   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx")
                return False
            
            # Crear mensaje
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = f"{EmailService.FROM_NAME} <{EmailService.GMAIL_USER}>"
            message['To'] = to_email
            
            # Agregar contenido
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            part2 = MIMEText(html_content, 'html', 'utf-8')
            message.attach(part1)
            message.attach(part2)
            
            # Conectar y enviar
            print(f"📧 Conectando a Gmail SMTP...")
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as server:
                print(f"🔐 Autenticando con {EmailService.GMAIL_USER}...")
                server.login(EmailService.GMAIL_USER, EmailService.GMAIL_APP_PASSWORD)
                print(f"📤 Enviando email a {to_email}...")
                server.send_message(message)
            
            print(f"✅ Email enviado exitosamente a {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            print("\n❌ ERROR DE AUTENTICACIÓN")
            print("=" * 60)
            print("Posibles causas:")
            print("1. App Password incorrecta (debe ser 16 caracteres sin espacios)")
            print("2. Verificación en 2 pasos no activada")
            print("3. Email incorrecto en GMAIL_USER")
            print("\n🔧 Soluciones:")
            print("1. Ve a: https://myaccount.google.com/apppasswords")
            print("2. Genera una nueva App Password")
            print("3. Copia exactamente los 16 caracteres (sin espacios)")
            print("4. Actualiza GMAIL_APP_PASSWORD en backend/.env")
            print("=" * 60)
            print(f"\nError técnico: {e}")
            return False
            
        except smtplib.SMTPException as e:
            print(f"\n❌ ERROR SMTP: {e}")
            return False
            
        except Exception as e:
            print(f"\n❌ Error inesperado: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    @staticmethod
    def send_password_reset_code(email: str, code: str, user_name: str) -> bool:
        """Envía un código de recuperación de contraseña"""
        
        print(f"\n{'='*70}")
        print(f"📧 ENVIANDO EMAIL DE RECUPERACIÓN")
        print(f"{'='*70}")
        print(f"Destinatario: {email}")
        print(f"Usuario: {user_name}")
        print(f"Código: {code}")
        print(f"Método: {EmailService.EMAIL_METHOD}")
        
        subject = "Código de recuperación de contraseña - Ánima"
        
        # HTML simplificado pero bonito
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px; border-radius: 12px; color: white;">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; margin: 0; margin-bottom: 10px;">🎵 Ánima</h1>
            <h2 style="font-size: 20px; font-weight: normal; margin: 0;">Recuperación de Contraseña</h2>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hola <strong>{user_name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Hemos recibido una solicitud para restablecer tu contraseña en Ánima.</p>
        
        <div style="background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Tu código de verificación es:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">{code}</div>
        </div>
        
        <div style="background: rgba(83, 52, 131, 0.2); border-left: 4px solid #533483; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong style="font-size: 16px;">⏱️ Este código es válido por 15 minutos.</strong>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2); font-size: 14px; color: rgba(255, 255, 255, 0.7);">
            <p style="margin: 0 0 10px 0;">Saludos,<br>El equipo de Ánima</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
        
    </div>
</body>
</html>
"""
        
        # Texto plano (fallback)
        text_content = f"""
Hola {user_name},

Hemos recibido una solicitud para restablecer tu contraseña en Ánima.

Tu código de verificación es: {code}

Este código es válido por 15 minutos.

Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.

Saludos,
El equipo de Ánima

---
Este es un correo automático, por favor no respondas a este mensaje.
"""
        
        if EmailService.EMAIL_METHOD == 'gmail':
            return EmailService._send_via_gmail(email, subject, html_content, text_content)
        else:
            print(f"❌ Método de email no soportado: {EmailService.EMAIL_METHOD}")
            print("📝 Métodos válidos: 'gmail'")
            return False
    
    @staticmethod
    def send_password_changed_notification(email: str, user_name: str) -> bool:
        """Envía notificación de contraseña cambiada"""
        
        subject = "Tu contraseña ha sido actualizada - Ánima"
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px; border-radius: 12px; color: white;">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; margin: 0; margin-bottom: 10px;">🎵 Ánima</h1>
            <h2 style="font-size: 20px; font-weight: normal; margin: 0;">Contraseña Actualizada</h2>
        </div>
        
        <div style="text-align: center; font-size: 64px; margin: 20px 0;">✅</div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hola <strong>{user_name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Tu contraseña de Ánima ha sido actualizada exitosamente.</p>
        
        <div style="background: rgba(255, 193, 7, 0.2); border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong style="font-size: 16px;">⚠️ ¿No fuiste tú?</strong><br>
            <span style="font-size: 14px;">Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.</span>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Ahora puedes iniciar sesión con tu nueva contraseña.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2); font-size: 14px; color: rgba(255, 255, 255, 0.7);">
            <p style="margin: 0;">Saludos,<br>El equipo de Ánima</p>
        </div>
        
    </div>
</body>
</html>
"""
        
        text_content = f"""
Hola {user_name},

Tu contraseña de Ánima ha sido actualizada exitosamente.

⚠️ Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.

Ahora puedes iniciar sesión con tu nueva contraseña.

Saludos,
El equipo de Ánima
"""
        
        if EmailService.EMAIL_METHOD == 'gmail':
            return EmailService._send_via_gmail(email, subject, html_content, text_content)
        else:
            print(f"❌ Método no soportado: {EmailService.EMAIL_METHOD}")
            return False