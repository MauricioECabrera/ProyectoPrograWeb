from typing import Optional
from database.connection import Database
from models.user import User
from datetime import datetime

class UserRepository:
    """Repositorio para operaciones de usuario en la base de datos"""
    
    @staticmethod
    def create(name: str, email: str, password_hash: str) -> Optional[User]:
        """
        Crea un nuevo usuario
        
        Args:
            name (str): Nombre del usuario
            email (str): Email del usuario
            password_hash (str): Hash de la contraseña
            
        Returns:
            User: Usuario creado o None si falla
            
        Raises:
            psycopg.errors.UniqueViolation: Si el email ya existe
            psycopg.errors.IntegrityError: Si hay otro error de integridad
            Exception: Para otros errores
        """
        query = """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id, name, email, password_hash, created_at, 
                      updated_at, is_active, last_login
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (name, email, password_hash))
                row = cursor.fetchone()
                return User.from_db_row(row)
        except Exception as e:
            print(f"❌ Error al crear usuario: {e}")
            # Re-lanzar la excepción para que sea manejada por el servicio
            raise
    
    @staticmethod
    def find_by_email(email: str) -> Optional[User]:
        """
        Busca un usuario por email
        
        Args:
            email (str): Email del usuario
            
        Returns:
            User: Usuario encontrado o None
        """
        query = """
            SELECT id, name, email, password_hash, created_at, 
                   updated_at, is_active, last_login
            FROM users
            WHERE email = %s AND is_active = true
        """
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (email,))
                row = cursor.fetchone()
                return User.from_db_row(row)
        except Exception as e:
            print(f"❌ Error al buscar usuario por email: {e}")
            return None
    
    @staticmethod
    def find_by_id(user_id: str) -> Optional[User]:
        """
        Busca un usuario por ID
        
        Args:
            user_id (str): ID del usuario
            
        Returns:
            User: Usuario encontrado o None
        """
        query = """
            SELECT id, name, email, password_hash, created_at, 
                   updated_at, is_active, last_login
            FROM users
            WHERE id = %s AND is_active = true
        """
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (user_id,))
                row = cursor.fetchone()
                return User.from_db_row(row)
        except Exception as e:
            print(f"❌ Error al buscar usuario por ID: {e}")
            return None
    
    @staticmethod
    def update_last_login(user_id: str) -> bool:
        """
        Actualiza la fecha del último login
        
        Args:
            user_id (str): ID del usuario
            
        Returns:
            bool: True si se actualizó correctamente
        """
        query = """
            UPDATE users
            SET last_login = %s
            WHERE id = %s
        """
        
        try:
            with Database.get_cursor(commit=True) as cursor:
                cursor.execute(query, (datetime.now(), user_id))
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error al actualizar last_login: {e}")
            return False
    
    @staticmethod
    def email_exists(email: str) -> bool:
        """
        Verifica si un email ya existe
        
        Args:
            email (str): Email a verificar
            
        Returns:
            bool: True si existe
        """
        query = "SELECT EXISTS(SELECT 1 FROM users WHERE email = %s)"
        
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, (email,))
                result = cursor.fetchone()
                return result['exists'] if result else False
        except Exception as e:
            print(f"❌ Error al verificar email: {e}")
            # En caso de error, retornar False para no bloquear el registro
            # La verificación real se hará en el INSERT con el constraint
            return False