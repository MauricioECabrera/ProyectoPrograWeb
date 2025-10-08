from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.connection import Database
from controllers.auth_controller import auth_bp

def create_app():
    """Factory para crear la aplicación Flask"""
    
    app = Flask(__name__)
    
    # Configuración
    app.config.from_object(Config)
    
    # CORS
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp)
    
    # Ruta de prueba
    @app.route('/health', methods=['GET'])
    def health_check():
        """Endpoint para verificar el estado del servidor"""
        db_status = Database.test_connection()
        return jsonify({
            'status': 'ok' if db_status else 'error',
            'database': 'connected' if db_status else 'disconnected',
            'message': 'API Ánima funcionando correctamente' if db_status else 'Error de conexión a BD'
        }), 200 if db_status else 500
    
    @app.route('/', methods=['GET'])
    def root():
        """Ruta raíz"""
        return jsonify({
            'message': 'API Ánima - Backend',
            'version': '1.0.0',
            'endpoints': {
                'health': '/health',
                'auth': {
                    'register': '/auth/register',
                    'login': '/auth/login',
                    'verify': '/auth/verify',
                    'me': '/auth/me'
                }
            }
        }), 200
    
    # Manejador de errores 404
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint no encontrado'
        }), 404
    
    # Manejador de errores 500
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500
    
    return app

def main():
    """Función principal para ejecutar la aplicación"""
    
    # Crear aplicación
    app = create_app()
    
    # Probar conexión a base de datos
    print("\n🔍 Verificando conexión a base de datos...")
    if Database.test_connection():
        print("✅ Base de datos conectada correctamente\n")
    else:
        print("❌ Error al conectar con la base de datos\n")
        return
    
    # Iniciar servidor
    print(f"🚀 Servidor iniciando en http://{Config.HOST}:{Config.PORT}")
    print(f"🌍 Entorno: {'Desarrollo' if Config.DEBUG else 'Producción'}")
    print(f"🔐 CORS habilitado para: {', '.join(Config.CORS_ORIGINS)}\n")
    
    try:
        app.run(
            host=Config.HOST,
            port=Config.PORT,
            debug=Config.DEBUG
        )
    except KeyboardInterrupt:
        print("\n\n⏹️  Servidor detenido")
    finally:
        Database.close_connection()

if __name__ == '__main__':
    main()