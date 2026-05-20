-- /database/init.sql
-- Crear base si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EconoMarketCartDB')
BEGIN
    CREATE DATABASE EconoMarketCartDB;
    PRINT 'EconoMarketCartDB CREADA';
END
ELSE
    PRINT 'EconoMarketCartDB ya existe';
GO

USE EconoMarketCartDB;
GO

-- Tabla carro (IDEMPOTENTE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carro' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[carro] (
        [id_carro] INT IDENTITY(1,1) PRIMARY KEY,
        [id_usuario] INT NOT NULL,
        [estado] NVARCHAR(50) NOT NULL DEFAULT 'Active',
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [check_out] BIT NOT NULL DEFAULT 0,
        [total] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Tabla carro CREADA';
END
GO

-- Tabla productoCarrito (IDEMPOTENTE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='productoCarrito' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[productoCarrito] (
        [id_productoCarrito] INT IDENTITY(1,1) PRIMARY KEY,
        [id_carro] INT NOT NULL,
        [id_producto] INT NOT NULL,
        [cantidad] INT NOT NULL DEFAULT 1,
        [precio] DECIMAL(18,2) NOT NULL
    );
    PRINT 'Tabla productoCarrito CREADA';
END
GO

-- Foreign Key (IDEMPOTENTE)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_productoCarrito_carro')
BEGIN
    ALTER TABLE [dbo].[productoCarrito] 
    ADD CONSTRAINT FK_productoCarrito_carro 
    FOREIGN KEY ([id_carro]) REFERENCES [dbo].[carro]([id_carro]);
    PRINT 'FK CREADA';
END
GO
PRINT 'Inicialización COMPLETADA';
-- Índices para performance
CREATE INDEX IX_productoCarrito_id_carro ON [dbo].[productoCarrito]([id_carro]);
CREATE INDEX IX_carro_id_usuario ON [dbo].[carro]([id_usuario]);
GO