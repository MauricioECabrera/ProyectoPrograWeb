from typing import Optional, Tuple
from datetime import timedelta
import bcrypt
from email_validator import validate_email, EmailNotValidError
from psycopg import errors as pg_errors

from repositories.user_repository import UserRepository
from models.user import User


class UserService:
    """Servicio para operaciones relacionadas a usuarios (registro, validaciones)"""

    @staticmethod
    def validate_email_format(email: str) -> Tuple[bool, Optional[str]]:
        try:
            validate_email(email)
            return True, None
        except EmailNotValidError as e:
            return False, str(e)

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def create_user(name: str, email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
        """Valida y crea un usuario en la base de datos.

        Returns:
            (User, None) on success or (None, error_message) on failure
        """
        # Validar nombre
        if not name or len(name.strip()) < 2:
            return None, "El nombre debe tener al menos 2 caracteres"

        # Validar email
        is_valid, error_msg = UserService.validate_email_format(email)
        if not is_valid:
            return None, "El formato del email no es válido"

        # Validar contraseña
        if not password or len(password) < 6:
            return None, "La contraseña debe tener al menos 6 caracteres"

        # Verificar si el email ya existe
        if UserRepository.email_exists(email):
            return None, "Este correo electrónico ya está registrado"

        try:
            password_hash = UserService.hash_password(password)
            user = UserRepository.create(name.strip(), email.lower().strip(), password_hash)
            if not user:
                return None, "Error al crear el usuario"
            return user, None
        except pg_errors.UniqueViolation:
            # Captura específica para violación de constraint único (email duplicado)
            print(f"⚠️ Intento de registro con email duplicado: {email}")
            return None, "Este correo electrónico ya está registrado"
        except pg_errors.IntegrityError as e:
            # Otros errores de integridad
            print(f"❌ Error de integridad en UserService.create_user: {e}")
            return None, "Error de validación de datos"
        except Exception as e:
            print(f"❌ Error inesperado en UserService.create_user: {e}")
            return None, "Error interno del servidor"