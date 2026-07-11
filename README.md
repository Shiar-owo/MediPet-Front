# MediPet Front-End

Sistema de gestión para clínica veterinaria. Front-end desarrollado con React, TypeScript y Vite.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS
- **Routing:** React Router v6
- **Estado (servidor):** TanStack React Query
- **Estado (cliente):** Zustand
- **HTTP Client:** Axios
- **Formularios:** React Hook Form + Zod
- **Paquetería:** Yarn

## Requisitos

- Node.js >= 18
- Yarn
- Backend corriendo en `http://localhost:8080`

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
yarn dev
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend API | `http://localhost:8080` |

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                  # Componentes de UI (Input, Select, Button, etc.)
│   ├── layout/              # Sidebar, Layout, AuthLayout
│   └── shared/              # Componentes reutilizables (DataTable, Pagination, etc.)
├── pages/
│   ├── auth/                # LoginPage
│   ├── dashboard/           # DashboardPage
│   ├── clients/             # ClientList, ClientForm, ClientDetail
│   ├── pets/                # PetList, PetForm, PetDetail
│   ├── appointments/        # AppointmentList, AppointmentForm, AppointmentDetail
│   └── users/               # UserList, UserForm (solo ADMIN)
├── hooks/                   # Custom hooks
├── services/                # Capa de servicios API (auth, client, pet, appointment, user)
├── store/                   # Zustand stores (useAuthStore)
├── context/                 # AuthProvider
├── lib/                     # Axios instance, utils
├── types/                   # Interfaces TypeScript
└── routes/                  # ProtectedRoute
```

## Páginas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/login` | Inicio de sesión | Público |
| `/dashboard` | Panel principal con estadísticas | Todos |
| `/clients` | Gestión de clientes | Todos |
| `/pets` | Gestión de mascotas | Todos |
| `/appointments` | Gestión de turnos | Todos |
| `/users` | Gestión de usuarios | ADMIN |

## Roles

- **ADMIN** — Acceso total (gestión de usuarios)
- **VETERINARIO** — Turnos, clientes, mascotas
- **RECEPCIONISTA** — Clientes, mascotas, turnos

## API Endpoints

### Auth
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/register` — Registrar usuario (ADMIN)
- `POST /api/auth/refresh` — Refrescar token
- `POST /api/auth/logout` — Cerrar sesión

### Clients
- `GET /api/clients` — Listar clientes
- `POST /api/clients` — Crear cliente
- `GET /api/clients/{id}` — Obtener cliente
- `PUT /api/clients/{id}` — Actualizar cliente
- `GET /api/clients/dni/{dni}` — Buscar por DNI

### Pets
- `GET /api/pets` — Listar mascotas
- `POST /api/pets` — Crear mascota
- `GET /api/pets/{id}` — Obtener mascota
- `PUT /api/pets/{id}` — Actualizar mascota
- `GET /api/pets/microchip/{microchipId}` — Buscar por microchip
- `GET /api/pets/client/{clientId}` — Listar por cliente

### Appointments
- `GET /api/appointments` — Listar turnos
- `POST /api/appointments` — Crear turno
- `GET /api/appointments/{id}` — Obtener turno
- `PUT /api/appointments/{id}` — Actualizar turno
- `PATCH /api/appointments/{id}/cancel` — Cancelar turno
- `GET /api/appointments/veterinarian/{vetId}` — Listar por veterinario
- `GET /api/appointments/pet/{petId}` — Listar por mascota
- `GET /api/appointments/client/{clientId}` — Listar por cliente

### Users (ADMIN)
- `GET /api/users` — Listar usuarios
- `GET /api/users/{id}` — Obtener usuario
- `PUT /api/users/{id}` — Actualizar usuario
- `PATCH /api/users/{id}/activate` — Activar usuario
- `PATCH /api/users/{id}/deactivate` — Desactivar usuario

## Comandos

```bash
yarn dev          # Iniciar servidor de desarrollo
yarn build        # Construir para producción
yarn preview      # Vista previa de la build
yarn lint         # Ejecutar linter
```

## Deploy

El proyecto está configurado para desplegarse en Vercel. La configuración se encuentra en `vercel.json`.

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
vercel
```
