# Micelánea POS - Sistema de Punto de Venta

Sistema integral de gestión para miceláneas y tiendas de conveniencia. Aplicación móvil con escáner de códigos de barra, control de inventario y reportes en tiempo real.

## Características Principales

- 📱 **Caja/POS**: Escaneo de códigos de barra con cámara, carrito de compras interactivo
- 📦 **Inventario**: Control de stock, categorías, alertas de productos bajos
- 📊 **Reportes**: Ventas diarias, semanales y mensuales con estadísticas
- 👥 **Usuarios**: Sistema de autenticación con roles (admin/empleado)
- 🎨 **UI Cyberpunk**: Diseño moderno con temática futurista

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React Native, Expo, React Navigation |
| Backend | Node.js, Express |
| Base de Datos | PostgreSQL |
| Contenedores | Docker, Docker Compose |
| UI Components | React Native Paper |

## Requisitos Previos

- Node.js 18 o superior
- Docker Desktop
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Micelanea
```

### 2. Levantar la base de datos

```bash
docker-compose up -d
```

Esto crea:
- PostgreSQL en el puerto 5432
- pgAdmin en http://localhost:5050

### 3. Configurar la base de datos

1. Abre pgAdmin en http://localhost:5050
2. Crea una nueva base de datos llamada `micelanea`
3. Ejecuta el script `database/schema.sql` en la base de datos

### 4. Instalar y ejecutar el backend

```bash
cd backend
npm install
npm start
```

El API estará disponible en `http://localhost:3000`

### 5. Instalar y ejecutar la app

```bash
cd MicelaneaApp
npm install
npx expo start
```

**Para ver en navegador web:**
```bash
npx expo export --platform web
cd dist
python -m http.server 4000
```
Luego abre http://localhost:4000

## Uso de la Aplicación

### Login
Ingresa con las credenciales de administrador configuradas en la base de datos.

### Módulos

**Caja (POS)**
- Escanea productos con la cámara del dispositivo
- Busca productos manualmente por nombre o código
- Agrega productos al carrito
- Aplica descuentos
- Procesa pagos (efectivo, tarjeta, transferencia)
- Genera ticket con cambio

**Inventario**
- Ver lista completa de productos
- Agregar nuevos productos
- Editar información de productos
- Eliminar productos
- Ver stock disponible

**Reportes**
- Ver ventas del día
- Ver ventas de la semana
- Ver ventas del mes
- Estadísticas: total de ventas, promedio

## Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=micelanea
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_contraseña
JWT_SECRET=tu_secret_key
```

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

MIT License - Consulta el archivo LICENSE para más detalles.
