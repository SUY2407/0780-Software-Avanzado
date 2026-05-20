package grpc

import (
	"context"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// ============================
// NOTIFICACION GRPC SERVER
// ============================

type NotificacionGRPCServer struct {
	UnimplementedNotificacionServer
}

func NewNotificacionGRPCServer() *NotificacionGRPCServer {
	return &NotificacionGRPCServer{}
}

// ============================
// PROVEEDOR NOTIFICACION
// ============================

func (s *NotificacionGRPCServer) ProveedorNotificacion(
	ctx context.Context,
	req *ProveedorNotificacionRequest,
) (*ProveedorNotificacionResponse, error) {

	// Validaciones
	if req.IdProveedor <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid id_proveedor")
	}

	if req.Estado == "" {
		return nil, status.Error(codes.InvalidArgument, "estado is required")
	}

	if len(req.Productos) == 0 {
		return nil, status.Error(codes.InvalidArgument, "productos is required")
	}

	for _, p := range req.Productos {
		if p.IdProducto <= 0 {
			return nil, status.Error(codes.InvalidArgument, "invalid id_producto")
		}
	}

	// Respuesta
	return &ProveedorNotificacionResponse{
		IdProveedor: req.IdProveedor,
		Estado:      req.Estado,
		CreatedAt:   time.Now().Format(time.RFC3339),
		Mensaje:     req.Mensaje,
		Resultado:   "OK",
	}, nil
}

// ============================
// CLIENTE NOTIFICACION
// ============================

func (s *NotificacionGRPCServer) ClienteNotificacion(
	ctx context.Context,
	req *ClienteNotificacionRequest,
) (*ClienteNotificacionResponse, error) {

	// Validaciones
	if req.IdUsuario <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid id_usuario")
	}

	if req.IdCarro <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid id_carro")
	}

	if req.Estado == "" {
		return nil, status.Error(codes.InvalidArgument, "estado is required")
	}

	if req.Tipo == "" {
		return nil, status.Error(codes.InvalidArgument, "tipo is required")
	}

	if len(req.Productos) == 0 {
		return nil, status.Error(codes.InvalidArgument, "productos is required")
	}

	for _, p := range req.Productos {
		if p.IdProducto <= 0 {
			return nil, status.Error(codes.InvalidArgument, "invalid id_producto")
		}
	}

	// Respuesta
	return &ClienteNotificacionResponse{
		IdUsuario: req.IdUsuario,
		IdCarro:   req.IdCarro,
		Estado:    req.Estado,
		Tipo:      req.Tipo,
		CreatedAt: time.Now().Format(time.RFC3339),
		Resultado: "OK",
	}, nil
}

// ============================
// REGISTRO DEL SERVER
// ============================

func RegisterNotificacionGRPC(grpcServer *grpc.Server) {
	RegisterNotificacionServer(
		grpcServer,
		NewNotificacionGRPCServer(),
	)
}
