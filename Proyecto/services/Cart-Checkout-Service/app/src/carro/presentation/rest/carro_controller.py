from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from ...application.services.carro_service import CarroService
from fastapi import Request

router = APIRouter(prefix="", tags=["carros"])

_get_carro_service = None

def configure_dependencies(get_carro_service):
    global _get_carro_service
    _get_carro_service = get_carro_service

# Pydantic models (equivalentes a proto messages)
class ProductoCarroCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio: float

def _service_dep() -> CarroService:
    # fallback por si no se configuró (útil en tests)
    if _get_carro_service is None:
        raise RuntimeError("CarroService dependency not configured")
    return _get_carro_service()

class CarroCreate(BaseModel):
    id_usuario: int
    estado: str
    created_at: str
    check_out: bool
    updated_at: str
    productos: List[ProductoCarroCreate] = []

class CarroUpdateEstado(BaseModel):
    id_carro: int
    estado: str
    check_out: bool

class CarroUpdateFecha(BaseModel):
    id_usuario: int
    estado: str
    check_out: bool
    updated_at: str

class CarroResponse(BaseModel):
    id_carro: int
    id_usuario: int
    estado: str
    created_at: str
    check_out: bool
    total: float
    updated_at: str
    productos: List[Dict[str, Any]]

class CarroObtener(BaseModel):
    id_usuario: int
    estado: str
    check_out: bool

@router.post("/guardar", response_model=dict, status_code=201)
async def guardar_carro(carro_data: CarroCreate,request: Request, service: CarroService  = Depends(_service_dep),):
    """GuardarCarro → Exactamente igual que GRPC"""
    
    array, total = _convertir_request_productos(carro_data.productos)
    datos_carro = {
        "id_usuario": carro_data.id_usuario,
        "estado": carro_data.estado,
        "created_at": carro_data.created_at,
        "check_out": carro_data.check_out,
        "total": total,
        "updated_at": carro_data.updated_at,
        "productos": array
    }
    result = service.guardar_carro(datos_carro)
    return {"resultado": result}

@router.post("/obtener", response_model=CarroResponse)
async def obtener_carro(request: Request, service: CarroService = Depends(_service_dep)):
    
    body = await request.json()
    datos_carro = {
        "id_usuario": body["id_usuario"],
        "estado": body["estado"],
        "check_out": body["check_out"],
    }
    
    print("CarroData recibido en REST:", datos_carro)
    carro = service.obtener_carro(datos_carro)
    if not carro:
        raise HTTPException(status_code=404, detail="Token inválido o carro no encontrado")
    
    carro = carro_to_response(carro)
    return carro

@router.put("/estado", response_model=dict)
async def actualizar_estado(carro_data: CarroUpdateEstado, service: CarroService  = Depends(_service_dep),):
    """ActualizarEstado → Exactamente igual que GRPC"""
    datos_carro = {
        "id_carro": carro_data.id_carro,
        "estado": carro_data.estado,
        "check_out": carro_data.check_out,
    }
    result = service.actualizar_estados(datos_carro)
    return {"resultado": result}

@router.put("/fecha", response_model=dict)
async def actualizar_fecha(carro_data: CarroUpdateFecha,request: Request, service: CarroService  = Depends(_service_dep),):
    """ActualizarFecha → Exactamente igual que GRPC"""
    
    datos_carro = {
        "id_usuario": carro_data.id_usuario,
        "estado": carro_data.estado,
        "check_out": carro_data.check_out,
        "updated_at": carro_data.updated_at
    }
    result = service.actualizar_fecha(datos_carro)
    return {"resultado": result}

def _convertir_request_productos(productos: List[ProductoCarroCreate]):
    """Igual que GRPC.convertirResquestaJSON (SRP helper)"""
    array = []
    total = 0
    if not productos:
        return array, total
    for producto in productos:
        prod_dict = {
            "id_producto": producto.id_producto,
            "cantidad": producto.cantidad,
            "precio": producto.precio
        }
        total += producto.cantidad * producto.precio
        array.append(prod_dict)
    return array, total

def carro_to_response(carro: Any) -> CarroResponse:
    return CarroResponse(
        id_carro=carro.id_carro,
        id_usuario=carro.id_usuario,
        estado=carro.estado,
        created_at=carro.created_at,
        check_out=carro.check_out,
        total=carro.total,
        updated_at=carro.updated_at,
        productos=[
            {
                "id_producto": p.id_producto,
                "cantidad": p.cantidad,
                "precio": p.precio,
            }
            for p in carro.productos
        ],
    )

@router.get("/healthready")
async def health_ready():
    return {"status": "ready"}

@router.get("/healthlive")
async def health_live():
    return {"status": "alive"}