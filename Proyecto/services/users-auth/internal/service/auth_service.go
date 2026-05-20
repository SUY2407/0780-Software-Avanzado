package service

import (
    "errors"
    "users-auth-service/internal/models"
    "users-auth-service/internal/repository"
    "users-auth-service/pkg/jwt"
)

type AuthService struct {
    repo *repository.UserRepository
}

func NewAuthService(repo *repository.UserRepository) *AuthService {
    return &AuthService{repo: repo}
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.User, error) {
    if _, err := s.repo.FindByEmail(req.Email); err == nil {
        return nil, errors.New("email already exists")
    }

    user := &models.User{
        Email:     req.Email,
        FirstName: req.FirstName,
        LastName:  req.LastName,
        NIT:       req.NIT,
        Phone:     req.Phone,
        Role:      req.Role,
    }

    return user, s.repo.Create(user, req.Password)
}

func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
    user, err := s.repo.FindByEmail(req.Email)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }

    if err := s.repo.VerifyPassword(user.PasswordHash, req.Password); err != nil {
        return nil, errors.New("invalid credentials")
    }

    token, err := jwt.GenerateToken(user.ID, user.Email, user.Role)
    if err != nil {
        return nil, err
    }

    return &models.LoginResponse{Token: token, User: *user}, nil
}

func (s *AuthService) GetUserByID(id int) (*models.User, error) {
    return s.repo.FindByID(id)
}

func (s *AuthService) ValidateToken(token string) (*jwt.Claims, error) {
    return jwt.ValidateToken(token)
}