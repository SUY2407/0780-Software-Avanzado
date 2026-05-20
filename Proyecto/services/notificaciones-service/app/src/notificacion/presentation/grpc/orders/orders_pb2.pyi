from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Empty(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class OrderItemRequest(_message.Message):
    __slots__ = ("product_id", "product_name", "quantity", "unit_price")
    PRODUCT_ID_FIELD_NUMBER: _ClassVar[int]
    PRODUCT_NAME_FIELD_NUMBER: _ClassVar[int]
    QUANTITY_FIELD_NUMBER: _ClassVar[int]
    UNIT_PRICE_FIELD_NUMBER: _ClassVar[int]
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    def __init__(self, product_id: _Optional[int] = ..., product_name: _Optional[str] = ..., quantity: _Optional[int] = ..., unit_price: _Optional[float] = ...) -> None: ...

class CreateOrderRequest(_message.Message):
    __slots__ = ("user_id", "items")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    ITEMS_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    items: _containers.RepeatedCompositeFieldContainer[OrderItemRequest]
    def __init__(self, user_id: _Optional[int] = ..., items: _Optional[_Iterable[_Union[OrderItemRequest, _Mapping]]] = ...) -> None: ...

class CreateOrderFromCartRequest(_message.Message):
    __slots__ = ("user_id",)
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    def __init__(self, user_id: _Optional[int] = ...) -> None: ...

class GetOrderRequest(_message.Message):
    __slots__ = ("order_id",)
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    order_id: str
    def __init__(self, order_id: _Optional[str] = ...) -> None: ...

class GetOrdersByUserRequest(_message.Message):
    __slots__ = ("user_id",)
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    user_id: int
    def __init__(self, user_id: _Optional[int] = ...) -> None: ...

class UpdateOrderStatusRequest(_message.Message):
    __slots__ = ("order_id", "status", "payment_reference")
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_REFERENCE_FIELD_NUMBER: _ClassVar[int]
    order_id: str
    status: str
    payment_reference: str
    def __init__(self, order_id: _Optional[str] = ..., status: _Optional[str] = ..., payment_reference: _Optional[str] = ...) -> None: ...

class OrderItemResponse(_message.Message):
    __slots__ = ("id", "product_id", "product_name", "quantity", "unit_price", "subtotal")
    ID_FIELD_NUMBER: _ClassVar[int]
    PRODUCT_ID_FIELD_NUMBER: _ClassVar[int]
    PRODUCT_NAME_FIELD_NUMBER: _ClassVar[int]
    QUANTITY_FIELD_NUMBER: _ClassVar[int]
    UNIT_PRICE_FIELD_NUMBER: _ClassVar[int]
    SUBTOTAL_FIELD_NUMBER: _ClassVar[int]
    id: str
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float
    def __init__(self, id: _Optional[str] = ..., product_id: _Optional[int] = ..., product_name: _Optional[str] = ..., quantity: _Optional[int] = ..., unit_price: _Optional[float] = ..., subtotal: _Optional[float] = ...) -> None: ...

class OrderResponse(_message.Message):
    __slots__ = ("id", "user_id", "total", "status", "payment_reference", "items", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_REFERENCE_FIELD_NUMBER: _ClassVar[int]
    ITEMS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    user_id: int
    total: float
    status: str
    payment_reference: str
    items: _containers.RepeatedCompositeFieldContainer[OrderItemResponse]
    created_at: str
    updated_at: str
    def __init__(self, id: _Optional[str] = ..., user_id: _Optional[int] = ..., total: _Optional[float] = ..., status: _Optional[str] = ..., payment_reference: _Optional[str] = ..., items: _Optional[_Iterable[_Union[OrderItemResponse, _Mapping]]] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class OrdersListResponse(_message.Message):
    __slots__ = ("orders",)
    ORDERS_FIELD_NUMBER: _ClassVar[int]
    orders: _containers.RepeatedCompositeFieldContainer[OrderResponse]
    def __init__(self, orders: _Optional[_Iterable[_Union[OrderResponse, _Mapping]]] = ...) -> None: ...
