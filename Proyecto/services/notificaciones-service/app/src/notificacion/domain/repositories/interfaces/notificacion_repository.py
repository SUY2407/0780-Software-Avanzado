from abc import ABC, abstractmethod
from typing import Optional
from ...entities.cliente import NotificacionCliente
from ...entities.proveedor import NotificacionProveedor

class NotificacionRepositoryInterface(ABC):  # ← Interface oficial
    @abstractmethod
    def crear_proveedor_notificacion(self, notificacionProveedor : NotificacionProveedor) -> None:
        """Crea una notificación para proveedor en persistencia.
        
        Args:
            notificacion_proveedor: Entidad con datos de la notificación.
        """
        pass
    
    @abstractmethod
    def crear_cliente_notificacion(self, notificacionCliente : NotificacionCliente) -> None:
        """Crea una notificación para cliente en persistencia.
        
        Args:
            notificacion_cliente: Entidad con datos de la notificación.
        """
        pass
    @abstractmethod
    def obtener_proveedor_notificacion(self, notificacionProveedor : NotificacionProveedor) -> None:
        """Obtiene una notificación para proveedor en persistencia."""
        pass
    
    @abstractmethod
    def obtener_cliente_notificacion(self, notificacionCliente : NotificacionCliente) -> None:
        """Obtiene una notificación para cliente en persistencia."""
        pass