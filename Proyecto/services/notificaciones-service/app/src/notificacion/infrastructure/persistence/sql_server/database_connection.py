import pyodbc
from os import getenv
from dotenv import load_dotenv
from typing import Optional, ContextManager
from contextlib import contextmanager

class DatabaseConnection:
    def __init__(self, connection_string: Optional[str] = None):
        load_dotenv()
        self.connection_string = connection_string or getenv("SQL_CONNECTION_STRING")
        self.db_host= getenv("DB_HOST", "mssql")
        self.db_port = getenv("DB_PORT", "1433")
        self.db_name = getenv("DB_NAME", "EconoMarketNotificacionesDB")
        self.db_user = getenv("DB_USER", "sa")
        self.db_password = getenv("DB_PASSWORD", "YourStrong@Passw0rd123!")
    
    @contextmanager
    def get_connection(self):
        print("Usando connection string:", self.connection_string)

        """Context manager para conexiones seguras (RAII pattern)"""
        conn = None
        try:
            conection_string = f"""DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={self.db_host},{self.db_port};Database={self.db_name};UID={self.db_user};PWD={self.db_password};Encrypt=no;TrustServerCertificate=yes;"""
            conn = pyodbc.connect(conection_string)
            yield conn
        except pyodbc.Error as e:
            if conn:
                conn.close()
            raise e
        finally:
            if conn:
                conn.close()