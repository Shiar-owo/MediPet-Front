# MediPet Front-End - Plan de Implementación

## Tech Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Estilos | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Estado (servidor) | TanStack React Query |
| Estado (cliente) | Zustand |
| HTTP Client | Axios |
| Formularios | React Hook Form + Zod |
| Paquetería | Yarn |
| Deploy | Vercel |
| Documentación | README.md |

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   ├── layout/              # Sidebar, Header, AuthLayout
│   └── shared/              # DataTable, Pagination, FormFields
├── pages/
│   ├── auth/                # LoginPage
│   ├── dashboard/           # DashboardPage
│   ├── clients/             # ClientList, ClientForm, ClientDetail
│   ├── pets/                # PetList, PetForm, PetDetail
│   ├── appointments/        # AppointmentList, AppointmentForm, AppointmentDetail
│   └── users/               # UserList, UserForm (solo ADMIN)
├── hooks/                   # useDebounce, usePagination, useAuth
├── services/                # authService, clientService, petService, appointmentService, userService
├── store/                   # useAuthStore (Zustand)
├── context/                 # AuthProvider
├── lib/                     # Axios instance, utils, constants
├── types/                   # Interfaces TypeScript (esquemas del API)
├── routes/                  # Definición de rutas + ProtectedRoute
└── App.tsx                  # Root con providers
```

## API Reference (from OpenAPI 3.1)

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login (email+password → JWT tokens) | Public |
| POST | `/api/auth/register` | Register user (ADMIN only) | ADMIN |
| POST | `/api/auth/refresh` | Refresh JWT tokens | Public |
| POST | `/api/auth/logout` | Invalidate refresh token | Bearer |

**LoginRequest**: `{ email: string, password: string }`
**LoginResponse**: `{ accessToken, refreshToken, email, role }`
**RegisterUserRequest**: `{ email, password, firstName?, lastName?, phone?, role? }`
**RefreshTokenRequest**: `{ refreshToken: string }`
**RefreshTokenResponse**: `{ accessToken, refreshToken }`

### Clients (`/api/clients`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/clients?q=&page=&size=` | List/search clients | Bearer |
| POST | `/api/clients` | Create client | Bearer |
| GET | `/api/clients/{id}` | Get client by UUID | Bearer |
| PUT | `/api/clients/{id}` | Update client | Bearer |
| GET | `/api/clients/dni/{dni}` | Get client by DNI | Bearer |

**ClientRequest**: `{ name (req), dni (req), phone?, email?, address? }`
**ClientResponse**: `{ id, name, dni, phone, email, address, active }`
**UpdateClientRequest**: `{ name?, phone?, email?, address? }`

### Pets (`/api/pets`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pets?q=&page=&size=` | List/search pets | Bearer |
| POST | `/api/pets` | Create pet | Bearer |
| GET | `/api/pets/{id}` | Get pet by UUID | Bearer |
| PUT | `/api/pets/{id}` | Update pet | Bearer |
| GET | `/api/pets/microchip/{microchipId}` | Get pet by microchip | Bearer |
| GET | `/api/pets/client/{clientId}` | List pets by client | Bearer |

**PetRequest**: `{ name (req), clientId (req), species (req), breed?, dateOfBirth?, sex?, color?, weight?, microchipId?, tattooNumber?, photoUrl? }`
**PetResponse**: `{ id, name, species, breed, dateOfBirth, sex, color, weight, microchipId, tattooNumber, photoUrl, active, clientId }`
**UpdatePetRequest**: `{ name?, species?, breed?, dateOfBirth?, sex?, color?, weight?, microchipId?, tattooNumber?, photoUrl? }`

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/appointments?date=&page=&size=` | List/filter appointments | Bearer |
| POST | `/api/appointments` | Create appointment | Bearer |
| GET | `/api/appointments/{id}` | Get appointment by UUID | Bearer |
| PUT | `/api/appointments/{id}` | Update appointment | Bearer |
| PATCH | `/api/appointments/{id}/cancel` | Cancel appointment | Bearer |
| GET | `/api/appointments/veterinarian/{vetId}` | List by vet | Bearer |
| GET | `/api/appointments/pet/{petId}` | List by pet | Bearer |
| GET | `/api/appointments/client/{clientId}` | List by client | Bearer |

**AppointmentRequest**: `{ date (req), startTime (req), endTime (req), reason?, petId (req), clientId (req), veterinarianId (req) }`
**AppointmentResponse**: `{ id, date, startTime, endTime, reason, status, cancelReason, petId, clientId, veterinarianId, active }`
**UpdateAppointmentRequest**: `{ date?, startTime?, endTime?, reason? }`
**CancelBody**: `{ reason?: string }`

### Users (`/api/users`) — ADMIN only
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users?page=&size=` | List users | ADMIN |
| GET | `/api/users/{id}` | Get user by UUID | ADMIN |
| PUT | `/api/users/{id}` | Update user | ADMIN |
| PATCH | `/api/users/{id}/activate` | Activate user | ADMIN |
| PATCH | `/api/users/{id}/deactivate` | Deactivate user | ADMIN |

**UserResponse**: `{ id, email, firstName, lastName, role, active, phone, address, dateOfBirth, avatar, lastLoginAt }`
**UpdateUserRequest**: `{ firstName?, lastName?, role?, phone?, address?, avatar? }`

### Roles
- `ADMIN` — Full access (users management)
- `VETERINARIO` — Appointments, clients, pets
- `RECEPCIONISTA` — Clients, pets, appointments

### Response Structure
- **Single**: `{ success: boolean, data: T, error: ErrorBody }`
- **Paginated**: `{ success: boolean, data: { content: T[], page, size, totalElements, totalPages }, error }`
- **ErrorBody**: `{ status: number, code: string, message: string, path: string, timestamp: string }`

## Páginas y Funcionalidades

### Login (`/login`)
- Formulario email/password
- Almacena tokens JWT en localStorage
- Redirige al dashboard tras login exitoso

### Dashboard (`/dashboard`)
- Tarjetas de estadísticas (total clientes, mascotas, turnos hoy)
- Lista de turnos del día

### Clientes (`/clients`)
- **Lista** con búsqueda, paginación
- **Crear** nuevo cliente (name, dni, phone, email, address)
- **Editar** cliente existente
- **Detalle** con mascotas del cliente

### Mascotas (`/pets`)
- **Lista** con búsqueda, paginación
- **Crear** mascota (asociada a un cliente)
- **Editar** mascota existente
- **Detalle** con historial de turnos

### Turnos (`/appointments`)
- **Lista** con filtro por fecha, paginación
- **Crear** turno (seleccionar cliente → mascota → veterinario → fecha/hora)
- **Editar** turno existente
- **Cancelar** turno con motivo

### Usuarios (`/users`) — Solo ADMIN
- **Lista** de usuarios
- **Crear** nuevo usuario (email, password, name, role)
- **Editar** usuario
- **Activar/Desactivar** usuario

## Autenticación y Autorización

- JWT access + refresh tokens en localStorage
- Axios interceptor para auto-refresh del token
- ProtectedRoute con verificación de rol
- Roles: ADMIN, VETERINARIO, RECEPCIONISTA

## Componentes Compartidos

| Componente | Descripción |
|------------|-------------|
| `DataTable` | Tabla reutilizable con paginación, búsqueda, ordenamiento |
| `Pagination` | Controles de paginación |
| `SearchInput` | Input de búsqueda con debounce |
| `FormField` | Wrapper de react-hook-form para inputs |
| `SelectField` | Select con label y validación |
| `DatePicker` | Selector de fecha |
| `Toast` | Notificaciones de éxito/error |
| `LoadingSpinner` | Indicador de carga |
| `EmptyState` | Estado vacío para listas |
| `ConfirmDialog` | Diálogo de confirmación (para cancelar, eliminar) |

## Dependencias

### Production
```
react, react-dom
react-router-dom
@tanstack/react-query
zustand
axios
react-hook-form
@hookform/resolvers
zod
date-fns
lucide-react
```

### Development
```
typescript, @types/react, @types/react-dom
vite, @vitejs/plugin-react
tailwindcss, postcss, autoprefixer
@tailwindcss/typography
eslint, prettier
```

## Orden de Implementación

1. **Setup del proyecto** — Vite, Tailwind, shadcn/ui, TypeScript config
2. **Tipos e interfaces** — Mapear esquemas del API a interfaces TS
3. **Capa de servicios API** — Instancia Axios + servicios por entidad
4. **Autenticación** — Context, Zustand store, ProtectedRoute, login page
5. **Layout** — Sidebar, Header, estructura base
6. **Componentes compartidos** — DataTable, Pagination, formularios
7. **Páginas** — Login → Dashboard → Clientes → Mascotas → Turnos → Usuarios
8. **Documentación** — README.md con setup, estructura, endpoints
9. **Variables de entorno** — `.env` con VITE_API_URL
10. **Configuración Vercel** — `vercel.json` para SPA routing

## Variables de Entorno

```env
VITE_API_URL=http://localhost:8080
```

## Rubrica - Criterios Cubiertos

| # | Criterio | Cómo se cubre |
|---|----------|---------------|
| 1 | Configuración y entorno | Vite, yarn, .env, README.md |
| 2 | Estructura del proyecto | Separación por carpetas (components, pages, hooks, services, context, store) |
| 3 | JSX y componentes | Componentes funcionales reutilizables |
| 4 | Props y comunicación | Props tipadas entre componentes |
| 5 | useState | Estados locales en formularios, filtros, UI |
| 6 | useEffect | Limpieza de suscripciones, efectos secundarios |
| 7 | Eventos y formularios | React Hook Form + validación Zod |
| 8 | Renderizado dinámico | Listas con keys, condicionales de rol |
| 9 | React Router | Rutas anidadas, useParams, useNavigate |
| 10 | Consumo de APIs | Axios + React Query (loading, error, refetch) |
| 11 | Estado global | Zustand (auth) + React Query (server state) |
| 12 | Hooks avanzados | useCallback, useRef, custom hooks |
| 13 | Autenticación y persistencia | JWT real con el API, localStorage |
| 14 | Funcionalidad extra | — |
| 15 | Deploy | Vercel |
| 16 | Responsive | Tailwind breakpoints (mobile, laptop, desktop) |
