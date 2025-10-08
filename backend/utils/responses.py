"""
Utilidades para respuestas HTTP estandarizadas
"""
from flask import jsonify
from typing import Any, Dict, Optional

class APIResponse:
    """Clase para generar respuestas HTTP estandarizadas"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Operación exitosa", status_code: int = 200):
        """
        Respuesta exitosa
        
        Args:
            data: Datos a retornar
            message: Mensaje de éxito
            status_code: Código HTTP
            
        Returns:
            Response: Respuesta Flask
        """
        response = {
            'success': True,
            'message': message
        }
        
        if data is not None:
            response['data'] = data
        
        return jsonify(response), status_code
    
    @staticmethod
    def error(message: str = "Error en la operación", status_code: int = 400, errors: Optional[Dict] = None):
        """
        Respuesta de error
        
        Args:
            message: Mensaje de error
            status_code: Código HTTP
            errors: Errores adicionales
            
        Returns:
            Response: Respuesta Flask
        """
        response = {
            'success': False,
            'message': message
        }
        
        if errors:
            response['errors'] = errors
        
        return jsonify(response), status_code
    
    @staticmethod
    def created(data: Any, message: str = "Recurso creado exitosamente"):
        """
        Respuesta de recurso creado
        
        Args:
            data: Datos del recurso creado
            message: Mensaje de éxito
            
        Returns:
            Response: Respuesta Flask
        """
        return APIResponse.success(data, message, 201)
    
    @staticmethod
    def unauthorized(message: str = "No autorizado"):
        """
        Respuesta de no autorizado
        
        Args:
            message: Mensaje de error
            
        Returns:
            Response: Respuesta Flask
        """
        return APIResponse.error(message, 401)
    
    @staticmethod
    def forbidden(message: str = "Acceso prohibido"):
        """
        Respuesta de acceso prohibido
        
        Args:
            message: Mensaje de error
            
        Returns:
            Response: Respuesta Flask
        """
        return APIResponse.error(message, 403)
    
    @staticmethod
    def not_found(message: str = "Recurso no encontrado"):
        """
        Respuesta de recurso no encontrado
        
        Args:
            message: Mensaje de error
            
        Returns:
            Response: Respuesta Flask
        """
        return APIResponse.error(message, 404)
    
    @staticmethod
    def validation_error(message: str = "Error de validación", errors: Optional[Dict] = None):
        """
        Respuesta de error de validación
        
        Args:
            message: Mensaje de error
            errors: Errores de validación
            
        Returns:
            Response: Respuesta Flask
        """
        return APIResponse.error(message, 422, errors)
    
    @staticmethod
    def internal_error(message: str = "Error interno del servidor"):
        """
        Respuesta de error interno
        
        Args:
            message: Mensaje de error
            
        Returns:
            Response: Respuesta Flask
        """
        return APIResponse.error(message, 500)