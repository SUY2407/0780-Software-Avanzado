package service

import (
	"context"
	"fmt"
	"log"
	"payment-service/internal/cliente"
	"payment-service/internal/repository"
	"payment-service/notificacionpb"
	"time"
)

type PaymentServiceInterface interface {
	ProcesarPago(ctx context.Context, usuarioId int64, ordenId string, Total, montoWallet, MontoTarjeta float64, metodoPagoId string) (*ProcesarPagoResult, error)
	ObtenerBalance(ctx context.Context, usuarioId int64) (float64, string, error)
	AgregarBalance(ctx context.Context, walletId string, usuarioId int64, monto float64) (float64, error)
	ObtenerTransaccion(ctx context.Context, transaccionId string) (repository.Transaccion, error)
	CrearWallet(ctx context.Context, usuarioId int64, moneda string) (string, string, error)
	CrearMetodoPago(ctx context.Context, usuarioId int64, tipo, numero string) (string, error)
	ObtenerMetodosPago(ctx context.Context, usuarioId int64) ([]repository.MetodoPago, error)
	DesactivarMetodoPago(ctx context.Context, metodoId string) (string, error)
}

type PaymentService struct {
	repo               *repository.PaymentRepository
	ordersClient       *cliente.OrdersClient
	notificacionClient *cliente.NotificationClient
}

type ProcesarPagoResult struct {
	TransaccionId string
	Mensaje       string
	Exito         bool
	Status        bool
}

func NewPaymentService(
	repo *repository.PaymentRepository,
	ordersClient *cliente.OrdersClient,
	notificacionClient *cliente.NotificationClient,
) *PaymentService {
	return &PaymentService{
		repo:               repo,
		ordersClient:       ordersClient,
		notificacionClient: notificacionClient,
	}
}

func (s *PaymentService) ProcesarPago(ctx context.Context, usuarioId int64, ordenId string, Total, montoWallet, MontoTarjeta float64, metodoPagoId string) (*ProcesarPagoResult, error) {
	if montoWallet+MontoTarjeta != Total {
		return &ProcesarPagoResult{
			TransaccionId: "",
			Mensaje:       "La suma de wallet y tarjeta debe ser igual al total",
			Exito:         false,
			Status:        false,
		}, nil
	}

	if MontoTarjeta < 0 || montoWallet < 0 {
		return &ProcesarPagoResult{
			TransaccionId: "",
			Mensaje:       "Los montos no pueden ser negativos",
			Exito:         false,
			Status:        false,
		}, nil
	}

	if Total <= 0 {
		return &ProcesarPagoResult{
			TransaccionId: "",
			Mensaje:       "El total debe ser mayor a cero",
			Exito:         false,
			Status:        false,
		}, nil
	}

	TransaccionId, error := s.repo.ProcesarPago(ctx, usuarioId, ordenId, Total, montoWallet, MontoTarjeta, metodoPagoId)

	if error != nil {
		return &ProcesarPagoResult{
			TransaccionId: "",
			Mensaje:       fmt.Sprintf("Error al procesar pago: %v", error),
			Exito:         false,
			Status:        false,
		}, error
	}

	grpcCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := s.ordersClient.UpdateOrderStatus(grpcCtx, ordenId, "CONFIRMED", TransaccionId)

	if err != nil {
		log.Printf("[SERVICE] Error notificando Orders: %v", err)
		return nil, err
	}

	_, errorNoti := s.notificacionClient.ClienteNotificacion(grpcCtx, int32(usuarioId), 0, "pagado", ordenId, "compra", []*notificacionpb.ProductoNotificacion{})

	if errorNoti != nil {
		log.Printf("[SERVICE] Error al enviar notificacion: %v", errorNoti)
		return nil, errorNoti
	}

	return &ProcesarPagoResult{
		TransaccionId: TransaccionId,
		Mensaje:       "Pago procesado exitosamente",
		Exito:         true,
		Status:        true,
	}, nil
}

func (s *PaymentService) ObtenerBalance(ctx context.Context, usuarioId int64) (float64, string, error) {
	return s.repo.ObtenerBalance(ctx, usuarioId)
}

func (s *PaymentService) AgregarBalance(ctx context.Context, walletId string, usuarioId int64, monto float64) (float64, error) {
	if monto <= 0 {
		return 0.0, fmt.Errorf("el monto debe ser mayor a cero")
	}

	return s.repo.AgregarBalance(ctx, walletId, usuarioId, monto)
}

func (s *PaymentService) ObtenerTransaccion(ctx context.Context, transaccionId string) (repository.Transaccion, error) {
	return s.repo.ObtenerTransaccion(ctx, transaccionId)
}

func (s *PaymentService) CrearWallet(ctx context.Context, usuarioId int64, moneda string) (string, string, error) {
	return s.repo.CrearWallet(ctx, usuarioId, moneda)
}

func (s *PaymentService) CrearMetodoPago(ctx context.Context, usuarioId int64, tipo, numero string) (string, error) {
	return s.repo.CrearMetodoPago(ctx, usuarioId, tipo, numero)
}

func (s *PaymentService) ObtenerMetodosPago(ctx context.Context, usuarioId int64) ([]repository.MetodoPago, error) {
	return s.repo.ObtenerMetodosPago(ctx, usuarioId)
}

func (s *PaymentService) DesactivarMetodoPago(ctx context.Context, metodoId string) (string, error) {
	return s.repo.DescactivarMetodoPago(ctx, metodoId)
}
