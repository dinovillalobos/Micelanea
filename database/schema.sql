-- Database schema SQL para PostgreSQL

-- Tabla de usuarios/empleados
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado', -- 'admin' o 'empleado'
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos/inventario
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_barra VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INTEGER DEFAULT 0,
    categoria VARCHAR(50),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    metodo_pago VARCHAR(20) DEFAULT 'efectivo', -- 'efectivo', 'tarjeta', 'transferencia'
    status VARCHAR(20) DEFAULT 'completada', -- 'completada', 'cancelada'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalles de venta
CREATE TABLE venta_detalles (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de descuentos (para promociones)
CREATE TABLE descuentos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(10) NOT NULL, -- 'porcentaje' o 'monto'
    valor DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin por defecto (password: admin123)
INSERT INTO usuarios (username, password, nombre, rol) 
VALUES ('admin', '$2a$10$IjmuEDPj.M7fnnVFPiOytuDERH7r7cq.0iPKT1yBfmLUjm7Th0zte', 'Administrador', 'admin');

-- Insertar algunos productos de ejemplo
INSERT INTO productos (codigo_barra, nombre, descripcion, precio, cantidad, categoria) VALUES
('7501234567890', 'Coca-Cola 600ml', 'Bebida gaseosa', 18.00, 50, 'Bebidas'),
('7501234567891', 'Sabritas Originales', 'Papas fritas', 15.00, 30, 'Botanas'),
('7501234567892', 'Pan Bimbo Grande', 'Pan de molde', 25.00, 20, 'Panaderia'),
('7501234567893', 'Huevos Lucky 12p', 'Huevos blancos', 35.00, 15, 'Huevos'),
('7501234567894', 'Leche San Lucas 1L', 'Leche entera', 22.00, 25, 'Lacteos');
