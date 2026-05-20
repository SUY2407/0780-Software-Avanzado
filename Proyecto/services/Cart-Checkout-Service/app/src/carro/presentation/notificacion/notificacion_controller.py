import grpc
from . import notificacion_pb2
from . import notificacion_pb2_grpc
import os

class NotificacionGrpcClient:
    def __init__(self) -> None:
        target_host = os.getenv("NOTIFICACION_SERVICE_HOST", "notificacion-service")
        target_port = os.getenv("NOTIFICACION_SERVICE_PORT", "50056")
        target = f"{target_host}:{target_port}"
        self.channel = grpc.insecure_channel(target)
        self.stub = notificacion_pb2_grpc.NotificacionStub(self.channel)

    def cliente_notificacion(self, id_usuario: int, id_carro: int, estado: str, 
                           tipo: str, created_at: str, id_orden: str, 
                           productos: list = None) -> notificacion_pb2.ClienteNotificacionResponse:
        """
        Envía notificación para cliente
        """
        if productos is None:
            productos = []
        
        request = notificacion_pb2.ClienteNotificacionRequest(
            id_usuario=id_usuario,
            id_carro=id_carro,
            estado=estado,
            tipo=tipo,
            created_at=created_at,
            id_orden=id_orden,
            productos=[
                notificacion_pb2.ProductoNotificacion(
                    id_producto=producto.id_producto,
                    cantidad=producto.cantidad
                ) for producto in productos
            ]
        )
        return self.stub.ClienteNotificacion(request)