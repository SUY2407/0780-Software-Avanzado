from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ProductoNotificacion(_message.Message):
    __slots__ = ("id_producto", "cantidad")
    ID_PRODUCTO_FIELD_NUMBER: _ClassVar[int]
    CANTIDAD_FIELD_NUMBER: _ClassVar[int]
    id_producto: int
    cantidad: int
    def __init__(self, id_producto: _Optional[int] = ..., cantidad: _Optional[int] = ...) -> None: ...

class ProveedorNotificacionRequest(_message.Message):
    __slots__ = ("id_proveedor", "estado", "created_at", "mensaje", "productos")
    ID_PROVEEDOR_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    MENSAJE_FIELD_NUMBER: _ClassVar[int]
    PRODUCTOS_FIELD_NUMBER: _ClassVar[int]
    id_proveedor: int
    estado: str
    created_at: str
    mensaje: str
    productos: _containers.RepeatedCompositeFieldContainer[ProductoNotificacion]
    def __init__(self, id_proveedor: _Optional[int] = ..., estado: _Optional[str] = ..., created_at: _Optional[str] = ..., mensaje: _Optional[str] = ..., productos: _Optional[_Iterable[_Union[ProductoNotificacion, _Mapping]]] = ...) -> None: ...

class ProveedorNotificacionResponse(_message.Message):
    __slots__ = ("id_proveedor", "estado", "created_at", "mensaje", "resultado")
    ID_PROVEEDOR_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    MENSAJE_FIELD_NUMBER: _ClassVar[int]
    RESULTADO_FIELD_NUMBER: _ClassVar[int]
    id_proveedor: int
    estado: str
    created_at: str
    mensaje: str
    resultado: str
    def __init__(self, id_proveedor: _Optional[int] = ..., estado: _Optional[str] = ..., created_at: _Optional[str] = ..., mensaje: _Optional[str] = ..., resultado: _Optional[str] = ...) -> None: ...

class ClienteNotificacionRequest(_message.Message):
    __slots__ = ("id_usuario", "id_carro", "estado", "tipo", "created_at", "id_orden", "productos")
    ID_USUARIO_FIELD_NUMBER: _ClassVar[int]
    ID_CARRO_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    TIPO_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    ID_ORDEN_FIELD_NUMBER: _ClassVar[int]
    PRODUCTOS_FIELD_NUMBER: _ClassVar[int]
    id_usuario: int
    id_carro: int
    estado: str
    tipo: str
    created_at: str
    id_orden: str
    productos: _containers.RepeatedCompositeFieldContainer[ProductoNotificacion]
    def __init__(self, id_usuario: _Optional[int] = ..., id_carro: _Optional[int] = ..., estado: _Optional[str] = ..., tipo: _Optional[str] = ..., created_at: _Optional[str] = ..., id_orden: _Optional[str] = ..., productos: _Optional[_Iterable[_Union[ProductoNotificacion, _Mapping]]] = ...) -> None: ...

class ClienteNotificacionResponse(_message.Message):
    __slots__ = ("id_usuario", "id_carro", "estado", "tipo", "created_at", "resultado")
    ID_USUARIO_FIELD_NUMBER: _ClassVar[int]
    ID_CARRO_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    TIPO_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    RESULTADO_FIELD_NUMBER: _ClassVar[int]
    id_usuario: int
    id_carro: int
    estado: str
    tipo: str
    created_at: str
    resultado: str
    def __init__(self, id_usuario: _Optional[int] = ..., id_carro: _Optional[int] = ..., estado: _Optional[str] = ..., tipo: _Optional[str] = ..., created_at: _Optional[str] = ..., resultado: _Optional[str] = ...) -> None: ...
