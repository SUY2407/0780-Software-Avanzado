package grpc

import (
	"context"

	"users-auth-service/internal/service"
	pb "users-auth-service/proto"
)

type AuthGRPCHandler struct {
	pb.UnimplementedAuthServiceServer
	authService *service.AuthService
}

func NewAuthGRPCHandler(s *service.AuthService) *AuthGRPCHandler {
	return &AuthGRPCHandler{authService: s}
}

func (h *AuthGRPCHandler) ValidateToken(ctx context.Context, req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	claims, err := h.authService.ValidateToken(req.Token)
	if err != nil {
		return &pb.ValidateTokenResponse{
			Valid: false,
			Error: err.Error(),
		}, nil
	}

	return &pb.ValidateTokenResponse{
		Valid:  true,
		UserId: int32(claims.UserID),
		Email:  claims.Email,
		Role:   claims.Role,
	}, nil
}

func (h *AuthGRPCHandler) GetUserById(ctx context.Context, req *pb.GetUserByIdRequest) (*pb.GetUserByIdResponse, error) {
	user, err := h.authService.GetUserByID(int(req.UserId))
	if err != nil {
		return nil, err
	}

	return &pb.GetUserByIdResponse{
		Id:        int32(user.ID),
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Nit:       user.NIT,
		Phone:     user.Phone,
		Role:      user.Role,
	}, nil
}
