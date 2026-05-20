package handler

//go:generate swag init

import (
	"encoding/json"
	"log"
	"payment-service/internal/models"
	_ "payment-service/internal/models"
	"payment-service/internal/service"

	"github.com/gofiber/fiber/v2"
)

type RestHandler struct {
	service service.PaymentServiceInterface
}

func NewRestHandler(service service.PaymentServiceInterface) *RestHandler {
	return &RestHandler{service: service}
}

// ProcesarPago godoc
// @Summary Procesar un pago
// @Description Procesa un pago usando wallet y/o tarjeta
// @Tags Payments
// @Accept json
// @Produce json
// @Param request body models.ProcesarPagoRequest true "Datos del pago"
// @Success 200 {object} map[string]interface{} "Pago procesado"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /procesar-pago [post]
func (h *RestHandler) ProcesarPago(ctx *fiber.Ctx) error {

	var request models.ProcesarPagoRequest

	if error := ctx.BodyParser(&request); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] ProcesarPago - Usuario: %d, Orden: %s, Total: %.2f",
		request.UsuarioId, request.OrdenId, request.Total)

	result, error := h.service.ProcesarPago(ctx.Context(), request.UsuarioId, request.OrdenId, request.Total, request.MontoWallet, request.MontoTarjeta, request.MetodoPago)

	if error != nil {
		log.Printf("[REST] ProcesarPago - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"TransaccionId": "",
			"Mensaje":       error.Error(),
			"Exito":         false,
		})
	}

	status := fiber.StatusOK

	if !result.Exito {
		status = fiber.StatusBadRequest
	}

	return ctx.Status(status).JSON(fiber.Map{
		"TransaccionId": result.TransaccionId,
		"Mensaje":       result.Mensaje,
		"Exito":         result.Exito,
	})
}

// ObtenerBalance godoc
// @Summary Obtener balance
// @Description Obtiene el balance actual del usuario
// @Tags Wallet
// @Accept json
// @Produce json
// @Param request body models.ObtenerBalanceRequest true "Usuario"
// @Success 200 {object} map[string]interface{} "Balance obtenido"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /obtener-balance [post]
func (h *RestHandler) ObtenerBalance(ctx *fiber.Ctx) error {

	var request models.ObtenerBalanceRequest

	if error := ctx.BodyParser(&request); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] ObtenerBalance - Usuario: %d", request.UsuarioId)

	balance, moneda, error := h.service.ObtenerBalance(ctx.Context(), request.UsuarioId)

	if error != nil {
		log.Printf("[REST] ObtenerBalance - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"Balance": 0,
			"Moneda":  "",
			"Exito":   false,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"Balance": balance,
		"Moneda":  moneda,
		"Exito":   true,
	})

}

// AgregarBalance godoc
// @Summary Agregar balance
// @Description Agrega saldo a un wallet
// @Tags Wallet
// @Accept json
// @Produce json
// @Param request body models.AgregarBalanceRequest true "Datos del balance"
// @Success 200 {object} map[string]interface{} "Balance agregado"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /agregar-balance [post]
func (h *RestHandler) AgregarBalance(ctx *fiber.Ctx) error {

	var request models.AgregarBalanceRequest

	if error := ctx.BodyParser(&request); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] AgregarBalance - Wallet: %s, Amount: %.2f", request.WalletId, request.Monto)

	balance, error := h.service.AgregarBalance(ctx.Context(), request.WalletId, request.UsuarioId, request.Monto)

	if error != nil {
		log.Printf("[REST] AgregarBalance - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"NuevoBalance": 0,
			"Exito":        false,
			"Mensaje":      error.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"NuevoBalance": balance,
		"Exito":        true,
		"Mensaje":      "Balance agregado exitosamente",
	})

}

// CrearWallet godoc
// @Summary Crear wallet
// @Description Crea un wallet para el usuario
// @Tags Wallet
// @Accept json
// @Produce json
// @Param request body models.CrearWalletMoneda true "Moneda del wallet"
// @Success 200 {object} map[string]interface{} "Wallet creado"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /crear-wallet [post]
func (h *RestHandler) CrearWallet(ctx *fiber.Ctx) error {

	var moneda models.CrearWalletMoneda

	if error := json.Unmarshal(ctx.Body(), &moneda); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] CrearWallet - Usuario: %d, Currency: %s", moneda.UsuarioId, moneda.Moneda)

	walletId, mensaje, error := h.service.CrearWallet(ctx.Context(), moneda.UsuarioId, moneda.Moneda)

	if error != nil {
		log.Printf("[REST] CrearWallet - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"WalletId": "",
			"Mensaje":  error.Error(),
			"Exito":    false,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"WalletId": walletId,
		"Mensaje":  mensaje,
		"Exito":    true,
	})

}

// CrearMetodoPago godoc
// @Summary Crear método de pago
// @Description Crea un nuevo método de pago (tarjeta, etc.)
// @Tags Payments
// @Accept json
// @Produce json
// @Param request body models.CrearMetodoPagoType true "Datos del método"
// @Success 200 {object} map[string]interface{} "Método creado"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /crear-metodo-pago [post]
func (h *RestHandler) CrearMetodoPago(ctx *fiber.Ctx) error {

	var tipo models.CrearMetodoPagoType

	if error := json.Unmarshal(ctx.Body(), &tipo); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] CrearMetodoPago - Usuario: %d, Type: %s, numero: %s", tipo.UsuarioId, tipo.Tipo, tipo.Numero)

	mensaje, error := h.service.CrearMetodoPago(ctx.Context(), tipo.UsuarioId, tipo.Tipo, tipo.Numero)

	if error != nil {
		log.Printf("[REST] CrearMetodoPago - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"Mensaje": error.Error(),
			"Exito":   false,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"Mensaje": mensaje,
		"Exito":   true,
	})

}

// ObtenerMetodosPago godoc
// @Summary Obtener métodos de pago
// @Description Lista los métodos de pago del usuario
// @Tags Payments
// @Accept json
// @Produce json
// @Param request body models.ObtenerMetodosRequest true "Usuario"
// @Success 200 {object} map[string]interface{} "Lista de métodos"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /metodos-pago [post]
func (h *RestHandler) ObtenerMetodosPago(ctx *fiber.Ctx) error {
	var request models.ObtenerMetodosRequest

	if error := json.Unmarshal(ctx.Body(), &request); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] ObtenerMetodosPago - Usuario: %d", request.UsuarioId)

	metodosPago, error := h.service.ObtenerMetodosPago(ctx.Context(), request.UsuarioId)

	if error != nil {
		log.Printf("[REST] ObtenerMetodosPago - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"MetodosPago": nil,
			"Exito":       false,
			"Mensaje":     error.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"MetodosPago": metodosPago,
		"Exito":       true,
		"Mensaje":     "Métodos de pago obtenidos exitosamente",
	})

}

// DesactivarMetodoPago godoc
// @Summary Desactivar método de pago
// @Description Desactiva un método de pago existente
// @Tags Payments
// @Accept json
// @Produce json
// @Param request body models.DesactivarMetodoPagoId true "ID del método"
// @Success 200 {object} map[string]interface{} "Método desactivado"
// @Failure 400 {object} map[string]interface{} "Request inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 500 {object} map[string]interface{} "Error interno"
// @Security BearerAuth
// @Router /desactivar-metodo-pago [post]
func (h *RestHandler) DesactivarMetodoPago(ctx *fiber.Ctx) error {

	var metodoId models.DesactivarMetodoPagoId
	if error := json.Unmarshal(ctx.Body(), &metodoId); error != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Exito":   false,
			"Mensaje": "Request Body invalido",
			"Error":   error.Error(),
		})
	}

	log.Printf("[REST] DescactivarMetodoPago - Metodo ID: %s", metodoId)

	mensaje, error := h.service.DesactivarMetodoPago(ctx.Context(), metodoId.MetodoId)

	if error != nil {
		log.Printf("[REST] DescactivarMetodoPago - Error: %v", error)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"Mensaje": error.Error(),
			"Exito":   false,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"Mensaje": mensaje,
		"Exito":   true,
	})
}
