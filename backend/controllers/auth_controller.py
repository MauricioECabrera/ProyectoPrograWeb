from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from functools import wraps
from repositories.user_repository import UserRepository

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def token_required(f):
    """
    Decorador para proteger rutas que requieren autenticación
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Obtener token del header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({
                    'success': False,
                    'message': 'Formato de token inválido'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token de autenticación requerido'
            }), 401
        
        # Verificar token
        payload = AuthService.verify_token(token)
        
        if not payload:
            return jsonify({
                'success': False,
                'message': 'Token inválido o expirado'
            }), 401
        
        # Obtener usuario
        user = UserRepository.find_by_id(payload['user_id'])
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuario no encontrado'
            }), 401
        
        # Pasar usuario al endpoint
        return f(user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Endpoint para registro de usuarios
    
    Body:
        name (str): Nombre del usuario
        email (str): Email del usuario
        password (str): Contraseña del usuario
        
    Returns:
        JSON con el usuario creado y token
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400
        
        # Obtener datos del request
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validar campos requeridos
        if not name or not email or not password:
            return jsonify({
                'success': False,
                'message': 'Nombre, email y contraseña son obligatorios'
            }), 400
        
        # Registrar usuario
        user, token, error = AuthService.register(name, email, password)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 400
        
        # Respuesta exitosa
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        print(f"❌ Error en endpoint register: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint para login de usuarios
    
    Body:
        email (str): Email del usuario
        password (str): Contraseña del usuario
        
    Returns:
        JSON con el usuario y token
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400
        
        # Obtener datos del request
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validar campos requeridos
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email y contraseña son obligatorios'
            }), 400
        
        # Autenticar usuario
        user, token, error = AuthService.login(email, password)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 401
        
        # Respuesta exitosa
        return jsonify({
            'success': True,
            'message': 'Inicio de sesión exitoso',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except Exception as e:
        print(f"❌ Error en endpoint login: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@auth_bp.route('/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    """
    Endpoint para verificar si un token es válido
    
    Headers:
        Authorization: Bearer <token>
        
    Returns:
        JSON con información del usuario
    """
    return jsonify({
        'success': True,
        'message': 'Token válido',
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Endpoint para obtener información del usuario actual
    
    Headers:
        Authorization: Bearer <token>
        
    Returns:
        JSON con información del usuario
    """
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200