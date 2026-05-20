from ...application.services.notificacion_service import NotificacionService
from . import notificacion_pb2, notificacion_pb2_grpc
from ...domain.entities.proveedor import NotificacionProveedor
from ...domain.entities.producto import ProductoNotificacion
from ...domain.entities.cliente import NotificacionCliente
import grpc
import traceback

class GRPCServicerFactory:
    """Factory para crear servicer (SRP)"""
    def __init__(self, service: NotificacionService):
        self.service = service
    
    def get_servicer(self, service=None) -> notificacion_pb2_grpc.NotificacionServicer:
        return NotificacionServicer(self.service)

class NotificacionServicer(notificacion_pb2_grpc.NotificacionServicer):
    def __init__(self, service: NotificacionService):
        self.service = service

    def ProveedorNotificacion(self, request, context):
        try:
            productos = [
                ProductoNotificacion(id_producto=p.id_producto, cantidad=p.cantidad)
                for p in request.productos
            ]
            notif_proveedor = NotificacionProveedor(
                id_proveedor=request.id_proveedor,
                estado=request.estado,
                created_at=request.created_at,
                mensaje=request.mensaje,
                productos=productos,
            )

            _, mensaje = self.service.crear_proveedor_notificacion(notif_proveedor)

            return notificacion_pb2.ProveedorNotificacionResponse(
                id_proveedor=request.id_proveedor,
                estado=request.estado,
                created_at=request.created_at,
                mensaje=request.mensaje,
                resultado=mensaje,
            )
        except Exception as e:
            print("Error en ProveedorNotificacion:", e)
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return notificacion_pb2.ProveedorNotificacionResponse()

    def ClienteNotificacion(self, request, context):
        try:
            productos = [
                ProductoNotificacion(id_producto=p.id_producto, cantidad=p.cantidad)
                for p in request.productos
            ]
            notif_cliente = NotificacionCliente(
                id_usuario=request.id_usuario,
                id_carro=request.id_carro,
                estado=request.estado,
                tipo=request.tipo,
                created_at=request.created_at,
                id_orden=request.id_orden,
                productos=productos,
            )

            _, mensaje = self.service.crear_cliente_notificacion(notif_cliente)

            return notificacion_pb2.ClienteNotificacionResponse(
                id_usuario=request.id_usuario,
                id_carro=request.id_carro,
                estado=request.estado,
                tipo=request.tipo,
                created_at=request.created_at,
                resultado=mensaje,
            )
        except Exception as e:
            print("Error en ClienteNotificacion:", e)
            traceback.print_exc()
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return notificacion_pb2.ClienteNotificacionResponse()