from ...domain.repositories.interfaces.carro_repository import CarroRepositoryInterface
from carro.domain.entities.carro import Carro
from datetime import datetime, timedelta
from ...presentation.notificacion.notificacion_controller import NotificacionGrpcClient
from ...presentation.auth.auth_controller import AuthGrpcClient

class CarroService:
    def __init__(self, repository: CarroRepositoryInterface, notificacion_client: NotificacionGrpcClient,auth_client: AuthGrpcClient) -> None:
        self.repository = repository
        self.notificacion_client = notificacion_client
        self.auth_client = auth_client

    def guardar_carro(self, datos_carro) -> str:
        carro = Carro(**datos_carro)
        # credenciales = self.auth_client.validate_token(carro.token)
        # if not credenciales.valid:
        #     return None
        print("guardando carrito")
        resultado = self.repository.guardar(carro)
        return str(resultado)
    
    def obtener_carro(self, datos_carro):
        carro = Carro(**datos_carro)
        # credenciales = self.auth_client.validate_token(carro.token)
        # if not credenciales.valid:
        #     return None
        print("obtener_carro")
        return self.repository.obtener_carro(carro)
    
    def actualizar_estados(self, datos_carro) -> str:
        carro = Carro(**datos_carro)
        resultado = self.repository.actualizar_estados(carro)
        return str(resultado)
    
    def actualizar_fecha(self, datos_carro) -> str:
        carro = Carro(**datos_carro)
        # credenciales = self.auth_client.validate_token(carro.token)
        # if not credenciales.valid:
        #     return None
        print("actualizar_fecha")
        carro_actual = self.repository.obtener_carro(carro)
        if not carro_actual:
            return "Carro no encontrado"
        print(self._es_inactivo_mas_dia(carro_actual.updated_at))
        if carro and self._es_inactivo_mas_dia(carro_actual.updated_at):
            self.notificacion_client.cliente_notificacion(carro_actual.id_usuario, carro_actual.id_carro,"enviado","recordatorio",carro_actual.created_at,"",carro_actual.productos)
            print("El carro ha estado inactivo por más de un día. Se enviara correo.")
            pass

        resultado = self.repository.actualizar_fecha(carro)
        return str(resultado)
    
    def _es_inactivo_mas_dia(self, updated_at: str) -> bool:
        try:
            ultima_actualizacion = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
            print("Ultima actualizacion:", datetime.utcnow() - ultima_actualizacion)
            return datetime.utcnow() - ultima_actualizacion > timedelta(days=1)
        except:
            return False