package handler

import (
	"context"
	"log"
	"payment-service/internal/service"
	pb "payment-service/pb"

	"google.golang.org/protobuf/types/known/timestamppb"
)

type GrpcHandler struct {
	pb.UnimplementedPaymentServiceServer
	service *service.PaymentService
}

func NewGrpcHandler(service *service.PaymentService) *GrpcHandler {
	return &GrpcHandler{service: service}
}

func (h *GrpcHandler) ProcessPayment(ctx context.Context, req *pb.PaymentRequest) (*pb.PaymentResponse, error) {
	log.Printf("[gRPC] ProcesarPago - User: %d, Order: %s, Total: %.2f", req.UsuarioId, req.OrdenId, req.Total)

	res, error := h.service.ProcesarPago(ctx, req.UsuarioId, req.OrdenId, req.Total, req.MontoWallet, req.MontoTarjeta, req.MetodoPago)

	if error != nil {
		log.Printf("[gRPC] ProcesarPago - Error: %v", error)
		return &pb.PaymentResponse{
			TransaccionId: "",
			Mensaje:       error.Error(),
			Exito:         false,
			Status:        pb.PaymentStatus_PAYMENT_FAILED,
		}, nil
	}

	var status pb.PaymentStatus
	if res.Status {
		status = pb.PaymentStatus_PAYMENT_COMPLETED
	} else {
		status = pb.PaymentStatus_PAYMENT_FAILED
	}

	return &pb.PaymentResponse{
		TransaccionId: res.TransaccionId,
		Mensaje:       res.Mensaje,
		Exito:         res.Exito,
		Status:        status,
	}, nil
}

func (h *GrpcHandler) GetBalance(ctx context.Context, req *pb.GetBalanceRequest) (*pb.GetBalanceResponse, error) {
	log.Printf("[gRPC] ObtenerBalance - User: %d", req.UsuarioId)

	balance, moneda, error := h.service.ObtenerBalance(ctx, req.UsuarioId)

	if error != nil {
		log.Printf("[gRPC] ObtenerBalance - Error: %v", error)
		return &pb.GetBalanceResponse{
			Balance:  0,
			Currency: "",
			Success:  false,
		}, nil
	}

	return &pb.GetBalanceResponse{
		Balance:  balance,
		Currency: moneda,
		Success:  true,
	}, nil
}

func (h *GrpcHandler) AddBalance(ctx context.Context, req *pb.AddBalanceRequest) (*pb.AddBalanceResponse, error) {
	log.Printf("[gRPC] AgregarBalance - Wallet: %s, Amount: %.2f", req.WalletId, req.Monto)

	balance, error := h.service.AgregarBalance(ctx, req.WalletId, req.UsuarioId, req.Monto)

	if error != nil {
		log.Printf("[gRPC] AgregarBalance - Error: %v", error)
		return &pb.AddBalanceResponse{
			NuevoBalance: 0,
			Exito:        false,
			Mensaje:      error.Error(),
		}, nil
	}

	return &pb.AddBalanceResponse{
		NuevoBalance: balance,
		Exito:        true,
		Mensaje:      "Balance agregado exitosamente",
	}, nil
}

func (h *GrpcHandler) GetTransaction(ctx context.Context, req *pb.TransactionRequest) (*pb.TransactionResponse, error) {
	log.Printf("[gRPC] ObtenerTransaccion - Transaction ID: %s", req.TransaccionId)

	transaccion, error := h.service.ObtenerTransaccion(ctx, req.TransaccionId)

	if error != nil {
		return &pb.TransactionResponse{
			TransaccionId:   "",
			UsuarioId:       0,
			OrdenId:         "",
			Total:           0,
			FechaCompletado: nil,
		}, nil
	}

	return &pb.TransactionResponse{
		TransaccionId:   transaccion.TransaccionId,
		UsuarioId:       transaccion.UsuarioId,
		OrdenId:         transaccion.OrdenId,
		Total:           transaccion.Total,
		FechaCompletado: timestamppb.New(transaccion.Fechacompletado),
	}, nil
}
