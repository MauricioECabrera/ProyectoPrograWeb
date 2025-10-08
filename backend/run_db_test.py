from database.connection import Database

if __name__ == '__main__':
    print('🔍 Verificando conexión a base de datos...')
    ok = Database.test_connection()
    if ok:
        print('✅ Conexión correcta')
    else:
        print('❌ Error al conectar con la base de datos')
