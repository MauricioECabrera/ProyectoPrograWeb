from psycopg import connect
from psycopg.rows import dict_row
from contextlib import contextmanager
from config import Config


class Database:
    """Clase para manejar la conexión a PostgreSQL usando psycopg (v3)

    This replaces psycopg2 usage with psycopg 3 which provides binary
    wheels on Windows and a compatible API when using dict_row for
    RealDict-like rows.
    """

    _connection = None

    @classmethod
    def get_connection(cls):
        """Obtiene o crea una conexión a la base de datos"""
        if cls._connection is None or cls._connection.closed:
            try:
                cls._connection = connect(
                    Config.get_db_url(),
                    row_factory=dict_row
                )
                print("✅ Conexión exitosa a PostgreSQL")
            except Exception as e:
                print(f"❌ Error al conectar a PostgreSQL: {e}")
                raise
        return cls._connection

    @classmethod
    @contextmanager
    def get_cursor(cls, commit=False):
        """
        Context manager para obtener un cursor de base de datos

        Args:
            commit (bool): Si True, hace commit automático al finalizar

        Yields:
            cursor: Cursor de PostgreSQL
        """
        conn = cls.get_connection()
        with conn.cursor() as cursor:
            try:
                yield cursor
                if commit:
                    conn.commit()
            except Exception:
                conn.rollback()
                raise

    @classmethod
    def close_connection(cls):
        """Cierra la conexión a la base de datos"""
        if cls._connection and not cls._connection.closed:
            cls._connection.close()
            print("🔒 Conexión cerrada")

    @classmethod
    def test_connection(cls):
        """Prueba la conexión a la base de datos"""
        try:
            with cls.get_cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                return result is not None
        except Exception as e:
            print(f"❌ Error en test de conexión: {e}")
            return False