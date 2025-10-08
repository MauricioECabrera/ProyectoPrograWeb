
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from email_validator import validate_email, EmailNotValidError

from config import Config
from models.user import User
from repositories.user_repository import UserRepository
from services.user_service import UserService

class AuthService:
    """Servicio de autenticación"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hashea una contraseña usando bcrypt
        
        Args:
            password (str): Contraseña en texto plano
            
        Returns:
            str: Hash de la contraseña
        """
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """
        Verifica una contraseña contra su hash
        
        Args:
            password (str): Contraseña en texto plano
            password_hash (str): Hash almacenado
            
        Returns:
            bool: True si coinciden
        """
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    @staticmethod
    def generate_token(user: User) -> str:
        """
        Genera un JWT token para el usuario
        
        Args:
            user (User): Usuario para el que generar el token
            
        Returns:
            str: JWT token
        """
        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'exp': datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES,
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(
            payload,
            Config.JWT_SECRET_KEY,
            algorithm=Config.JWT_ALGORITHM
        )
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict]:
        """
        Verifica y decodifica un JWT token
        
        Args:
            token (str): JWT token
            
        Returns:
            Dict: Payload del token o None si es inválido
        """
        try:
            payload = jwt.decode(
                token,
                Config.JWT_SECRET_KEY,
                algorithms=[Config.JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            print("⚠️ Token expirado")
            return None
        except jwt.InvalidTokenError:
            print("⚠️ Token inválido")
            return None
    
    @staticmethod
    def validate_email_format(email: str) -> Tuple[bool, Optional[str]]:
        """
        Valida el formato de un email
        
        Args:
            email (str): Email a validar
            
        Returns:
            Tuple[bool, Optional[str]]: (es_válido, mensaje_error)
        """
        try:
            validate_email(email)
            return True, None
        except EmailNotValidError as e:
            return False, str(e)
    
    @staticmethod
    def register(name: str, email: str, password: str) -> Tuple[Optional[User], Optional[str], Optional[str]]:
        """
        Registra un nuevo usuario
        
        Args:
            name (str): Nombre del usuario
            email (str): Email del usuario
            password (str): Contraseña del usuario
            
        Returns:
            Tuple[Optional[User], Optional[str], Optional[str]]: 
                (usuario, token, mensaje_error)
        """
        # Validar nombre
        if not name or len(name.strip()) < 2:
            return None, None, "El nombre debe tener al menos 2 caracteres"
        
        # Validar email
        is_valid, error_msg = AuthService.validate_email_format(email)
        if not is_valid:
            return None, None, "El formato del email no es válido"
        
        # Validar contraseña
        if not password or len(password) < 6:
            return None, None, "La contraseña debe tener al menos 6 caracteres"
        
        # Delegate validation + creation to UserService
        user, err = UserService.create_user(name, email, password)
        if err:
            return None, None, err

        # Generar token
        token = AuthService.generate_token(user)
        return user, token, None
    
    @staticmethod
    def login(email: str, password: str) -> Tuple[Optional[User], Optional[str], Optional[str]]:
        """
        Autentica un usuario
        
        Args:
            email (str): Email del usuario
            password (str): Contraseña del usuario
            
        Returns:
            Tuple[Optional[User], Optional[str], Optional[str]]: 
                (usuario, token, mensaje_error)
        """
        # Validar entrada
        if not email or not password:
            return None, None, "Email y contraseña son obligatorios"
        
        try:
            # Buscar usuario
            user = UserRepository.find_by_email(email.lower().strip())
            
            if not user:
                return None, None, "Correo o contraseña incorrectos"
            
            # Verificar contraseña
            if not AuthService.verify_password(password, user.password_hash):
                return None, None, "Correo o contraseña incorrectos"
            
            # Actualizar último login
            UserRepository.update_last_login(user.id)
            
            # Generar token
            token = AuthService.generate_token(user)
            
            return user, token, None
            
        except Exception as e:
            print(f"❌ Error en login: {e}")
            return None, None, "Error interno del servidor"