package cliente

import (
	"context"
	"fmt"
	"log"
	orderspb "payment-service/orderspb"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type OrdersClient struct {
	conn    *grpc.ClientConn
	cliente orderspb.OrdersServiceClient
}

// NewOrdersClient crea una nueva instancia del cliente gRPC
func NewOrdersClient(address string) (*OrdersClient, error) {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect: %w", err)
	}

	client := orderspb.NewOrdersServiceClient(conn)

	return &OrdersClient{
		conn:    conn,
		cliente: client,
	}, nil
}

// Close cierra la conexión gRPC
func (c *OrdersClient) Close() error {
	return c.conn.Close()
}

func (c *OrdersClient) Cliente() orderspb.OrdersServiceClient {
	return c.cliente
}

// CreateOrder crea una nueva orden con items específicos
func (c *OrdersClient) CreateOrder(ctx context.Context, userID int32, items []*orderspb.OrderItemRequest) (*orderspb.OrderResponse, error) {
	req := &orderspb.CreateOrderRequest{
		UserId: userID,
		Items:  items,
	}

	log.Printf("[Client] CreateOrder - User: %d, Items: %d", userID, len(items))

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	resp, err := c.cliente.CreateOrder(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error creating order: %w", err)
	}

	log.Printf("[Client] CreateOrder Response - OrderID: %s, Total: %.2f, Status: %s",
		resp.Id, resp.Total, resp.Status)

	return resp, nil
}

// CreateOrderFromCart crea una orden desde el carrito del usuario
func (c *OrdersClient) CreateOrderFromCart(ctx context.Context, userID int32) (*orderspb.OrderResponse, error) {
	req := &orderspb.CreateOrderFromCartRequest{
		UserId: userID,
	}

	log.Printf("[Client] CreateOrderFromCart - User: %d", userID)

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	resp, err := c.cliente.CreateOrderFromCart(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error creating order from cart: %w", err)
	}

	log.Printf("[Client] CreateOrderFromCart Response - OrderID: %s, Total: %.2f, Status: %s",
		resp.Id, resp.Total, resp.Status)

	return resp, nil
}

// GetOrder obtiene una orden por su ID
func (c *OrdersClient) GetOrder(ctx context.Context, orderID string) (*orderspb.OrderResponse, error) {
	req := &orderspb.GetOrderRequest{
		OrderId: orderID,
	}

	log.Printf("[Client] GetOrder - OrderID: %s", orderID)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	resp, err := c.cliente.GetOrder(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error getting order: %w", err)
	}

	log.Printf("[Client] GetOrder Response - OrderID: %s, UserID: %d, Total: %.2f, Status: %s",
		resp.Id, resp.UserId, resp.Total, resp.Status)

	return resp, nil
}

// GetOrdersByUser obtiene todas las órdenes de un usuario
func (c *OrdersClient) GetOrdersByUser(ctx context.Context, userID int32) (*orderspb.OrdersListResponse, error) {
	req := &orderspb.GetOrdersByUserRequest{
		UserId: userID,
	}

	log.Printf("[Client] GetOrdersByUser - User: %d", userID)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	resp, err := c.cliente.GetOrdersByUser(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error getting orders by user: %w", err)
	}

	log.Printf("[Client] GetOrdersByUser Response - Orders count: %d", len(resp.Orders))

	return resp, nil
}

// GetAllOrders obtiene todas las órdenes del sistema
func (c *OrdersClient) GetAllOrders(ctx context.Context) (*orderspb.OrdersListResponse, error) {
	req := &orderspb.Empty{}

	log.Printf("[Client] GetAllOrders")

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	resp, err := c.cliente.GetAllOrders(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error getting all orders: %w", err)
	}

	log.Printf("[Client] GetAllOrders Response - Orders count: %d", len(resp.Orders))

	return resp, nil
}

// UpdateOrderStatus actualiza el estado de una orden
func (c *OrdersClient) UpdateOrderStatus(ctx context.Context, orderID, status, paymentReference string) (*orderspb.OrderResponse, error) {
	req := &orderspb.UpdateOrderStatusRequest{
		OrderId:          orderID,
		Status:           status,
		PaymentReference: paymentReference,
	}

	log.Printf("[Client] UpdateOrderStatus - OrderID: %s, Status: %s, PaymentRef: %s",
		orderID, status, paymentReference)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	resp, err := c.cliente.UpdateOrderStatus(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error updating order status: %w", err)
	}

	log.Printf("[Client] UpdateOrderStatus Response - OrderID: %s, Status: %s",
		resp.Id, resp.Status)

	return resp, nil
}

// Helper function para crear items de orden
func NewOrderItem(productID int32, productName string, quantity int32, unitPrice float64) *orderspb.OrderItemRequest {
	return &orderspb.OrderItemRequest{
		ProductId:   productID,
		ProductName: productName,
		Quantity:    quantity,
		UnitPrice:   unitPrice,
	}
}
