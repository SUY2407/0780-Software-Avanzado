from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ProductoCarro(_message.Message):
    __slots__ = ("id_producto", "cantidad", "precio")
    ID_PRODUCTO_FIELD_NUMBER: _ClassVar[int]
    CANTIDAD_FIELD_NUMBER: _ClassVar[int]
    PRECIO_FIELD_NUMBER: _ClassVar[int]
    id_producto: int
    cantidad: int
    precio: float
    def __init__(self, id_producto: _Optional[int] = ..., cantidad: _Optional[int] = ..., precio: _Optional[float] = ...) -> None: ...

class GuardarCarroRequest(_message.Message):
    __slots__ = ("id_usuario", "estado", "created_at", "check_out", "total", "updated_at", "productos")
    ID_USUARIO_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    PRODUCTOS_FIELD_NUMBER: _ClassVar[int]
    id_usuario: int
    estado: str
    created_at: str
    check_out: bool
    total: float
    updated_at: str
    productos: _containers.RepeatedCompositeFieldContainer[ProductoCarro]
    def __init__(self, id_usuario: _Optional[int] = ..., estado: _Optional[str] = ..., created_at: _Optional[str] = ..., check_out: bool = ..., total: _Optional[float] = ..., updated_at: _Optional[str] = ..., productos: _Optional[_Iterable[_Union[ProductoCarro, _Mapping]]] = ...) -> None: ...

class GuardarCarroResponse(_message.Message):
    __slots__ = ("resultado",)
    RESULTADO_FIELD_NUMBER: _ClassVar[int]
    resultado: str
    def __init__(self, resultado: _Optional[str] = ...) -> None: ...

class ObtenerCarroRequest(_message.Message):
    __slots__ = ("id_usuario", "check_out", "estado")
    ID_USUARIO_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    id_usuario: int
    check_out: bool
    estado: str
    def __init__(self, id_usuario: _Optional[int] = ..., check_out: bool = ..., estado: _Optional[str] = ...) -> None: ...

class ObtenerCarroResponse(_message.Message):
    __slots__ = ("id_carro", "id_usuario", "estado", "created_at", "check_out", "total", "updated_at", "productos")
    ID_CARRO_FIELD_NUMBER: _ClassVar[int]
    ID_USUARIO_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    PRODUCTOS_FIELD_NUMBER: _ClassVar[int]
    id_carro: int
    id_usuario: int
    estado: str
    created_at: str
    check_out: bool
    total: float
    updated_at: str
    productos: _containers.RepeatedCompositeFieldContainer[ProductoCarro]
    def __init__(self, id_carro: _Optional[int] = ..., id_usuario: _Optional[int] = ..., estado: _Optional[str] = ..., created_at: _Optional[str] = ..., check_out: bool = ..., total: _Optional[float] = ..., updated_at: _Optional[str] = ..., productos: _Optional[_Iterable[_Union[ProductoCarro, _Mapping]]] = ...) -> None: ...

class ActualizarEstadoRequest(_message.Message):
    __slots__ = ("id_carro", "estado", "check_out")
    ID_CARRO_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    id_carro: int
    estado: str
    check_out: bool
    def __init__(self, id_carro: _Optional[int] = ..., estado: _Optional[str] = ..., check_out: bool = ...) -> None: ...

class ActualizarEstadoResponse(_message.Message):
    __slots__ = ("resultado",)
    RESULTADO_FIELD_NUMBER: _ClassVar[int]
    resultado: str
    def __init__(self, resultado: _Optional[str] = ...) -> None: ...

class ActualizarFechaRequest(_message.Message):
    __slots__ = ("id_usuario", "check_out", "estado", "updated_at")
    ID_USUARIO_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    ESTADO_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id_usuario: int
    check_out: bool
    estado: str
    updated_at: str
    def __init__(self, id_usuario: _Optional[int] = ..., check_out: bool = ..., estado: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class ActualizarFechaResponse(_message.Message):
    __slots__ = ("resultado",)
    RESULTADO_FIELD_NUMBER: _ClassVar[int]
    resultado: str
    def __init__(self, resultado: _Optional[str] = ...) -> None: ...
