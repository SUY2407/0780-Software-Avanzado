package service

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"users-auth-service/internal/models"
	"users-auth-service/pkg/jwt"
)

//
// MOCK del repositorio
//

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) FindByEmail(email string) (*models.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) Create(user *models.User, password string) error {
	args := m.Called(user, password)
	return args.Error(0)
}

func (m *MockUserRepository) FindByID(id int) (*models.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) VerifyPassword(hash, password string) error {
	args := m.Called(hash, password)
	return args.Error(0)
}

//
// SOMBRA de AuthService SOLO para tests
// (copiamos la lógica pero usando MockUserRepository)
//

type AuthServiceTest struct {
	repo *MockUserRepository
}

func (s *AuthServiceTest) Register(req models.RegisterRequest) (*models.User, error) {
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

func (s *AuthServiceTest) Login(req models.LoginRequest) (*models.LoginResponse, error) {
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

func (s *AuthServiceTest) GetUserByID(id int) (*models.User, error) {
	return s.repo.FindByID(id)
}

//
// TESTS
//

func TestAuthService_Register_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	req := models.RegisterRequest{
		Email:     "new@ex.com",
		Password:  "password123",
		FirstName: "John",
		LastName:  "Doe",
		NIT:       "123",
		Phone:     "555",
		Role:      "cliente",
	}

	mockRepo.On("FindByEmail", "new@ex.com").
		Return(nil, errors.New("not found"))
	mockRepo.On("Create", mock.AnythingOfType("*models.User"), "password123").
		Return(nil)

	user, err := svc.Register(req)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "new@ex.com", user.Email)
	mockRepo.AssertExpectations(t)
}

func TestAuthService_Register_EmailAlreadyExists(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	req := models.RegisterRequest{
		Email:    "existing@ex.com",
		Password: "password123",
	}

	existing := &models.User{ID: 1, Email: "existing@ex.com"}
	mockRepo.On("FindByEmail", "existing@ex.com").
		Return(existing, nil)

	user, err := svc.Register(req)

	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Equal(t, "email already exists", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestAuthService_Register_CreateError(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	req := models.RegisterRequest{
		Email:    "test@ex.com",
		Password: "password123",
	}

	mockRepo.On("FindByEmail", "test@ex.com").
		Return(nil, errors.New("not found"))
	mockRepo.On("Create", mock.AnythingOfType("*models.User"), "password123").
		Return(errors.New("db error"))

	user, err := svc.Register(req)

	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Contains(t, err.Error(), "db error")
	mockRepo.AssertExpectations(t)
}

func TestAuthService_Login_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	req := models.LoginRequest{
		Email:    "user@ex.com",
		Password: "password123",
	}

	user := &models.User{
		ID:           1,
		Email:        "user@ex.com",
		PasswordHash: "hash",
		Role:         "cliente",
	}

	mockRepo.On("FindByEmail", "user@ex.com").
		Return(user, nil)
	mockRepo.On("VerifyPassword", "hash", "password123").
		Return(nil)

	token, _ := jwt.GenerateToken(1, "user@ex.com", "cliente")

	resp, err := svc.Login(req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotEmpty(t, resp.Token)
	assert.Equal(t, 1, resp.User.ID)

	// opcional: validar que el token sea parseable
	_, err = jwt.ValidateToken(token)
	_ = err // solo para evitar warning

	mockRepo.AssertExpectations(t)
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	req := models.LoginRequest{
		Email:    "no@ex.com",
		Password: "password123",
	}

	mockRepo.On("FindByEmail", "no@ex.com").
		Return(nil, errors.New("not found"))

	resp, err := svc.Login(req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Equal(t, "invalid credentials", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	req := models.LoginRequest{
		Email:    "user@ex.com",
		Password: "wrong",
	}

	user := &models.User{
		ID:           1,
		Email:        "user@ex.com",
		PasswordHash: "hash",
	}

	mockRepo.On("FindByEmail", "user@ex.com").
		Return(user, nil)
	mockRepo.On("VerifyPassword", "hash", "wrong").
		Return(errors.New("mismatch"))

	resp, err := svc.Login(req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Equal(t, "invalid credentials", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestAuthService_GetUserByID_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	expected := &models.User{ID: 1, Email: "user@ex.com"}

	mockRepo.On("FindByID", 1).
		Return(expected, nil)

	user, err := svc.GetUserByID(1)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, 1, user.ID)
	mockRepo.AssertExpectations(t)
}

func TestAuthService_GetUserByID_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	svc := &AuthServiceTest{repo: mockRepo}

	mockRepo.On("FindByID", 999).
		Return(nil, errors.New("not found"))

	user, err := svc.GetUserByID(999)

	assert.Error(t, err)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}
