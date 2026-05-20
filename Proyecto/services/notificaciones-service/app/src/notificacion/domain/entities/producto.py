from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List

@dataclass
class ProductoNotificacion:
    id_producto: Optional[int] = None
    cantidad: Optional[int] = None
