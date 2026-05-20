package routes

import (
	"payment-service/internal/handler"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
)

func SetUpRoutes(app *fiber.App, restHandler *handler.RestHandler, jwtSecret string) {

	payments := app.Group("/api")

	payments.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(jwtSecret)},
	}))

	payments.Post("/procesar-pago", restHandler.ProcesarPago)
	payments.Post("/obtener-balance", restHandler.ObtenerBalance)
	payments.Post("/agregar-balance", restHandler.AgregarBalance)
	payments.Post("/desactivar-metodo-pago", restHandler.DesactivarMetodoPago)
	payments.Post("/metodos-pago", restHandler.ObtenerMetodosPago)
	payments.Post("/crear-metodo-pago", restHandler.CrearMetodoPago)
	payments.Post("/crear-wallet", restHandler.CrearWallet)
}
