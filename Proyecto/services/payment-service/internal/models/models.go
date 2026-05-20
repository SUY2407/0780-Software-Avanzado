package models

type ProcesarPagoRequest struct {
	UsuarioId    int64   `json:"usuarioId" example:"123"`
	OrdenId      string  `json:"ordenId" example:"ORD-98765"`
	Total        float64 `json:"total" example:"250.75"`
	MontoWallet  float64 `json:"montoWallet" example:"100.00"`
	MontoTarjeta float64 `json:"montoTarjeta" example:"150.75"`
	MetodoPago   string  `json:"metodoPago" example:"tarjeta"`
}

type ObtenerBalanceRequest struct {
	UsuarioId int64 `json:"usuarioId" example:"123"`
}

type ObtenerMetodosRequest struct {
	UsuarioId int64 `json:"usuarioId" example:"123"`
}

type AgregarBalanceRequest struct {
	UsuarioId int64   `json:"usuarioId" example:"123"`
	WalletId  string  `json:"walletId" example:"wallet-abc-123"`
	Monto     float64 `json:"monto" example:"500.00"`
}

type DesactivarMetodoPagoId struct {
	MetodoId string `json:"metodoId" example:"card-1234"`
}

type CrearMetodoPagoType struct {
	UsuarioId int64  `json:"usuarioId" example:"123"`
	Tipo      string `json:"tipo" example:"tarjeta"`
	Numero    string `json:"numero" example:"4111111111111111"`
}

type CrearWalletMoneda struct {
	UsuarioId int64  `json:"usuarioId" example:"123"`
	Moneda    string `json:"moneda" example:"GTQ"`
}
