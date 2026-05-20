USE QuetzalShipDB;
GO

-- ============================================
-- Tabla: orders (Órdenes)
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
BEGIN
    CREATE TABLE orders (
        order_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        origin VARCHAR(50) NOT NULL,
        destination VARCHAR(50) NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        cancelled_at DATETIME2 NULL,
        notes NVARCHAR(500) NULL,
        
        CONSTRAINT CK_orders_origin CHECK (origin IN ('METRO', 'INTERIOR', 'FRONTERA')),
        CONSTRAINT CK_orders_destination CHECK (destination IN ('METRO', 'INTERIOR', 'FRONTERA')),
        CONSTRAINT CK_orders_service_type CHECK (service_type IN ('STANDARD', 'EXPRESS', 'SAME_DAY')),
        CONSTRAINT CK_orders_status CHECK (status IN ('ACTIVE', 'CANCELLED'))
    );
    
    CREATE INDEX IX_orders_status ON orders(status);
    CREATE INDEX IX_orders_created_at ON orders(created_at DESC);
    
    PRINT 'Table orders created successfully';
END
GO

-- ============================================
-- Tabla: packages (Paquetes dentro de una orden)
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='packages' AND xtype='U')
BEGIN
    CREATE TABLE packages (
        package_id INT IDENTITY(1,1) PRIMARY KEY,
        order_id UNIQUEIDENTIFIER NOT NULL,
        weight_kg DECIMAL(10, 2) NOT NULL,
        description NVARCHAR(255) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_packages_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        CONSTRAINT CK_packages_weight CHECK (weight_kg > 0)
    );
    
    CREATE INDEX IX_packages_order_id ON packages(order_id);
    
    PRINT 'Table packages created successfully';
END
GO

-- ============================================
-- Tabla: order_pricing (Desglose de precio)
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_pricing' AND xtype='U')
BEGIN
    CREATE TABLE order_pricing (
        pricing_id INT IDENTITY(1,1) PRIMARY KEY,
        order_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
        total_weight_kg DECIMAL(10, 2) NOT NULL,
        base_price DECIMAL(10, 2) NOT NULL,
        zone_surcharge DECIMAL(10, 2) NOT NULL DEFAULT 0,
        service_surcharge DECIMAL(10, 2) NOT NULL DEFAULT 0,
        discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        subtotal DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'GTQ',
        calculated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_order_pricing_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        CONSTRAINT CK_order_pricing_total_weight CHECK (total_weight_kg > 0),
        CONSTRAINT CK_order_pricing_discount_percentage CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
    );
    
    CREATE INDEX IX_order_pricing_order_id ON order_pricing(order_id);
    
    PRINT 'Table order_pricing created successfully';
END
GO

-- ============================================
-- Datos de prueba (opcional)
-- ============================================
PRINT 'Database schema created successfully';
PRINT 'Tables: orders, packages, order_pricing';
GO
