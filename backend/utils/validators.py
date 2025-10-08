"""
Utilidades de validación
"""
import re
from typing import Tuple

class Validators:
    """Clase con métodos de validación reutilizables"""
    
    @staticmethod
    def validate_email(email: str) -> Tuple[bool, str]:
        """
        Valida formato de email
        
        Args:
            email (str): Email a validar
            
        Returns:
            Tuple[bool, str]: (es_válido, mensaje)
        """
        if not email:
            return False, "El email es obligatorio"
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(pattern, email):
            return False, "Formato de email inválido"
        
        return True, ""
    
    @staticmethod
    def validate_password(password: str, min_length: int = 6) -> Tuple[bool, str]:
        """
        Valida contraseña
        
        Args:
            password (str): Contraseña a validar
            min_length (int): Longitud mínima
            
        Returns:
            Tuple[bool, str]: (es_válido, mensaje)
        """
        if not password:
            return False, "La contraseña es obligatoria"
        
        if len(password) < min_length:
            return False, f"La contraseña debe tener al menos {min_length} caracteres"
        
        return True, ""
    
    @staticmethod
    def validate_name(name: str, min_length: int = 2) -> Tuple[bool, str]:
        """
        Valida nombre
        
        Args:
            name (str): Nombre a validar
            min_length (int): Longitud mínima
            
        Returns:
            Tuple[bool, str]: (es_válido, mensaje)
        """
        if not name or not name.strip():
            return False, "El nombre es obligatorio"
        
        if len(name.strip()) < min_length:
            return False, f"El nombre debe tener al menos {min_length} caracteres"
        
        return True, ""
    
    @staticmethod
    def sanitize_string(text: str) -> str:
        """
        Limpia y sanitiza un string
        
        Args:
            text (str): Texto a sanitizar
            
        Returns:
            str: Texto sanitizado
        """
        if not text:
            return ""
        
        # Eliminar espacios al inicio y final
        text = text.strip()
        
        # Eliminar espacios múltiples
        text = " ".join(text.split())
        
        return text