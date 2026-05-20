-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'QuetzalShipDB')
BEGIN
    CREATE DATABASE QuetzalShipDB;
    PRINT 'Database QuetzalShipDB created successfully';
END
GO

USE QuetzalShipDB;
GO
