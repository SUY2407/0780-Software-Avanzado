-- /database/init.sql
-- Crear base si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EconoMarketNotificacionesDB')
BEGIN
    CREATE DATABASE EconoMarketNotificacionesDB;
    PRINT 'EconoMarketNotificacionesDB CREADA';
END
ELSE
    PRINT 'EconoMarketNotificacionesDB ya existe';
GO

USE EconoMarketNotificacionesDB;
GO

-- Tabla notificacionProveedor (IDEMPOTENTE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notificacionProveedor' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[notificacionProveedor] (
        [id_notificacion] INT IDENTITY(1,1) PRIMARY KEY,
        [id_proveedor] INT NOT NULL,
        [estado] VARCHAR(20) NOT NULL, -- 'pendiente', 'enviado', 'fallido'
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [mensaje] NVARCHAR(500)
    );
    PRINT 'Tabla notificacionProveedor CREADA';
END
GO

-- Tabla notificacionCliente (IDEMPOTENTE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notificacionCliente' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[notificacionCliente] (
        [id_notificacion] INT IDENTITY(1,1) PRIMARY KEY,
        [id_usuario] INT NOT NULL,
        [id_carro] INT NOT NULL DEFAULT -1,
        [estado] VARCHAR(20) NOT NULL,
        [tipo] VARCHAR(30) NOT NULL, -- 'compra', 'recordatorio'
        [id_orden] VARCHAR(255) NOT NULL,
        [created_at] DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabla notificacionCliente CREADA';
END
GO

-- Tabla productos de la notificación (IDEMPOTENTE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='productoNotificacion' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[productoNotificacion] (
        [id_notificacion] INT NOT NULL,
        [id_producto] INT NOT NULL
    );
    PRINT 'Tabla productoNotificacion CREADA';
END
GO

-- FK: productoNotificacion.id_notificacion -> notificacionProveedor.id_notificacion
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_productoNotificacion_notificacionProveedor'
)
BEGIN
    ALTER TABLE [dbo].[productoNotificacion]
    ADD CONSTRAINT FK_productoNotificacion_notificacionProveedor
        FOREIGN KEY ([id_notificacion])
        REFERENCES [dbo].[notificacionProveedor]([id_notificacion]);
    PRINT 'FK_productoNotificacion_notificacionProveedor CREADA';
END
GO

-- Índices
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificacionProveedor_id_proveedor')
BEGIN
    CREATE INDEX IX_notificacionProveedor_id_proveedor 
    ON [dbo].[notificacionProveedor]([id_proveedor]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificacionCliente_id_usuario')
BEGIN
    CREATE INDEX IX_notificacionCliente_id_usuario 
    ON [dbo].[notificacionCliente]([id_usuario]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificacionCliente_id_carro')
BEGIN
    CREATE INDEX IX_notificacionCliente_id_carro 
    ON [dbo].[notificacionCliente]([id_carro]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificacionCliente_estado_tipo')
BEGIN
    CREATE INDEX IX_notificacionCliente_estado_tipo 
    ON [dbo].[notificacionCliente]([estado], [tipo]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productoNotificacion_id_notificacion')
BEGIN
    CREATE INDEX IX_productoNotificacion_id_notificacion 
    ON [dbo].[productoNotificacion]([id_notificacion]);
END
GO

PRINT 'Inicialización notificaciones COMPLETADA';
GO