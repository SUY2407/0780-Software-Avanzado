from dataclasses import dataclass
from typing import Optional, List

@dataclass
class ProductoCarro:
    id_producto: Optional[int] = None
    cantidad: Optional[int] = None
    precio: Optional[float] = None

@dataclass
class Carro:
    id_carro: Optional[int] = None
    id_usuario: Optional[int] = None
    estado: Optional[str] = None
    created_at: Optional[str] = None
    check_out: Optional[bool] = False
    total: Optional[float] = 0.0
    updated_at: Optional[str] = None
    productos: List[ProductoCarro] = None
    token: Optional[str] = None