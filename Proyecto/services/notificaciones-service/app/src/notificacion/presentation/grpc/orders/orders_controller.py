import grpc
from . import orders_pb2
from . import orders_pb2_grpc
import os

class OrdersGrpcClient:
    def __init__(self):
        target_host = os.getenv('ORDER_SERVICE_HOST', 'orders-service')
        target_port = os.getenv('ORDER_SERVICE_PORT', '50052')
        target = f"{target_host}:{target_port}"
        self.channel = grpc.insecure_channel(target)
        self.stub = orders_pb2_grpc.OrdersServiceStub(self.channel)

    def create_order(self, user_id: int, items: list) -> orders_pb2.OrderResponse:
        """Crea una orden con ítems específicos"""
        order_items = []
        for item in items:
            order_items.append(orders_pb2.OrderItemRequest(
                product_id=item['product_id'],
                product_name=item['product_name'],
                quantity=item['quantity'],
                unit_price=item['unit_price']
            ))
        
        request = orders_pb2.CreateOrderRequest(
            user_id=user_id,
            items=order_items
        )
        return self.stub.CreateOrder(request)

    def create_order_from_cart(self, user_id: int) -> orders_pb2.OrderResponse:
        """Crea orden directamente desde el carrito del usuario"""
        request = orders_pb2.CreateOrderFromCartRequest(user_id=user_id)
        return self.stub.CreateOrderFromCart(request)

    def get_order(self, order_id: str) -> orders_pb2.OrderResponse:
        """Obtiene una orden por ID"""
        request = orders_pb2.GetOrderRequest(order_id=order_id)
        return self.stub.GetOrder(request)

    def get_orders_by_user(self, user_id: int) -> orders_pb2.OrdersListResponse:
        """Obtiene todas las órdenes de un usuario"""
        request = orders_pb2.GetOrdersByUserRequest(user_id=user_id)
        return self.stub.GetOrdersByUser(request)

    def get_all_orders(self) -> orders_pb2.OrdersListResponse:
        """Obtiene todas las órdenes (admin)"""
        request = orders_pb2.Empty()
        return self.stub.GetAllOrders(request)

    def update_order_status(self, order_id: str, status: str, payment_reference: str = "") -> orders_pb2.OrderResponse:
        """Actualiza el estado de una orden"""
        request = orders_pb2.UpdateOrderStatusRequest(
            order_id=order_id,
            status=status,
            payment_reference=payment_reference
        )
        return self.stub.UpdateOrderStatus(request)
