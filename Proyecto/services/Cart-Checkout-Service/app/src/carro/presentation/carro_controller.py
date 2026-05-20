
from ..application.services.carro_service import CarroService
from . import carro_pb2, carro_pb2_grpc

class GRPCServicerFactory:
    """Factory para crear servicer (SRP)"""
    def __init__(self, service: CarroService):
        self.service = service
    
    def get_servicer(self) -> carro_pb2_grpc.GreetServicer:
        return CarroServicer(self.service)

class CarroServicer(carro_pb2_grpc.GreetServicer):  # ← PRESENTATION
    def __init__(self, service: CarroService):
        self.service = service  # Dependency Injection
    
    def GuardarCarro(self, request, context):
        array, total = self.convertirResquestaJSON(request.productos)
        datos_carro ={
            "id_usuario" : request.id_usuario,
            "estado": request.estado,
            "created_at": request.created_at,
            "check_out": request.check_out,
            "total": total,
            "updated_at": request.updated_at,
            "productos":array 
        }
        result = self.service.guardar_carro(datos_carro)
        return carro_pb2.GuardarCarroResponse(resultado=result)
    
    def ObtenerCarro(self, request, context):
        datos_carro ={
            "id_usuario" : request.id_usuario,
            "estado": request.estado,
            "check_out": request.check_out,
        }
        carro = self.service.obtener_carro(datos_carro)
        return carro_pb2.ObtenerCarroResponse(
            id_carro=carro.id_carro if carro else 0,
            id_usuario=carro.id_usuario if carro else 0,
            estado=carro.estado if carro else "",
            created_at=carro.created_at if carro else "",
            check_out=carro.check_out if carro else False,
            total=carro.total if carro else 0.0,
            updated_at=carro.updated_at if carro else "",
            productos=[
                carro_pb2.ProductoCarro(
                    id_producto=producto.id_producto,
                    cantidad=producto.cantidad,
                    precio=producto.precio
                ) for producto in carro.productos
            ] if carro and carro.productos else []
            )
    
    def convertirResquestaJSON(self, productos):
        array = []
        total = 0
        if productos is None:
            return array
        for producto in productos:
            prod_dict = {
                "id_producto": producto.id_producto,
                "cantidad": producto.cantidad,
                "precio": producto.precio
            }
            total += producto.cantidad * producto.precio
            array.append(prod_dict)
        return array, total
    
    def ActualizarEstado(self, request, context):
        datos_carro ={
            "id_carro" : request.id_carro,
            "estado": request.estado,
            "check_out": request.check_out,
        }
        result = self.service.actualizar_estados(datos_carro)
        return carro_pb2.ActualizarEstadoResponse(resultado=result)
    
    def ActualizarFecha(self, request, context):
        datos_carro ={
            "id_usuario" : request.id_usuario,
            "estado": request.estado,
            "check_out": request.check_out,
            "updated_at": request.updated_at,
        }
        result = self.service.actualizar_fecha(datos_carro)
        return carro_pb2.ActualizarFechaResponse(resultado=result)