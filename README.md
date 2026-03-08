# Micelánea - Sistema de Punto de Venta

Aplicación móvil/web para la gestión integral de una tienda (micelánea). Incluye caja con escáner de códigos de barras, gestión de inventario y reportes estadísticos.

## Estructura del Proyecto
- **backend/**: API REST (Node.js + Express)
- **MicelaneaApp/**: Aplicación Frontend (React Native + Expo)
- **database/**: Scripts de base de datos
- **docker-compose.yml**: Entorno de base de datos PostgreSQL

## Requisitos
- Node.js 18+
- Docker y Docker Compose
- Expo CLI

## Instalación y Ejecución Rápida

**1. Iniciar Base de Datos (Docker)**
```bash
docker compose up -d
```
> **Nota:** PostgreSQL expone el puerto `5433` (db: `micelanea`, user: `micelanea`, pass: `micelanea123`). pgAdmin en `http://localhost:5050` (admin@micelanea.com / admin123).

**2. Iniciar Backend**
```bash
cd backend
npm install
npm start
```
> El servidor API correrá en `http://localhost:3000`.

**3. Iniciar App Frontend (Web)**
```bash
cd MicelaneaApp
npm install
npm run web
```
> La aplicación web abrirá en `http://localhost:8081`. 

## Credenciales por Defecto de la App
Para iniciar sesión en la aplicación, utiliza:
- **Usuario:** `admin` 
- **Contraseña:** `admin123`
