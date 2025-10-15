from typing import Optional
from database.connection import Database
from datetime import datetime, timedelta
import secrets


class PasswordResetRepository:
    """Repositorio para operaciones de recuperación de contraseña"""

    @staticmethod
    def generate_token() -> str:
        """Genera un token de 6 dígitos"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    @staticmethod
    def create_reset_token(user_id: str, expiration_minutes: int = 15) -> Optional[str]:
        token = PasswordResetRepository.generate_token()
        expires_at = datetime.now() + timedelta(minutes=expiration_minutes)

        query = """
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
            RETURNING token
        """

        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id, token, expires_at))
                result = cursor.fetchone()
                return result['token'] if result else None
        except Exception as e:
            print(f"❌ Error al crear token de recuperación: {e}")
            return None

    @staticmethod
    def verify_token(email: str, token: str) -> Optional[str]:
        query = """
            SELECT prt.user_id, prt.expires_at, prt.used
            FROM password_reset_tokens prt
            JOIN users u ON u.id = prt.user_id
            WHERE u.email = %s AND prt.token = %s
            ORDER BY prt.created_at DESC
            LIMIT 1
        """

        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (email, token))
                result = cursor.fetchone()

                if not result:
                    return None

                if result['used']:
                    return None

                if datetime.now() > result['expires_at']:
                    return None

                return result['user_id']
        except Exception as e:
            print(f"❌ Error al verificar token: {e}")
            return None

    @staticmethod
    def mark_token_as_used(user_id: str, token: str) -> bool:
        query = """
            UPDATE password_reset_tokens
            SET used = true
            WHERE user_id = %s AND token = %s
        """

        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id, token))
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error al marcar token como usado: {e}")
            return False

    @staticmethod
    def invalidate_old_tokens(user_id: str) -> bool:
        query = """
            UPDATE password_reset_tokens
            SET used = true
            WHERE user_id = %s AND used = false
        """

        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id,))
                return True
        except Exception as e:
            print(f"❌ Error al invalidar tokens antiguos: {e}")
            return False

    @staticmethod
    def get_active_token(user_id: str) -> Optional[dict]:
        query = """
            SELECT token, expires_at, created_at
            FROM password_reset_tokens
            WHERE user_id = %s AND used = false AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        """

        try:
            with Database.get_cursor() as cursor:
                return cursor.fetchone()
        except Exception as e:
            print(f"❌ Error al obtener token activo: {e}")
            return None
from typing import Optional
from database.connection import Database
from datetime import datetime, timedelta
import secrets

class PasswordResetRepository:
    """Repositorio para operaciones de recuperación de contraseña"""
    
    @staticmethod
    def generate_token() -> str:
        """
        Genera un token de 6 dígitos
        
        Returns:
            str: Token de 6 dígitos
        """
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    @staticmethod
    def create_reset_token(user_id: str, expiration_minutes: int = 15) -> Optional[str]:
        """
        Crea un nuevo token de recuperación de contraseña
        
        Args:
            user_id (str): ID del usuario
            expiration_minutes (int): Minutos hasta que expire el token
            
        Returns:
            str: Token generado o None si falla
        """
        token = PasswordResetRepository.generate_token()
        expires_at = datetime.now() + timedelta(minutes=expiration_minutes)
        
        query = """
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
            RETURNING token
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id, token, expires_at))
                result = cursor.fetchone()
                return result['token'] if result else None
        except Exception as e:
            print(f"❌ Error al crear token de recuperación: {e}")
            return None
    
    @staticmethod
    def verify_token(email: str, token: str) -> Optional[str]:
        """
        Verifica un token de recuperación
        
        Args:
            email (str): Email del usuario
            token (str): Token a verificar
            
        Returns:
            str: user_id si el token es válido, None si no lo es
        """
        query = """
            SELECT prt.user_id, prt.expires_at, prt.used
            FROM password_reset_tokens prt
            JOIN users u ON u.id = prt.user_id
            WHERE u.email = %s AND prt.token = %s
            ORDER BY prt.created_at DESC
            LIMIT 1
        """
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (email, token))
                result = cursor.fetchone()
                
                if not result:
                    return None
                
                # Verificar si ya fue usado
                if result['used']:
                    return None
                
                # Verificar si expiró
                if datetime.now() > result['expires_at']:
                    return None
                
                return result['user_id']
        except Exception as e:
            print(f"❌ Error al verificar token: {e}")
            return None
    
    @staticmethod
    def mark_token_as_used(user_id: str, token: str) -> bool:
        """
        Marca un token como usado
        
        Args:
            user_id (str): ID del usuario
            token (str): Token a marcar
            
        Returns:
            bool: True si se marcó correctamente
        """
        query = """
            UPDATE password_reset_tokens
            SET used = true
            WHERE user_id = %s AND token = %s
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id, token))
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error al marcar token como usado: {e}")
            return False
    
    @staticmethod
    def invalidate_old_tokens(user_id: str) -> bool:
        """
        Invalida todos los tokens antiguos de un usuario
        
        Args:
            user_id (str): ID del usuario
            
        Returns:
            bool: True si se invalidaron correctamente
        """
        query = """
            UPDATE password_reset_tokens
            SET used = true
            WHERE user_id = %s AND used = false
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id,))
                return True
        except Exception as e:
            print(f"❌ Error al invalidar tokens antiguos: {e}")
            return False
    
    @staticmethod
    def get_active_token(user_id: str) -> Optional[dict]:
        """
        Obtiene el token activo más reciente de un usuario
        
        Args:
            user_id (str): ID del usuario
            
        Returns:
            dict: Información del token o None
        """
        query = """
            SELECT token, expires_at, created_at
            FROM password_reset_tokens
            WHERE user_id = %s AND used = false AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        """
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (user_id,))
                return cursor.fetchone()
        except Exception as e:
            print(f"❌ Error al obtener token activo: {e}")
            return None
from typing import Optional
from database.connection import Database
from datetime import datetime, timedelta
import secrets

class PasswordResetRepository:
    """Repositorio para operaciones de recuperación de contraseña"""
    
    @staticmethod
    def generate_token() -> str:
        """
        Genera un token de 6 dígitos
        
        Returns:
            str: Token de 6 dígitos
        """
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    @staticmethod
    def create_reset_token(user_id: str, expiration_minutes: int = 15) -> Optional[str]:
        """
        Crea un nuevo token de recuperación de contraseña
        
        Args:
            user_id (str): ID del usuario
            expiration_minutes (int): Minutos hasta que expire el token
            
        Returns:
            str: Token generado o None si falla
        """
        token = PasswordResetRepository.generate_token()
        expires_at = datetime.now() + timedelta(minutes=expiration_minutes)
        
        query = """
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
            RETURNING token
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id, token, expires_at))
                result = cursor.fetchone()
                return result['token'] if result else None
        except Exception as e:
            print(f"❌ Error al crear token de recuperación: {e}")
            return None
    
    @staticmethod
    def verify_token(email: str, token: str) -> Optional[str]:
        """
        Verifica un token de recuperación
        
        Args:
            email (str): Email del usuario
            token (str): Token a verificar
            
        Returns:
            str: user_id si el token es válido, None si no lo es
        """
        query = """
            SELECT prt.user_id, prt.expires_at, prt.used
            FROM password_reset_tokens prt
            JOIN users u ON u.id = prt.user_id
            WHERE u.email = %s AND prt.token = %s
            ORDER BY prt.created_at DESC
            LIMIT 1
        """
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (email, token))
                result = cursor.fetchone()
                
                if not result:
                    return None
                
                # Verificar si ya fue usado
                if result['used']:
                    return None
                
                # Verificar si expiró
                if datetime.now() > result['expires_at']:
                    return None
                
                return result['user_id']
        except Exception as e:
            print(f"❌ Error al verificar token: {e}")
            return None
    
    @staticmethod
    def mark_token_as_used(user_id: str, token: str) -> bool:
        """
        Marca un token como usado
        
        Args:
            user_id (str): ID del usuario
            token (str): Token a marcar
            
        Returns:
            bool: True si se marcó correctamente
        """
        query = """
            UPDATE password_reset_tokens
            SET used = true
            WHERE user_id = %s AND token = %s
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id, token))
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error al marcar token como usado: {e}")
            return False
    
    @staticmethod
    def invalidate_old_tokens(user_id: str) -> bool:
        """
        Invalida todos los tokens antiguos de un usuario
        
        Args:
            user_id (str): ID del usuario
            
        Returns:
            bool: True si se invalidaron correctamente
        """
        query = """
            UPDATE password_reset_tokens
            SET used = true
            WHERE user_id = %s AND used = false
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (user_id,))
                return True
        except Exception as e:
            print(f"❌ Error al invalidar tokens antiguos: {e}")
            return False
    
    @staticmethod
    def get_active_token(user_id: str) -> Optional[dict]:
        """
        Obtiene el token activo más reciente de un usuario
        
        Args:
            user_id (str): ID del usuario
            
        Returns:
            dict: Información del token o None
        """
        query = """
            SELECT token, expires_at, created_at
            FROM password_reset_tokens
            WHERE user_id = %s AND used = false AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        """
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (user_id,))
                return cursor.fetchone()
        except Exception as e:
            print(f"❌ Error al obtener token activo: {e}")
            return None
