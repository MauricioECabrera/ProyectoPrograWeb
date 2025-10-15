#!/usr/bin/env python3
"""
Script de prueba para verificar el servicio de email

Uso:
    python test_email.py

Este script envía un email de prueba para verificar que la configuración
de email está funcionando correctamente.
"""

import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(__file__))

from services.email_service import EmailService

def print_separator():
    print("\n" + "="*70)

def test_email_configuration():
    """Verifica la configuración de email"""
    print_separator()
    print("🔍 VERIFICANDO CONFIGURACIÓN DE EMAIL")
    print_separator()
    
    print(f"\n📧 Método configurado: {EmailService.EMAIL_METHOD}")
    print(f"📬 Email remitente: {EmailService.FROM_EMAIL}")
    print(f"👤 Nombre remitente: {EmailService.FROM_NAME}")
    
    if EmailService.EMAIL_METHOD == 'gmail':
        print(f"\n📨 Gmail User: {EmailService.GMAIL_USER or '❌ NO CONFIGURADO'}")
        print(f"🔑 Gmail App Password: {'✅ Configurada' if EmailService.GMAIL_APP_PASSWORD else '❌ NO CONFIGURADA'}")
        
        if not EmailService.GMAIL_USER or not EmailService.GMAIL_APP_PASSWORD:
            print("\n⚠️  ERROR: Gmail no está configurado correctamente")
            print("\n📝 Necesitas configurar en backend/.env:")
            print("   GMAIL_USER=tu-email@gmail.com")
            print("   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx")
            print("\n📖 Guía: https://myaccount.google.com/apppasswords")
            return False
            
    elif EmailService.EMAIL_METHOD == 'sendgrid':
        print(f"\n🔑 SendGrid API Key: {'✅ Configurada' if EmailService.SENDGRID_API_KEY else '❌ NO CONFIGURADA'}")
        
        if not EmailService.SENDGRID_API_KEY:
            print("\n⚠️  ERROR: SendGrid no está configurado correctamente")
            print("\n📝 Necesitas configurar en backend/.env:")
            print("   SENDGRID_API_KEY=SG.xxxxx")
            print("\n📖 Guía: https://app.sendgrid.com/settings/api_keys")
            return False
    else:
        print(f"\n⚠️  ERROR: Método de email desconocido: {EmailService.EMAIL_METHOD}")
        print("\n📝 Métodos válidos: 'gmail' o 'sendgrid'")
        return False
    
    print("\n✅ Configuración correcta")
    return True

def get_test_email():
    """Solicita el email de prueba al usuario"""
    print_separator()
    print("📬 CONFIGURACIÓN DE PRUEBA")
    print_separator()
    
    # Intentar usar el email de Gmail configurado como default
    default_email = EmailService.GMAIL_USER if EmailService.EMAIL_METHOD == 'gmail' else ""
    
    if default_email:
        print(f"\n💡 Sugerencia: Usa tu email configurado: {default_email}")
    
    email = input("\n✉️  Ingresa el email donde quieres recibir la prueba: ").strip()
    
    if not email or '@' not in email:
        print("❌ Email inválido")
        return None
    
    return email

def send_test_password_reset():
    """Envía un email de prueba de recuperación de contraseña"""
    print_separator()
    print("📤 ENVIANDO EMAIL DE PRUEBA")
    print_separator()
    
    # Configuración de prueba
    test_code = "123456"
    test_user_name = "Usuario de Prueba"
    
    # Obtener email de destino
    to_email = get_test_email()
    if not to_email:
        return False
    
    print(f"\n📧 Destinatario: {to_email}")
    print(f"👤 Nombre: {test_user_name}")
    print(f"🔢 Código: {test_code}")
    print(f"📮 Método: {EmailService.EMAIL_METHOD}")
    
    print("\n⏳ Enviando email...")
    
    # Enviar email
    success = EmailService.send_password_reset_code(
        email=to_email,
        code=test_code,
        user_name=test_user_name
    )
    
    print_separator()
    
    if success:
        print("✅ ¡EMAIL ENVIADO EXITOSAMENTE!")
        print_separator()
        print("\n📬 Revisa tu bandeja de entrada:")
        print(f"   📧 {to_email}")
        print("\n💡 Si no ves el email:")
        print("   1. Revisa la carpeta de SPAM")
        print("   2. Espera unos segundos y recarga")
        print("   3. Verifica que el email sea correcto")
        
        if EmailService.EMAIL_METHOD == 'gmail':
            print("\n⚠️  Nota sobre Gmail SMTP:")
            print("   - Los emails pueden tardar unos segundos")
            print("   - Pueden ir a spam la primera vez")
            print("   - Marca como 'No es spam' para futuros emails")
        
        print_separator()
        return True
    else:
        print("❌ ERROR AL ENVIAR EMAIL")
        print_separator()
        print("\n🔧 Posibles soluciones:")
        
        if EmailService.EMAIL_METHOD == 'gmail':
            print("\n📧 Gmail SMTP:")
            print("   1. Verifica que GMAIL_USER y GMAIL_APP_PASSWORD estén correctos")
            print("   2. Usa una App Password, no tu contraseña normal")
            print("   3. La App Password debe ser de 16 caracteres sin espacios")
            print("   4. Genera una nueva en: https://myaccount.google.com/apppasswords")
            print("   5. Asegúrate de tener verificación en 2 pasos activada")
        
        elif EmailService.EMAIL_METHOD == 'sendgrid':
            print("\n📧 SendGrid:")
            print("   1. Verifica que SENDGRID_API_KEY esté correcta")
            print("   2. La API Key debe tener permiso 'Mail Send'")
            print("   3. Verifica que el email del remitente esté verificado")
            print("   4. Revisa en SendGrid Dashboard si hay errores")
        
        print_separator()
        return False

def send_test_password_changed():
    """Envía un email de prueba de contraseña cambiada"""
    print_separator()
    print("📤 ENVIANDO EMAIL DE NOTIFICACIÓN")
    print_separator()
    
    test_user_name = "Usuario de Prueba"
    
    # Obtener email de destino
    to_email = get_test_email()
    if not to_email:
        return False
    
    print(f"\n📧 Destinatario: {to_email}")
    print(f"👤 Nombre: {test_user_name}")
    print("\n⏳ Enviando email...")
    
    # Enviar email
    success = EmailService.send_password_changed_notification(
        email=to_email,
        user_name=test_user_name
    )
    
    if success:
        print("\n✅ ¡Email de notificación enviado!")
    else:
        print("\n❌ Error al enviar email de notificación")
    
    return success

def main():
    """Función principal"""
    print_separator()
    print("🧪 PRUEBA DE SERVICIO DE EMAIL - ÁNIMA")
    print_separator()
    
    # Verificar configuración
    if not test_email_configuration():
        print("\n❌ Configura el email antes de continuar")
        sys.exit(1)
    
    # Menú de opciones
    print_separator()
    print("📋 OPCIONES DE PRUEBA")
    print_separator()
    print("\n1. Enviar email de recuperación de contraseña")
    print("2. Enviar email de contraseña cambiada")
    print("3. Enviar ambos")
    print("0. Salir")
    
    try:
        opcion = input("\n👉 Selecciona una opción (1-3): ").strip()
        
        if opcion == '0':
            print("\n👋 ¡Hasta luego!")
            return
        
        if opcion in ['1', '3']:
            send_test_password_reset()
        
        if opcion in ['2', '3']:
            if opcion == '3':
                input("\n⏸️  Presiona Enter para enviar el segundo email...")
            send_test_password_changed()
        
        if opcion not in ['1', '2', '3']:
            print("\n❌ Opción inválida")
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Prueba cancelada")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()