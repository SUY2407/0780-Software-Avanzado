CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(100),
    imageUrl VARCHAR(500),
    providerId INT,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO products (sku, name, description, price, stock, category, imageUrl, providerId)
VALUES
('SKU002', 'iPhone 14', 'Smartphone Apple 6.1 pulgadas', 23000, 8, 'Tecnología', 'https://img.com/iphone14.jpg', 1),
('SKU003', 'Teclado Mecánico RGB', 'Teclado gamer switches rojos', 1200, 15, 'Accesorios', 'https://img.com/keyboard.jpg', 2),
('SKU004', 'Mouse Logitech G502', 'Mouse gamer 25K HERO sensor', 900, 20, 'Accesorios', 'https://img.com/mouse.jpg', 2),
('SKU005', 'Monitor Samsung 27"', 'Monitor 144Hz Gaming Curvo', 4500, 7, 'Tecnología', 'https://img.com/monitor1.jpg', 3),
('SKU006', 'Silla Gamer', 'Silla ergonómica reclinable', 3200, 4, 'Hogar', 'https://img.com/silla.jpg', 3),
('SKU007', 'Cámara Canon M50', 'Cámara profesional mirrorless', 12500, 3, 'Fotografía', 'https://img.com/canonm50.jpg', 4),
('SKU008', 'Audífonos Sony WH-1000XM4', 'Noise cancelling premium', 5800, 12, 'Audio', 'https://img.com/sony.jpg', 2),
('SKU009', 'Bocina JBL Charge 5', 'Bocina portátil Bluetooth', 2200, 18, 'Audio', 'https://img.com/jbl.jpg', 4),
('SKU010', 'Smartwatch Samsung', 'Reloj inteligente serie Galaxy', 3100, 9, 'Tecnología', 'https://img.com/swatch.jpg', 1),
('SKU011', 'Tablet Lenovo 10"', 'Tablet Android 4GB RAM', 2800, 11, 'Tecnología', 'https://img.com/tablet.jpg', 3),
('SKU012', 'SSD 1TB Kingston', 'Unidad sólida NVMe 1TB', 1600, 25, 'Almacenamiento', 'https://img.com/ssd.jpg', 2),
('SKU013', 'Disco Duro 2TB', 'HDD Seagate 2TB', 1300, 14, 'Almacenamiento', 'https://img.com/hdd.jpg', 2),
('SKU014', 'Impresora Epson', 'Impresora multifunción WiFi', 2600, 6, 'Oficina', 'https://img.com/epson.jpg', 4),
('SKU015', 'Cargador USB-C 65W', 'Cargador rápido universal', 450, 30, 'Accesorios', 'https://img.com/cargador.jpg', 5),
('SKU016', 'Nintendo Switch', 'Consola híbrida portátil/home', 8500, 5, 'Consolas', 'https://img.com/switch.jpg', 1),
('SKU017', 'Control Xbox Series X', 'Control inalámbrico Carbon Black', 1500, 17, 'Consolas', 'https://img.com/xboxcontrol.jpg', 1),
('SKU018', 'Paquete Office 365', 'Suscripción anual Microsoft Office', 1200, 50, 'Software', 'https://img.com/office.jpg', 4),
('SKU019', 'Router TP-Link AX1800', 'Router WiFi 6 doble banda', 1600, 10, 'Redes', 'https://img.com/router.jpg', 3),
('SKU020', 'Lámpara LED de Escritorio', 'Lámpara ajustable luz blanca', 300, 40, 'Hogar', 'https://img.com/lampara.jpg', 5);

ALTER TABLE products
ADD CONSTRAINT UQ_products_sku UNIQUE (sku);
