import grpc
from concurrent import futures
from abc import ABC, abstractmethod
from typing import Any

from notificacion.presentation.grpc.notificacion_pb2_grpc import add_NotificacionServicer_to_server



class GRPCServicerInterface(ABC):
    @abstractmethod
    def get_servicer(self, service: Any) -> Any:
        pass


def start_grpc_server(servicer_factory: GRPCServicerInterface, port="50051"):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    servicer = servicer_factory.get_servicer(None)
    add_NotificacionServicer_to_server(servicer, server)

    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"gRPC server started on port {port}")
    return server