# Sistema de Micelánea - Punto de Venta

Aplicación móvil para gestión de tienda (micelánea) con escáner de códigos de barra, inventario y reportes.

## Estructura del Proyecto

```
Micelanea/
├── database/
│   └── schema.sql          # Esquema de base de datos
├── docker-compose.yml      # PostgreSQL + pgAdmin
├── backend/                # API REST con Express
│   └── src/
│       ├── controllers/    # Lógica de negocio
│       ├── routes/         # Endpoints de API
│       └── index.js        # Servidor principal
└── MicelaneaApp/           # App móvil (React Native + Expo)
    └── src/
        ├── screens/        # Pantallas de la app
        ├── context/        # Contextos (Auth, Carrito)
        ├── services/       # Conexión a API
        └── navigation/     # Navegación
```

## Requisitos Previos

- Node.js 18+
- Docker Desktop
- Expo Go (para Android/iOS)

## Pasos de Instalación

### 1. Levantar Base de Datos (Docker)

```bash
cd Micelanea
docker-compose up -d
```

Esto levanta:
- **PostgreSQL**: `localhost:5432` (db: micelanea, user: micelanea, pass: micelanea123)
- **pgAdmin**: `http://localhost:5050` (email: admin@micelanea.com, pass: admin123)

### 2. Configurar Base de Datos

1. Abre pgAdmin en `http://localhost:5050`
2. Conecta al servidor PostgreSQL
3. Crea una base de datos llamada `micelanea`
4. Ejecuta el contenido de `database/schema.sql`

### 3. Instalar y Ejecutar Backend

```bash
cd backend
npm install
npm start
```

El backend corre en `http://localhost:3000`

### 4. Correr la App Móvil

#### Opción A: Ver en navegador web (más fácil)
```bash
cd MicelaneaApp
npx expo export --platform web
cd dist
python -m http.server 4000
```
Luego abre: **http://localhost:4000**

#### Opción B: En tu teléfono
```bash
cd MicelaneaApp
npm install
npx expo start
```
- Instala **Expo Go** desde Play Store (Android) o App Store (iOS)
- Escanea el código QR que aparece en la terminal

#### Opción C: En emulador Android
```bash
cd MicelaneaApp
npx expo run:android
```
- Requiere Android Studio configurado

### 5. Solución de Problemas

**Puerto en uso:**
```bash
# Windows: encontrar proceso
netstat -ano | findstr :8081
# Matar proceso
taskkill //PID <NUMERO> //F
```

**Volver a construir web:**
```bash
cd MicelaneaApp
rm -rf dist
npx expo export --platform web
```

## Funcionalidades

### Caja/POS
- Escaneo de códigos de barra con cámara
- Búsqueda manual de productos
- Carrito de compras
- Cálculo automático de totales
- Aplicación de descuentos
- Métodos de pago (efectivo, tarjeta, transferencia)
- Generación de ticket (cambio calculado)

### Inventario
- Lista de productos con stock
- Agregar/editar/eliminar productos
- Código de barras, nombre, precio, categoría
- Alertas de stock bajo

### Reportes
- Ventas por período (hoy, semana, mes)
- Total de ventas, promedio
- Historial de transacciones

### Usuarios
- Login de empleados y admin
- Control de acceso

## Usuarios por Defecto

| Username | Password | Rol |
|----------|----------|-----|
| admin | admin123 | admin |

## API Endpoints

```
POST   /api/auth/login          - Login
GET    /api/auth/me             - Usuario actual
GET    /api/productos           - Listar productos
GET    /api/productos/codigo/:  - Buscar por código
POST   /api/productos           - Crear producto
PUT    /api/productos/:id       - Actualizar producto
DELETE /api/productos/:id       - Eliminar producto
POST   /api/ventas              - Crear venta
GET    /api/ventas              - Listar ventas
GET    /api/reportes/ventas     - Reporte de ventas
POST   /api/descuentos/aplicar  - Aplicar descuento
```

## Tecnologías

- **Frontend**: React Native, Expo, React Navigation, React Native Paper
- **Backend**: Node.js, Express, PostgreSQL, JWT
- **Base de datos**: PostgreSQL con pgAdmin
