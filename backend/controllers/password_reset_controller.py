from flask import Blueprint, request, jsonify
from services.password_reset_service import PasswordResetService

password_reset_bp = Blueprint('password_reset', __name__, url_prefix='/auth/password')

@password_reset_bp.route('/request-reset', methods=['POST'])
def request_reset():
    """
    Endpoint para solicitar código de recuperación de contraseña
    
    Body:
        email (str): Email del usuario
        
    Returns:
        JSON con el resultado de la operación
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400
        
        # Obtener email
        email = data.get('email', '').strip()
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'El email es obligatorio'
            }), 400
        
        # Solicitar código - NOMBRE CORRECTO DEL MÉTODO
        success, error = PasswordResetService.request_password_reset(email)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 400
        
        # Siempre responder con éxito (seguridad)
        return jsonify({
            'success': True,
            'message': 'Si el email existe, recibirás un código de verificación'
        }), 200
        
    except Exception as e:
        print(f"❌ Error en endpoint request_reset: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500


@password_reset_bp.route('/verify-code', methods=['POST'])
def verify_code():
    """
    Endpoint para verificar código de recuperación
    
    Body:
        email (str): Email del usuario
        code (str): Código de verificación
        
    Returns:
        JSON con el resultado de la verificación
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400
        
        # Obtener datos
        email = data.get('email', '').strip()
        code = data.get('code', '').strip()
        
        if not email or not code:
            return jsonify({
                'success': False,
                'message': 'Email y código son obligatorios'
            }), 400
        
        # Verificar código
        success, error = PasswordResetService.verify_reset_code(email, code)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Código verificado correctamente'
        }), 200
        
    except Exception as e:
        print(f"❌ Error en endpoint verify_code: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500


@password_reset_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Endpoint para restablecer la contraseña
    
    Body:
        email (str): Email del usuario
        code (str): Código de verificación
        new_password (str): Nueva contraseña
        
    Returns:
        JSON con el resultado de la operación
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400
        
        # Obtener datos
        email = data.get('email', '').strip()
        code = data.get('code', '').strip()
        new_password = data.get('new_password', '')
        
        if not email or not code or not new_password:
            return jsonify({
                'success': False,
                'message': 'Todos los campos son obligatorios'
            }), 400
        
        # Restablecer contraseña
        success, error = PasswordResetService.reset_password(email, code, new_password)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Contraseña actualizada exitosamente'
        }), 200
        
    except Exception as e:
        print(f"❌ Error en endpoint reset_password: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500


@password_reset_bp.route('/resend-code', methods=['POST'])
def resend_code():
    """
    Endpoint para reenviar código de recuperación
    
    Body:
        email (str): Email del usuario
        
    Returns:
        JSON con el resultado de la operación
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400
        
        # Obtener email
        email = data.get('email', '').strip()
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'El email es obligatorio'
            }), 400
        
        # Reenviar código
        success, error = PasswordResetService.resend_code(email)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Código reenviado correctamente'
        }), 200
        
    except Exception as e:
        print(f"❌ Error en endpoint resend_code: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500