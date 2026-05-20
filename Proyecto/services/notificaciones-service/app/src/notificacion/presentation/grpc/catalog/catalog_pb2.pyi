from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Empty(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class Product(_message.Message):
    __slots__ = ("id", "sku", "name", "description", "price", "stock", "category", "imageUrl", "providerId")
    ID_FIELD_NUMBER: _ClassVar[int]
    SKU_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    STOCK_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    IMAGEURL_FIELD_NUMBER: _ClassVar[int]
    PROVIDERID_FIELD_NUMBER: _ClassVar[int]
    id: int
    sku: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    imageUrl: str
    providerId: int
    def __init__(self, id: _Optional[int] = ..., sku: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., price: _Optional[float] = ..., stock: _Optional[int] = ..., category: _Optional[str] = ..., imageUrl: _Optional[str] = ..., providerId: _Optional[int] = ...) -> None: ...

class ListProductsResponse(_message.Message):
    __slots__ = ("products",)
    PRODUCTS_FIELD_NUMBER: _ClassVar[int]
    products: _containers.RepeatedCompositeFieldContainer[Product]
    def __init__(self, products: _Optional[_Iterable[_Union[Product, _Mapping]]] = ...) -> None: ...

class ProductIdRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class CreateProductRequest(_message.Message):
    __slots__ = ("sku", "name", "description", "price", "stock", "category", "imageUrl", "providerId")
    SKU_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    STOCK_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    IMAGEURL_FIELD_NUMBER: _ClassVar[int]
    PROVIDERID_FIELD_NUMBER: _ClassVar[int]
    sku: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    imageUrl: str
    providerId: int
    def __init__(self, sku: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., price: _Optional[float] = ..., stock: _Optional[int] = ..., category: _Optional[str] = ..., imageUrl: _Optional[str] = ..., providerId: _Optional[int] = ...) -> None: ...

class UpdateProductRequest(_message.Message):
    __slots__ = ("id", "sku", "name", "description", "price", "stock", "category", "imageUrl", "providerId")
    ID_FIELD_NUMBER: _ClassVar[int]
    SKU_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    STOCK_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    IMAGEURL_FIELD_NUMBER: _ClassVar[int]
    PROVIDERID_FIELD_NUMBER: _ClassVar[int]
    id: int
    sku: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    imageUrl: str
    providerId: int
    def __init__(self, id: _Optional[int] = ..., sku: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., price: _Optional[float] = ..., stock: _Optional[int] = ..., category: _Optional[str] = ..., imageUrl: _Optional[str] = ..., providerId: _Optional[int] = ...) -> None: ...

class GenericResponse(_message.Message):
    __slots__ = ("message",)
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    message: str
    def __init__(self, message: _Optional[str] = ...) -> None: ...
