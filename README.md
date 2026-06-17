# Librería - Sistema de Gestión de Inventario

Sistema completo para gestionar el inventario, ventas, sugerencias y lista de compras de una librería. Incluye autenticación con roles (administrador y vendedor), generación de reportes PDF, asistente IA integrado y verificación CAPTCHA.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, React Router, Axios, Recharts, Lucide Icons |
| Backend | NestJS 10, TypeORM, Passport JWT, bcrypt, pdfmake |
| Base de datos | MySQL 8.0+ |
| Contenedores | Docker, Docker Compose |

## Requisitos previos

- **Node.js** 20 o superior
- **MySQL** 8.0 o superior
- **npm** 9 o superior
- **Docker y Docker Compose** (opcional, para despliegue con contenedores)

## Instalación local

### 1. Clonar el proyecto

```bash
git clone https://github.com/cdqh777/proy_backend.git
cd libreria-inventario-FINAL
```

### 2. Configurar la base de datos

Inicia MySQL y ejecuta el script SQL para crear la base de datos y las tablas:

```bash
mysql -u root -p < db/dblibreria.sql
```

Esto creará la base de datos `libreria_inventario` con todas las tablas y datos iniciales.

### 3. Configurar el backend

```bash
cd backend
npm install
```

Crea o edita el archivo `.env` en la carpeta `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=libreria_inventario
JWT_SECRET=libreria_super_secret_key_2024
JWT_EXPIRES_IN=8h
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Inicia el backend:

```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3001`.

### 4. Configurar el frontend

Abre una nueva terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`.

## Instalación con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Esto levantará tres servicios:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `libreria_db` | 3306 | MySQL 8.0 |
| `libreria_backend` | 3001 | API NestJS |
| `libreria_frontend` | 80 | Frontend con Nginx |

Accede a la aplicación en `http://localhost`.

Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los datos de la base de datos:

```bash
docker compose down -v
```

## Credenciales de acceso

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin.libreria@gmail.com | Admin2026! |
| Vendedor 1 | vendedor1.libreria@gmail.com | Vend1Libreria |
| Vendedor 2 | vendedor2.libreria@gmail.com | Vend2Libreria |
| Vendedor 3 | vendedor3.libreria@gmail.com | Vend3Libreria |

## Estructura del proyecto

```
libreria-inventario-FINAL/
├── backend/
│   ├── src/
│   │   ├── access-log/      # Registro de accesos (login/logout)
│   │   ├── agente/          # Asistente IA integrado
│   │   ├── articles/        # Gestión de artículos
│   │   ├── auth/            # Autenticación JWT y roles
│   │   ├── categories/      # Tipos de artículo
│   │   ├── purchase-list/   # Lista de compras
│   │   ├── reports/         # Reportes y PDFs
│   │   ├── sales/           # Gestión de ventas
│   │   ├── suggestions/     # Sugerencias de clientes
│   │   ├── users/           # Gestión de usuarios
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables y layout
│   │   ├── context/         # Contexto de autenticación
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── admin/       # Páginas exclusivas del administrador
│   │   │   ├── auth/        # Login con CAPTCHA
│   │   │   └── seller/      # Páginas del vendedor
│   │   ├── services/        # Cliente API (Axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── db/
│   └── dblibreria.sql       # Script de base de datos
├── docker-compose.yml
└── README.md
```

## Scripts disponibles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Inicia en modo desarrollo con recarga automática |
| `npm run build` | Compila el proyecto para producción |
| `npm run start:prod` | Inicia la versión compilada |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta las pruebas con Jest |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en puerto 3000 |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza la compilación de producción |

## Funcionalidades

- **Autenticación** con JWT, roles (administrador/vendedor) y CAPTCHA
- **Gestión de artículos** con control de stock, estados y sugerencia de precios
- **Ventas** con anulación, devoluciones y registro de reclamos
- **Sugerencias** de clientes con contador de solicitudes
- **Lista de compras** con prioridades y seguimiento
- **Reportes PDF** de ventas con top 5 artículos más vendidos
- **Registro de accesos** con IP y navegador del usuario
- **Asistente IA** integrado para consultas de inventario
- **Creación de usuarios** con clasificación de fortaleza de contraseña (débil, intermedia, fuerte)
- **Dashboard** con métricas y gráficos en tiempo real
