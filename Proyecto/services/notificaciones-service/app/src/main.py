import os
import signal
import threading
import time
import sys
from dotenv import load_dotenv
from notificacion.infrastructure.persistence.sql_server.database_connection import DatabaseConnection
from notificacion.infrastructure.persistence.sql_server.notificacion_sql_repository import NotificacionSqlRepository
from notificacion.application.services.notificacion_service import NotificacionService
from notificacion.domain.repositories.interfaces.notificacion_repository import NotificacionRepositoryInterface

from notificacion.application.services.email_service import EmailService

# gRPC
from notificacion.presentation.grpc.notificacion_controller import GRPCServicerFactory  # Corregido typo "rgpc"
from notificacion.presentation.grpc.auth.auth_controller import AuthGrpcClient
from notificacion.presentation.grpc.catalog.catalog_controller import CatalogGrpcClient
from notificacion.presentation.grpc.orders.orders_controller import OrdersGrpcClient
from notificacion.infrastructure.servers.grpc_server import start_grpc_server

# REST (agregar cuando esté listo)
from notificacion.infrastructure.servers.rest_server import start_rest_server

class ServerManager:
    """Orquestador de servidores de notificaciones (SRP)"""
    def __init__(self):
        self.grpc_server = None
        self.rest_server = None
        self.grpc_thread = None
        self.rest_thread = None
        self.stop_event = threading.Event()
        self.notificacion_service: NotificacionService | None = None
        self.servers_running = False
    
    def start_servers(self):
        load_dotenv()
        
        # Conexión a base de datos
        db_conn = DatabaseConnection()
        notificacion_repository = NotificacionSqlRepository(db_conn)
        
        # Crear/instalar servicio con repositorio
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")

        email_service = EmailService(
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            smtp_user=smtp_user,
            smtp_password=smtp_password,
        )

        auth_client = AuthGrpcClient()
        catalog_client = CatalogGrpcClient()
        orders_client = OrdersGrpcClient()

        self.notificacion_service = NotificacionService(notificacion_repository, email_service, auth_client,catalog_client, orders_client)
        # HILO 1: gRPC server
        grpc_factory = GRPCServicerFactory(self.notificacion_service)
        self.grpc_server = self._start_grpc_server_direct(grpc_factory)
        
        self.servers_running = True
        
        # HILO 2: REST server (opcional, funciona independientemente)
        self.rest_thread = threading.Thread(
            target=self._start_rest_thread,
            daemon=True
        )
        self.rest_thread.start()
        
        # Iniciar monitoreo
        print("🚀 Starting notificación servers...")
        
        # Handlers para Ctrl+C
        signal.signal(signal.SIGINT, self._force_shutdown)
        signal.signal(signal.SIGTERM, self._force_shutdown)
        
        try:
            # Loop principal
            while self.servers_running:
                time.sleep(1)
        except KeyboardInterrupt:
            self._force_shutdown(None, None)
    
    def _start_grpc_server_direct(self, factory):
        """Inicia gRPC server sin bloquear"""
        server = start_grpc_server(factory, "50056")  # Puerto diferente al carro
        print("✅ gRPC Notificaciones server running on port 50056")
        return server
    
    def _start_rest_thread(self):
        """Hilo dedicado para REST server"""
        print("✅ REST Notificaciones server starting on port 8087...")
        start_rest_server("0.0.0.0", 8087, self.notificacion_service)
    
    def _force_shutdown(self, signum, frame):
        """Cierra todos los servidores graceful"""
        print("\n🛑 Ctrl+C detectado! Cerrando servidores de notificaciones...")
        self.servers_running = False
        
        if self.grpc_server:
            self.grpc_server.stop(0)
            self.grpc_server.wait_for_termination(timeout=3)
            print("✅ gRPC Notificaciones stopped")
        
        # if self.rest_thread and self.rest_thread.is_alive():
        #     print("⏳ Waiting REST Notificaciones server...")
        
        print("👋 Notificaciones servers shutdown completo")
        sys.exit(0)

def main():
    # Servicio dummy inicial (se reemplaza en start_servers)
    manager = ServerManager()
    manager.start_servers()

if __name__ == "__main__":
    main()
