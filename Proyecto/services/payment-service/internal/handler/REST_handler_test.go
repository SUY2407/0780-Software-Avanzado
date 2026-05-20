package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http/httptest"
	"payment-service/internal/models"
	"payment-service/internal/repository"
	"payment-service/internal/service"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mock del servicio
type MockPaymentService struct {
	mock.Mock
}

func (m *MockPaymentService) ProcesarPago(ctx context.Context, usuarioId int64, ordenId string, Total, montoWallet, MontoTarjeta float64, metodoPagoId string) (*service.ProcesarPagoResult, error) {
	args := m.Called(ctx, usuarioId, ordenId, Total, montoWallet, MontoTarjeta, metodoPagoId)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*service.ProcesarPagoResult), args.Error(1)
}

func (m *MockPaymentService) ObtenerBalance(ctx context.Context, usuarioId int64) (float64, string, error) {
	args := m.Called(ctx, usuarioId)
	return args.Get(0).(float64), args.String(1), args.Error(2)
}

func (m *MockPaymentService) AgregarBalance(ctx context.Context, walletId string, usuarioId int64, monto float64) (float64, error) {
	args := m.Called(ctx, walletId, usuarioId, monto)
	return args.Get(0).(float64), args.Error(1)
}

func (m *MockPaymentService) ObtenerTransaccion(ctx context.Context, transaccionId string) (repository.Transaccion, error) {
	args := m.Called(ctx, transaccionId)
	if args.Get(0) == nil {
		return repository.Transaccion{}, args.Error(1)
	}
	return args.Get(0).(repository.Transaccion), args.Error(1)
}

func (m *MockPaymentService) CrearWallet(ctx context.Context, usuarioId int64, moneda string) (string, string, error) {
	args := m.Called(ctx, usuarioId, moneda)
	return args.String(0), args.String(1), args.Error(2)
}

func (m *MockPaymentService) CrearMetodoPago(ctx context.Context, usuarioId int64, tipo, numero string) (string, error) {
	args := m.Called(ctx, usuarioId, tipo, numero)
	return args.String(0), args.Error(1)
}

func (m *MockPaymentService) ObtenerMetodosPago(ctx context.Context, usuarioId int64) ([]repository.MetodoPago, error) {
	args := m.Called(ctx, usuarioId)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]repository.MetodoPago), args.Error(1)
}

func (m *MockPaymentService) DesactivarMetodoPago(ctx context.Context, metodoId string) (string, error) {
	args := m.Called(ctx, metodoId)
	return args.String(0), args.Error(1)
}

// Verificar que el mock implementa la interfaz
var _ service.PaymentServiceInterface = (*MockPaymentService)(nil)

// ==================== TESTS ====================

// Test para CrearWallet
func TestRestHandler_CrearWallet_Success(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/wallet", handler.CrearWallet)

	mockService.On("CrearWallet", mock.Anything, int64(123), "USD").
		Return("wallet-456", "Wallet creada exitosamente", nil)

	requestBody := models.CrearWalletMoneda{
		UsuarioId: 123,
		Moneda:    "USD",
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/wallet", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusOK, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, "wallet-456", response["WalletId"])
	assert.Equal(t, "Wallet creada exitosamente", response["Mensaje"])
	assert.Equal(t, true, response["Exito"])

	mockService.AssertExpectations(t)
}

func TestRestHandler_CrearWallet_InvalidJSON(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/wallet", handler.CrearWallet)

	req := httptest.NewRequest("POST", "/wallet", bytes.NewReader([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ := io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, false, response["Exito"])
	assert.Equal(t, "Request Body invalido", response["Mensaje"])

	mockService.AssertNotCalled(t, "CrearWallet")
}

func TestRestHandler_CrearWallet_ServiceError(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/wallet", handler.CrearWallet)

	mockService.On("CrearWallet", mock.Anything, int64(123), "USD").
		Return("", "", errors.New("database connection error"))

	requestBody := models.CrearWalletMoneda{
		UsuarioId: 123,
		Moneda:    "USD",
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/wallet", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, "", response["WalletId"])
	assert.Equal(t, "database connection error", response["Mensaje"])
	assert.Equal(t, false, response["Exito"])

	mockService.AssertExpectations(t)
}

// Test para ObtenerBalance
func TestRestHandler_ObtenerBalance_Success(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/balance", handler.ObtenerBalance)

	mockService.On("ObtenerBalance", mock.Anything, int64(123)).
		Return(150.50, "USD", nil)

	requestBody := models.ObtenerBalanceRequest{
		UsuarioId: 123,
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/balance", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusOK, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, 150.50, response["Balance"])
	assert.Equal(t, "USD", response["Moneda"])
	assert.Equal(t, true, response["Exito"])

	mockService.AssertExpectations(t)
}

func TestRestHandler_ObtenerBalance_ServiceError(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/balance", handler.ObtenerBalance)

	mockService.On("ObtenerBalance", mock.Anything, int64(123)).
		Return(0.0, "", errors.New("wallet not found"))

	requestBody := models.ObtenerBalanceRequest{
		UsuarioId: 123,
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/balance", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, float64(0), response["Balance"])
	assert.Equal(t, "", response["Moneda"])
	assert.Equal(t, false, response["Exito"])

	mockService.AssertExpectations(t)
}

// Test para AgregarBalance
func TestRestHandler_AgregarBalance_Success(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/balance/add", handler.AgregarBalance)

	mockService.On("AgregarBalance", mock.Anything, "wallet-123", int64(456), 100.0).
		Return(250.50, nil)

	requestBody := models.AgregarBalanceRequest{
		WalletId:  "wallet-123",
		UsuarioId: 456,
		Monto:     100.0,
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/balance/add", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusOK, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, 250.50, response["NuevoBalance"])
	assert.Equal(t, true, response["Exito"])
	assert.Equal(t, "Balance agregado exitosamente", response["Mensaje"])

	mockService.AssertExpectations(t)
}

// Test para ProcesarPago
func TestRestHandler_ProcesarPago_Success(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/pago", handler.ProcesarPago)

	expectedResult := &service.ProcesarPagoResult{
		TransaccionId: "txn-789",
		Mensaje:       "Pago procesado exitosamente",
		Exito:         true,
		Status:        true,
	}

	mockService.On("ProcesarPago", mock.Anything, int64(123), "order-456", 100.0, 50.0, 50.0, "metodo-1").
		Return(expectedResult, nil)

	requestBody := models.ProcesarPagoRequest{
		UsuarioId:    123,
		OrdenId:      "order-456",
		Total:        100.0,
		MontoWallet:  50.0,
		MontoTarjeta: 50.0,
		MetodoPago:   "metodo-1",
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/pago", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusOK, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, "txn-789", response["TransaccionId"])
	assert.Equal(t, "Pago procesado exitosamente", response["Mensaje"])
	assert.Equal(t, true, response["Exito"])

	mockService.AssertExpectations(t)
}

func TestRestHandler_ProcesarPago_ValidationError(t *testing.T) {
	mockService := new(MockPaymentService)
	handler := NewRestHandler(mockService)
	app := fiber.New()

	app.Post("/pago", handler.ProcesarPago)

	expectedResult := &service.ProcesarPagoResult{
		TransaccionId: "",
		Mensaje:       "La suma de wallet y tarjeta debe ser igual al total",
		Exito:         false,
		Status:        false,
	}

	mockService.On("ProcesarPago", mock.Anything, int64(123), "order-456", 100.0, 30.0, 50.0, "metodo-1").
		Return(expectedResult, nil)

	requestBody := models.ProcesarPagoRequest{
		UsuarioId:    123,
		OrdenId:      "order-456",
		Total:        100.0,
		MontoWallet:  30.0,
		MontoTarjeta: 50.0,
		MetodoPago:   "metodo-1",
	}
	bodyBytes, _ := json.Marshal(requestBody)

	req := httptest.NewRequest("POST", "/pago", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

	var response map[string]interface{}
	bodyBytes, _ = io.ReadAll(resp.Body)
	json.Unmarshal(bodyBytes, &response)

	assert.Equal(t, "", response["TransaccionId"])
	assert.Equal(t, false, response["Exito"])

	mockService.AssertExpectations(t)
}
