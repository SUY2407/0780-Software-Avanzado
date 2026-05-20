package cliente

import (
	"context"
	"fmt"
	"log"
	notificacionpb "payment-service/notificacionpb"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type NotificationClient struct {
	conn    *grpc.ClientConn
	cliente notificacionpb.NotificacionClient
}

func NewNotificacionClient(address string) (*NotificationClient, error) {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect: %w", err)
	}

	client := notificacionpb.NewNotificacionClient(conn)

	return &NotificationClient{
		conn:    conn,
		cliente: client,
	}, nil
}

func (c *NotificationClient) Close() error {
	return c.conn.Close()
}

func (c *NotificationClient) Cliente() notificacionpb.NotificacionClient {
	return c.cliente
}

func (c *NotificationClient) ProveedorNotificacion(ctx context.Context, idProveedor int32, estado string, mensaje string, productos []*notificacionpb.ProductoNotificacion) (*notificacionpb.ProveedorNotificacionResponse, error) {

	req := &notificacionpb.ProveedorNotificacionRequest{
		IdProveedor: idProveedor,
		Estado:      estado,
		Mensaje:     mensaje,
		CreatedAt:   time.Now().Format(time.RFC3339),
		Productos:   productos,
	}

	log.Printf(
		"[Client] ProveedorNotificacion - Proveedor: %d, Estado: %s",
		idProveedor, estado,
	)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	resp, err := c.cliente.ProveedorNotificacion(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error enviando notificación a proveedor: %w", err)
	}

	log.Printf(
		"[Client] ProveedorNotificacion Response - Proveedor: %d, Resultado: %s",
		resp.IdProveedor, resp.Resultado,
	)

	return resp, nil
}

func (c *NotificationClient) ClienteNotificacion(ctx context.Context, idUsuario int32, idCarro int32, estado, idOrden string, tipo string, productos []*notificacionpb.ProductoNotificacion) (*notificacionpb.ClienteNotificacionResponse, error) {

	req := &notificacionpb.ClienteNotificacionRequest{
		IdUsuario: idUsuario,
		IdCarro:   idCarro,
		Estado:    estado,
		Tipo:      tipo,
		CreatedAt: time.Now().Format(time.RFC3339),
		Productos: productos,
		IdOrden:   idOrden,
	}

	log.Printf(
		"[Client] ClienteNotificacion - Usuario: %d, Carro: %d, Estado: %s, Tipo: %s",
		idUsuario, idCarro, estado, tipo,
	)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	resp, err := c.cliente.ClienteNotificacion(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("error enviando notificación a cliente: %w", err)
	}

	log.Printf(
		"[Client] ClienteNotificacion Response - Usuario: %d, Resultado: %s",
		resp.IdUsuario, resp.Resultado,
	)

	return resp, nil
}
