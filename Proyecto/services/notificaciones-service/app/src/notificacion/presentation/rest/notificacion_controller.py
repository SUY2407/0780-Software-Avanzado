from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from ...application.services.notificacion_service import NotificacionService
from fastapi import Request
from ...domain.entities.proveedor import NotificacionProveedor
from ...domain.entities.producto import ProductoNotificacion
from ...domain.entities.cliente import NotificacionCliente

router = APIRouter(prefix="/notificaciones", tags=["notificaciones"])

_get_notificacion_service = None

def configure_dependencies(get_notificacion_service):
    global _get_notificacion_service
    _get_notificacion_service = get_notificacion_service

def _service_dep() -> NotificacionService:
    if _get_notificacion_service is None:
        raise RuntimeError("NotificacionService dependency not configured")
    return _get_notificacion_service()

# Pydantic models equivalentes a proto messages
class ProductoNotificacionCreate(BaseModel):
    id_producto: int

class ProveedorNotificacionCreate(BaseModel):
    id_proveedor: int
    estado: str
    created_at: str
    mensaje: str
    productos: List[ProductoNotificacionCreate] = []

class ClienteNotificacionCreate(BaseModel):
    id_usuario: int
    id_carro: int
    estado: str
    tipo: str
    created_at: str
    id_orden: str
    productos: List[ProductoNotificacionCreate] = []

class ProveedorNotificacionResponse(BaseModel):
    id_proveedor: int
    estado: str
    created_at: str
    mensaje: str
    resultado: str

class ClienteNotificacionResponse(BaseModel):
    id_usuario: int
    id_carro: int
    estado: str
    tipo: str
    created_at: str
    resultado: str

@router.post("/proveedor", response_model=ProveedorNotificacionResponse, status_code=201)
async def crear_proveedor_notificacion(
    notif_data: ProveedorNotificacionCreate, 
    service: NotificacionService = Depends(_service_dep)
):
    """ProveedorNotificacion → Exactamente igual que GRPC"""
    # Convertir productos como en GRPC
    productos = [ProductoNotificacion(id_producto=p.id_producto) for p in notif_data.productos]

    datos_notificacion = {
        "id_proveedor": notif_data.id_proveedor,
        "estado": notif_data.estado,
        "created_at": notif_data.created_at,
        "mensaje": notif_data.mensaje,
        "productos": productos
    }
    notif_proveedor = NotificacionProveedor(
        id_proveedor=notif_data.id_proveedor,
        estado=notif_data.estado,
        created_at=notif_data.created_at,
        mensaje=notif_data.mensaje,
        productos=productos
    )
    
    print("Procesando Notificación de Proveedor:", notif_proveedor)
    _, mensaje = service.crear_proveedor_notificacion(notif_proveedor)
    
    return ProveedorNotificacionResponse(
        id_proveedor=notif_data.id_proveedor,
        estado=notif_data.estado,
        created_at=notif_data.created_at,
        mensaje=notif_data.mensaje,
        resultado=mensaje
    )

@router.post("/cliente", response_model=ClienteNotificacionResponse, status_code=201)
async def crear_cliente_notificacion(
    notif_data: ClienteNotificacionCreate, 
    service: NotificacionService = Depends(_service_dep)
):
    """ClienteNotificacion → Exactamente igual que GRPC"""
    productos = [ProductoNotificacion(id_producto=p.id_producto,cantidad=p.cantidad) for p in notif_data.productos]
    notif_cliente = NotificacionCliente(
            id_usuario=notif_data.id_usuario,
            id_carro=notif_data.id_carro,
            estado=notif_data.estado,
            tipo=notif_data.tipo,
            created_at=notif_data.created_at,
            id_orden=notif_data.id_orden,
            productos = productos
        )
    
    _, mensaje = service.crear_cliente_notificacion(notif_cliente)
    
    return ClienteNotificacionResponse(
        id_usuario=notif_data.id_usuario,
        id_carro=notif_data.id_carro,
        estado=notif_data.estado,
        tipo=notif_data.tipo,
        created_at=notif_data.created_at,
        resultado=mensaje
    )

@router.get("/healthready")
async def health_ready():
    return {"status": "ready"}

@router.get("/healthlive")
async def health_live():
    return {"status": "alive"}