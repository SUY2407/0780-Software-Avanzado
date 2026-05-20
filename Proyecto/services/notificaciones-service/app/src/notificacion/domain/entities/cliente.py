from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
from .producto import ProductoNotificacion


@dataclass
class NotificacionCliente:
    id_notificacion: Optional[int] = None
    id_usuario: Optional[int] = None
    id_carro: Optional[int] = 0
    estado: Optional[str] = None
    tipo: Optional[str] = None
    created_at: Optional[datetime] = None
    id_orden: Optional[str] = ""
    productos: List[ProductoNotificacion] = None