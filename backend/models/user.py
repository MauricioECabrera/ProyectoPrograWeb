from datetime import datetime
from typing import Optional, Dict, Any

class User:
    """Modelo de Usuario"""
    
    def __init__(self, id: str = None, name: str = None, email: str = None, 
                 password_hash: str = None, created_at: datetime = None, 
                 updated_at: datetime = None, is_active: bool = True, 
                 last_login: datetime = None):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at
        self.updated_at = updated_at
        self.is_active = is_active
        self.last_login = last_login
    
    def to_dict(self, include_password: bool = False) -> Dict[str, Any]:
        """
        Convierte el usuario a diccionario
        
        Args:
            include_password (bool): Si incluir el hash de contraseña
            
        Returns:
            Dict: Representación del usuario
        """
        user_dict = {
            'id': str(self.id) if self.id else None,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_password:
            user_dict['password_hash'] = self.password_hash
            
        return user_dict
    
    @staticmethod
    def from_db_row(row: Dict[str, Any]) -> 'User':
        """
        Crea una instancia de User desde una fila de base de datos
        
        Args:
            row (Dict): Fila de la base de datos
            
        Returns:
            User: Instancia del usuario
        """
        if not row:
            return None
            
        return User(
            id=row.get('id'),
            name=row.get('name'),
            email=row.get('email'),
            password_hash=row.get('password_hash'),
            created_at=row.get('created_at'),
            updated_at=row.get('updated_at'),
            is_active=row.get('is_active'),
            last_login=row.get('last_login')
        )
    
    def __repr__(self):
        return f"<User {self.email}>"