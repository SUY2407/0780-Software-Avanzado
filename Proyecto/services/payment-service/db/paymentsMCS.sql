CREATE DATABASE paymentsDB;
GO

USE paymentsDB;
GO

CREATE SCHEMA payments AUTHORIZATION dbo;
GO

CREATE TABLE payments.wallet(
	walletId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
	usuarioId INT NOT NULL,
	balance DECIMAL(10,2) DEFAULT 0,
	moneda VARCHAR(3) DEFAULT 'GTQ',
	creado DATETIME2 DEFAULT GETDATE(),
	actualizado DATETIME2 DEFAULT GETDATE()

)
GO

CREATE TABLE payments.metodosPago(
	metodoId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
	usuarioId INT NOT NULL,
	numero VARCHAR(19) NOT NULL,
	tipo VARCHAR(20) NOT NULL,
	activo BIT DEFAULT 1,
	creado DATETIME2 DEFAULT GETDATE()
)
GO

CREATE TABLE payments.transaccion(
	transaccionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
	usuarioId INT NOT NULL,
	ordenId UNIQUEIDENTIFIER NOT NULL,
	total DECIMAL(10,2) DEFAULT 0,
	metodoPago UNIQUEIDENTIFIER,
	completado DATETIME2 DEFAULT GETDATE(),
	CONSTRAINT FK_transactions_payment_method 
        FOREIGN KEY (metodoPago) 
        REFERENCES payments.metodosPago(metodoId)
)
GO

CREATE INDEX IX_wallet_usuario ON payments.wallet(usuarioId);
CREATE INDEX IX_transaccion_orden ON payments.transaccion(ordenId);
CREATE INDEX IX_transaccion_usuario ON payments.transaccion(usuarioId);

DROP PROCEDURE IF EXISTS payments.crearWallet;
GO

CREATE PROCEDURE payments.crearWallet
	@usuarioId INT,
	@moneda VARCHAR(3),
	@walletId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY

		SET @walletId = NEWID();

		INSERT INTO payments.wallet(walletId,usuarioId,balance,moneda)
		VALUES (@walletId,@usuarioId,0,@moneda)

		SELECT CONVERT(VARCHAR(36), @walletId) as walletId, 'Wallet creada exitosamente' AS mensaje;
	END TRY
	BEGIN CATCH
		SELECT ERROR_MESSAGE() AS Error;
		THROW
	END CATCH

END
GO

DROP PROCEDURE IF EXISTS payments.crearMetodoPago;
GO

CREATE PROCEDURE payments.crearMetodoPago
	@metodoId UNIQUEIDENTIFIER OUTPUT,
	@numero VARCHAR(19),
	@usuarioId INT,
	@tipo VARCHAR(20)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		SET @metodoId = NEWID();

		INSERT INTO payments.metodosPago(metodoId,usuarioId,tipo,numero)
		VALUES(@metodoId,@usuarioId,@tipo,@numero)

		SELECT 'Metodo de pago creado exitosamente' AS mensaje;
	END TRY
	BEGIN CATCH
		SELECT ERROR_MESSAGE() AS Error;
		THROW
	END CATCH
END
GO

DROP PROCEDURE IF EXISTS payments.agregarBalance;
GO

CREATE PROCEDURE payments.agregarBalance
	@walletId UNIQUEIDENTIFIER,
	@usuarioId INT,
	@monto DECIMAL(10,2)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRANSACTION;
	BEGIN TRY
		DECLARE @balanceActual DECIMAL(10,2);
		DECLARE @nuevoBalance DECIMAL(10,2);

		SELECT @balanceActual = balance
		FROM payments.wallet
		WHERE walletId = @walletId AND usuarioId = @usuarioId;

		IF @balanceActual IS NULL
		BEGIN
			THROW 50001, 'Wallet no encontrada o no pertenece al usuario', 1;
		END

		SET @nuevoBalance = @balanceActual + @monto;

		UPDATE payments.wallet
		SET balance = @nuevoBalance,
		actualizado = GETDATE()
		WHERE walletId = @walletId AND usuarioId = @usuarioId;

		COMMIT TRANSACTION;
		SELECT @nuevoBalance AS balance, 'balance agregado exitosamente' AS mensaje;
	END TRY
	BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT ERROR_MESSAGE() AS ErrorMessage;
        THROW;
    END CATCH
END
GO

DROP PROCEDURE IF EXISTS payments.procesarPago;
GO

CREATE PROCEDURE payments.procesarPago
	@usuarioId INT,
	@ordenId UNIQUEIDENTIFIER,
	@total DECIMAL(10,2),
	@montoWallet DECIMAL(10,2),
	@montoTarjeta DECIMAL(10,2),
	@metodoPagoId UNIQUEIDENTIFIER,
	@transaccionId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    BEGIN TRY
		DECLARE @walletId UNIQUEIDENTIFIER;
		DECLARE @balanceActual DECIMAL(10,2);
		
		IF (@montoWallet + @montoTarjeta) != @total
		BEGIN
			;THROW 50001, 'La cantidad del wallet y de la tarjeta deben coincidir con el total',1;
		END

		IF @montoWallet >0
		BEGIN
			SELECT @walletId = walletId, @balanceActual = balance
			FROM payments.wallet
			WHERE usuarioId = @usuarioId

			IF @balanceActual < @montoWallet
			BEGIN
				;THROW 50002,'balance insuficiente en wallet',1;
			END

		END

		SET @transaccionId = NEWID();

		INSERT INTO payments.transaccion(transaccionId,usuarioId,ordenId,total,metodoPago,completado)
		VALUES(@transaccionId,@usuarioId,@ordenId,@total,@metodoPagoId,GETDATE());

		IF @montoWallet >0
		BEGIN
			DECLARE @nuevoBalance DECIMAL(10,2);
			SET @nuevoBalance = @balanceActual - @montoWallet;

			UPDATE payments.wallet
			SET balance = @nuevoBalance
			WHERE walletId = @walletId;
		END


		COMMIT TRANSACTION;

		SELECT 
            CONVERT(VARCHAR(36), @TransaccionId) AS TransactionId,
            'Pago procesado exitosamente' AS mensaje;
	END TRY
	BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT ERROR_MESSAGE() AS Error;
        THROW;
    END CATCH
END
GO


DROP PROCEDURE IF EXISTS payments.obtenerBalance;
GO

CREATE PROCEDURE payments.obtenerBalance
	@usuarioId INT
AS
BEGIN
	SET NOCOUNT ON;

	SELECT
		balance AS Balance,
		moneda AS Moneda
	FROM payments.wallet
	WHERE usuarioId = @usuarioId;
END
GO


DROP PROCEDURE IF EXISTS payments.desactivarMetodoPago;
GO

CREATE PROCEDURE payments.desactivarMetodoPago
	@metodoId UNIQUEIDENTIFIER
AS
BEGIN
	SET NOCOUNT ON;
	
	BEGIN TRY
		UPDATE payments.metodosPago
		SET activo = 0
		WHERE metodoId = @metodoId;

		IF @@ROWCOUNT = 0
		BEGIN
			;THROW 50010, 'El m�todo de pago no existe o ya est� desactivado.', 1;
		END

		SELECT 'Metodo de pago desactivado exitosamente' AS mensaje;
	END TRY
	BEGIN CATCH
		SELECT ERROR_MESSAGE() AS Error;
	END CATCH
END
GO

DROP PROCEDURE IF EXISTS payments.obtenerMetodosPago;
GO

CREATE OR ALTER PROCEDURE payments.obtenerMetodosPago
	@usuarioId INT
AS
BEGIN
	SET NOCOUNT ON;

	SELECT CONVERT(VARCHAR(36), metodoId) AS Id, tipo AS Tipo, numero AS Numero, creado AS FechaAgregado
	FROM payments.metodosPago
	WHERE usuarioId = @usuarioId AND activo = 1
	ORDER BY creado DESC;

END
GO

DROP PROCEDURE IF EXISTS payments.obtenerTransaccion;
GO

CREATE PROCEDURE payments.obtenerTransaccion
	@transaccionId UNIQUEIDENTIFIER

AS
BEGIN
	SET NOCOUNT ON;

	SELECT CONVERT(VARCHAR(36), transaccionId) AS Id,
	usuarioId AS usuarioId,
	ordenId AS ordenId,
	total AS total,
	metodoPago AS metodoPago,
	completado AS FechaCompletado
	FROM payments.transaccion
	WHERE transaccionId = @transaccionId
END
GO