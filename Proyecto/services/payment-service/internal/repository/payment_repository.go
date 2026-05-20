package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	mssql "github.com/denisenkom/go-mssqldb"
)

type Transaccion struct {
	TransaccionId   string    `json:"transaccionId"`
	UsuarioId       int64     `json:"usuarioId"`
	OrdenId         string    `json:"ordenId"`
	Total           float64   `json:"total"`
	MetodoPagoId    string    `json:"metodoPagoId"`
	Fechacompletado time.Time `json:"fechaCompletado"`
}

type MetodoPago struct {
	MetodoPagoId  string    `json:"metodoPagoId"`
	Tipo          string    `json:"tipo"`
	Fechacreacion time.Time `json:"fechaCreacion"`
	Numero        string    `json:"numero"`
}

type PaymentRepository struct {
	db *sql.DB
}

func NewPaymentRepository(db *sql.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) ProcesarPago(ctx context.Context, usuarioId int64, ordenId string, Total, montoWallet, montoTarjeta float64, metodoPagoId string) (string, error) {
	// Implementando la llamada al procedimiento almacenado para procesar pagos

	query := `DECLARE @transaccionId UNIQUEIDENTIFIER;
	EXEC payments.procesarPago
		@usuarioId = @p1,
		@ordenId = @p2,
		@total = @p3,
		@montoWallet = @p4,
		@montoTarjeta = @p5,
		@metodoPagoId = @p6,
		@transaccionId = @transaccionId OUTPUT;
		SELECT CAST(@transaccionId AS VARCHAR(36)) AS TransaccionId;
		`

	var transaccionId string
	var mensaje string
	error := r.db.QueryRowContext(ctx, query, usuarioId, ordenId, Total, montoWallet, montoTarjeta, metodoPagoId,
		sql.NullString{String: metodoPagoId, Valid: metodoPagoId != ""}).Scan(&transaccionId, &mensaje)

	if error != nil {
		return "", fmt.Errorf("error al procesar el pago: %w", error)
	}

	return transaccionId, nil
}

func (r *PaymentRepository) ObtenerBalance(ctx context.Context, usuarioId int64) (float64, string, error) {
	// Implementando la llamada al procedimiento almacenado para obtener el balance del usuario

	query := `EXEC payments.obtenerBalance @usuarioId = @p1;`

	var balance float64
	var moneda string
	error := r.db.QueryRowContext(ctx, query, usuarioId).Scan(&balance, &moneda)

	if error != nil {
		return 0.0, "", fmt.Errorf("error al obtener el balance del usuario: %w", error)
	}

	return balance, moneda, nil
}

func (r *PaymentRepository) AgregarBalance(ctx context.Context, walletId string, usuarioId int64, monto float64) (float64, error) {
	// Implementando la llamada al procedimiento almacenado para agregar balance al usuario
	query := `EXEC payments.agregarBalance @walletId = @p1, @usuarioId = @p2, @monto = @p3;`

	var nuevoBalance float64
	var mensaje string
	error := r.db.QueryRowContext(ctx, query, walletId, usuarioId, monto).Scan(&nuevoBalance, &mensaje)
	if error != nil {
		var sqlErr mssql.Error
		if errors.As(error, &sqlErr) {
			fmt.Println(sqlErr.Message)
			// ESTE es el error que viene del THROW del SP
			return 0, fmt.Errorf(
				"sql error %d: %s",
				sqlErr.Number,
				sqlErr.Message,
			)
		}

		// Error no relacionado a SQL Server
		return 0, error
	}

	return nuevoBalance, nil

}

func (r *PaymentRepository) ObtenerTransaccion(ctx context.Context, transaccionId string) (Transaccion, error) {
	// Implementando la llamada al procedimiento almacenado para obtener los detalles de una transacción
	query := `EXEC payments.obtenerTransaccion @transaccionId = @p1;`
	var transaccion Transaccion
	error := r.db.QueryRowContext(ctx, query, transaccionId).Scan(
		&transaccion.MetodoPagoId,
		&transaccion.UsuarioId,
		&transaccion.OrdenId,
		&transaccion.Total,
		&transaccion.MetodoPagoId,
		&transaccion.Fechacompletado,
	)

	if error != nil {
		return Transaccion{}, fmt.Errorf("error al obtener los detalles de la transacción: %w", error)
	}

	return transaccion, nil
}

func (r *PaymentRepository) CrearWallet(ctx context.Context, usuarioId int64, moneda string) (string, string, error) {
	// Implementando la llamada al procedimiento almacenado para crear una wallet

	query := `DECLARE @walletId UNIQUEIDENTIFIER;
	EXEC payments.crearWallet
		@usuarioId = @p1,
		@moneda = @p2,
		@walletId = @walletId OUTPUT;
		`

	var mensaje string
	var walletId string
	error := r.db.QueryRowContext(ctx, query, usuarioId, moneda).Scan(&walletId, &mensaje)

	if error != nil {
		return "", "", fmt.Errorf("error al crear la wallet: %w", error)
	}

	return walletId, mensaje, nil
}

func (r *PaymentRepository) CrearMetodoPago(ctx context.Context, usuarioId int64, tipo, numero string) (string, error) {
	// Implementando la llamada al procedimiento almacenado para crear un método de pago

	query := `DECLARE @metodoPagoId UNIQUEIDENTIFIER;
	EXEC payments.crearMetodoPago
		@usuarioId = @p1,
		@tipo = @p2,
		@numero = @p3,
		@metodoId = @metodoPagoId OUTPUT;`

	var mensaje string

	error := r.db.QueryRowContext(ctx, query, usuarioId, tipo, numero).Scan(&mensaje)

	if error != nil {
		return "", fmt.Errorf("error al crear metodo de pago: %w", error)
	}

	return mensaje, nil
}

func (r *PaymentRepository) ObtenerMetodosPago(ctx context.Context, usuarioId int64) ([]MetodoPago, error) {
	// Implementando la llamada al procedimiento almacenado para obtener los métodos de pago de un usuario

	query := `EXEC payments.obtenerMetodosPago @usuarioId = @p1;`

	rows, error := r.db.QueryContext(ctx, query, usuarioId)

	if error != nil {
		return nil, fmt.Errorf("error al obtener los métodos de pago del usuario: %w", error)
	}

	defer rows.Close()

	var metodosPago []MetodoPago

	for rows.Next() {
		var metodoPago MetodoPago
		error := rows.Scan(
			&metodoPago.MetodoPagoId,
			&metodoPago.Tipo,
			&metodoPago.Numero,
			&metodoPago.Fechacreacion,
		)
		if error != nil {
			return nil, fmt.Errorf("error al escanear el método de pago: %w", error)
		}
		metodosPago = append(metodosPago, metodoPago)
	}

	return metodosPago, nil
}

func (r *PaymentRepository) DescactivarMetodoPago(ctx context.Context, metodoId string) (string, error) {
	// Implementando la llamada al procedimiento almacenado para desactivar un método de pago
	query := `EXEC payments.desactivarMetodoPago @metodoId = @p1;`

	var mensaje string

	error := r.db.QueryRowContext(ctx, query, metodoId).Scan(&mensaje)

	if error != nil {
		return "", fmt.Errorf("error al desactivar el método de pago: %w", error)
	}

	return mensaje, nil
}
