from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
from .producto import ProductoNotificacion

@dataclass
class NotificacionProveedor:
    id_notificacion: Optional[int] = None
    id_proveedor: Optional[int] = None
    estado: Optional[str] = None
    created_at: Optional[datetime] = None
    mensaje: Optional[str] = None
    productos: List[ProductoNotificacion] = None