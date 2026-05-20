import signal
import threading
import time
import sys
from dotenv import load_dotenv
from os import getenv
from carro.infrastructure.persistence.sql_server.database_connection import DatabaseConnection
from carro.infrastructure.persistence.sql_server.carro_sql_repository import CarroSqlRepository

from carro.application.services.carro_service import CarroService
from carro.domain.repositories.interfaces.carro_repository import CarroRepositoryInterface
# gRPC
from carro.infrastructure.servers.grpc_server import start_grpc_server
from carro.presentation.carro_controller import GRPCServicerFactory
from carro.presentation.notificacion.notificacion_controller import NotificacionGrpcClient
from carro.presentation.auth.auth_controller import AuthGrpcClient
# REST
from carro.infrastructure.servers.rest_server import start_rest_server

class ServerManager:
    """Orquestador de servidores (SRP)"""
    def __init__(self):
        self.grpc_server = None
        self.rest_server = None
        self.grpc_thread = None
        self.rest_thread = None
        self.stop_event = threading.Event()
        self.carro_service: CarroService | None = None
        self.grpc_port = 50055
        self.rest_port = 8086
    
    def start_servers(self):
        load_dotenv()

        self.grpc_port = int(getenv("GRPC_PORT", "50055"))
        self.rest_port = int(getenv("HTTP_PORT", "8086"))
        
        db_conn = DatabaseConnection()
             
        carro_repository = CarroSqlRepository(db_conn)

        notificacion_client = NotificacionGrpcClient()

        auth_client = AuthGrpcClient()

        self.carro_service = CarroService(carro_repository, notificacion_client, auth_client)

        # HILO 1: gRPC
        grpc_factory = GRPCServicerFactory(self.carro_service)
        self.grpc_server = self._start_grpc_server_direct(grpc_factory)
        
        self.servers_running = True
        
        # HILO 2: REST (funciona YA, completa después)
        self.rest_thread = threading.Thread(
            target=self._start_rest_thread,
            daemon=True
        )
        self.rest_thread.start()
        
        # Arrancar hilos
        print("🚀 Starting servers...")
        
        # Registrar handler para Ctrl+C
        signal.signal(signal.SIGINT, self._force_shutdown)
        signal.signal(signal.SIGTERM, self._force_shutdown)
        try:
            # Espera principal con timeout
            while self.servers_running:
                time.sleep(1)
        except KeyboardInterrupt:
            self._force_shutdown(None, None)
    
    def _start_grpc_server_direct(self, factory):
        """Arranca gRPC SIN threads bloqueantes"""
        server = start_grpc_server(factory, self.grpc_port)
        print(f"✅ gRPC server running on port {self.grpc_port}")
        return server

    def _start_rest_thread(self):
        """Hilo para REST server"""
        print(f"✅ REST server starting on port {self.rest_port}...")
        start_rest_server("0.0.0.0", self.rest_port, self.carro_service)
    
    def _force_shutdown(self, signum, frame):
        print("\n🛑 Ctrl+C detectado! Cerrando...")
        self.servers_running = False
        
        if self.grpc_server:
            self.grpc_server.stop(0)
            self.grpc_server.wait_for_termination(timeout=3)
            print("✅ gRPC stopped")
        
        if self.rest_thread and self.rest_thread.is_alive():
            print("⏳ Waiting REST server...")
        
        print("👋 Shutdown completo")
        sys.exit(0)

def main():
    manager = ServerManager()
    manager.start_servers()

if __name__ == "__main__":
    main()
