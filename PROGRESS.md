# Cuentas Claras API — Checkpoint de Desarrollo

> Estado guardado al **2 de septiembre de 2026**. Este archivo documenta el avance para poder retomar el trabajo en otra sesión.

## Fase actual

**Fase 3: Módulo de Autenticación** — en progreso.

## Completado ✅

### Configuración base

- `package.json` con `"type": "module"` (ESM) y scripts:
  - `dev`: `tsx watch src/server.ts`
  - `build`: `tsc --project tsconfig.json`
  - `start`: `node dist/server.js`
- Dependencias instaladas (`npm install` ya ejecutado):
  - Producción: `express`, `prisma`, `@prisma/client`, `zod`
  - Dev: `typescript`, `tsx`, `eslint`, `@types/node`, `@types/express`
- `tsconfig.json` creado y verificado:
  - `target: ES2022`, `module/moduleResolution: nodenext`
  - `strict: true`, `outDir: ./dist`, `rootDir: ./src`
  - `esModuleInterop: true`, `skipLibCheck: true`
  - `include: ["src/**/*"]`, `exclude: ["node_modules", "dist"]`
- Estructura inicial `src/` (Clean Architecture del README):
  - `domain/entities/`, `domain/services/`
  - `application/`
  - `infrastructure/`
  - `interface/`
  - `app.ts` y `server.ts`
- `.gitignore` creado: excluye `node_modules/`, `dist/`, `.env`, logs, editores.

### Código verificado

- `src/app.ts`: instancia Express + `app.use(express.json())` + `app.use(ErrorHandler)`, export default.
- `src/server.ts`: `port = 3000`, `app.listen` con log en español, y listener `server.on('error')` con `process.exit(1)` para puerto ocupado (error asíncrono, por eso NO se usa try/catch).
- `npm run build` compila sin errores.

### Base de datos (Docker)

- Docker Desktop 4.86.0 instalado en `C:\Users\Santi\AppData\Local\Programs\DockerDesktop` (NO en Program Files).
- El comando `docker` requiere PATH actualizado: cerrar/reabrir terminal, o ruta completa `C:\Users\Santi\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe`.
- `docker-compose.yml` en la raíz: Postgres 16, contenedor `cuentasclaras-postgres`, puerto host **4000** → 5432 interno, volumen `pgdata`.
- Contenedor **arriba y corriendo** (verificado con `docker compose ps`).
- Credenciales de dev: `POSTGRES_USER=admin`, `POSTGRES_PASSWORD=1144066482`, `POSTGRES_DB=cuentasclaras_dev`.

### Prisma

- `prisma/schema.prisma` creado con **6 modelos** y relaciones definidas:
  - **User**: id (UUID), email (unique), name, password, createdAt, updatedAt.
  - **Household**: id (UUID), name, createdAt, updatedAt.
  - **HouseholdMember**: relación N:M User-Household con campo `role` (admin | member). Constraint @@unique([userId, householdId]).
  - **Expense**: id (UUID), description, amount (Int, pesos COP), paidBy (userId), date, householdId. Relación con Household y User.
  - **ExpenseSplit**: composite key [expenseId, userId], amount (Int), paid (Boolean). Divide un gasto entre usuarios.
  - **Settlement**: id (UUID), amount (Int), from (userId deudor), to (userId acreedor), settled (Boolean), createdAt, updatedAt. Relaciones self-referencing con User (`settlementsAsFrom`, `settlementsAsTo`).
- `.env` creado con `DATABASE_URL` apuntando a `localhost:4000`.
- Migración `20260826233443_init` generada y aplicada — las 6 tablas están en la BD.
- Prisma Client generado (`node_modules/@prisma/client`).

### Entidades de Dominio (Fase 2 - completa)

- `src/domain/entities/user.ts` — interfaz `User`: id, email, name.
- `src/domain/entities/household.ts` — interfaz `Household`: id, name.
- `src/domain/entities/expense.ts` — interfaz `Expense`: id, description, amount, paidBy, date, householdId.
- `src/domain/entities/settlement.ts` — interfaz `Settlement`: id, amount, from, to, settled.
- `src/domain/entities/expenseSplit.ts` — interfaz `ExpenseSplit`: userId, amount, paid.
- `src/domain/entities/householdMember.ts` — interfaz `HouseholdMember`: userId, role.

### Decisiones de diseño para entidades

- Las entidades de dominio son interfaces TypeScript puras (sin decorators de Prisma).
- Solo incluyen campos esenciales para el negocio (sin timestamps de BD).
- `password` no va en el dominio (es de infraestructura/auth).
- Relaciones se representan con IDs (strings), no con objetos anidados.
- `HouseholdMember` no incluye `householdId` porque siempre se infiere del contexto.
- `ExpenseSplit` no incluye `expenseId` porque se infiere del contexto del gasto padre.

### Manejo de Errores (Fase 2 - completa)

- `src/domain/errors/AppError.ts` — clase que extiende `Error`:
  - Propiedades públicas: `statusCode`, `code`, `message`, `details`.
  - Constructor: `(statusCode, code, message, details?)` con `super(message)`.
  - `details` opcional con default `{}`.
- `src/interface/middlewares/errorHandler.ts` — middleware global de Express (4 parámetros):
  - `if (err instanceof AppError)` → responde con `statusCode`, `code`, `message`, `details`.
  - `else` → responde `500` `INTERNAL_SERVER_ERROR` con mensaje genérico.
  - Usa `return res.status().json()` (corta la ejecución).
  - `next` solo como parámetro para que Express lo identifique como error handler.
- `src/app.ts` registra `app.use(ErrorHandler)` al final de la cadena de middlewares.
- Se verificó que la app compila y levanta correctamente.

### Contrato de API (Creación de `API.md`)

- Se creó `API.md` en la raíz con el contrato de los endpoints definidos a la fecha.
- Se decidió **documentar el contrato completo ANTES de implementar endpoints**, para tener una base probada y consistente.
- El contrato usa **respuestas planas** (sin envelope `{error, data}`, sin repetir `statusCode` en el body).

## Trabajo de hoy (2 de septiembre de 2026)

- Definida la decisión de **empezar por el contrato de API** antes que por la implementación de endpoints, para validar formato de respuestas, errores y arquitectura sobre una base sólida.
- Creado y revisado `API.md` con el endpoint `POST /v1/users`. Se evaluó el uso de bloques preformateados (code blocks) pero se **descartó**: se prefiere el formato plano para legibilidad.
- **Módulo de autenticación documentado en `API.md`** (4 endpoints):
  - `POST /v1/users` — Registro.
  - `POST /v1/auth/login` — Login (devuelve solo tokens: `{ accessToken, refreshToken }`).
  - `GET /v1/users/:id` — Perfil (protegido, solo el propio usuario, perfil simple `{ id, email, name }`).
  - `POST /v1/auth/refresh` — Refresh token (body: `{ refreshToken }`, devuelve nuevos tokens).
- **GitHub:** se mergeó `feat/domain-entities` a `main` (fast-forward). El contrato se trabaja en la rama `feat/api-contract`.
- Pendiente: **completar el contrato con los demás endpoints** (siguiente: households) antes de pasar a implementación.

### Decisiones de diseño tomadas hoy (para no re-discutir)

| Decisión                                        | Opción elegida                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Respuestas exitosas                             | **Planas**, sin envelope `{error, data}`, sin repetir `statusCode`         |
| Formato de error                                | Estándar del README: `{ error: { code, message, details } }`               |
| Códigos de `POST /v1/users`                     | `201 Created` / `409 USER_ALREADY_EXISTS` / `422 VALIDATION_ERROR`         |
| Header `Location`                               | En respuesta 201: `Location: /v1/users/{id}`                               |
| Campos _Confirm_ (emailConfirm/passwordConfirm) | Solo **validan** (deben coincidir con su base), NO se persisten            |
| Validación de esquema (Zod)                     | Se documenta **solo en el código** del validador, NO en `API.md`           |
| Middleware de validación                        | **Genérico reutilizable** (`validate(schema)`), no incrustado en cada ruta |
| Ubicación del validador                         | `src/interface/validators/createUserValidator.ts`                          |
| Response de Login / Refresh                     | **Solo tokens**, planos `{ accessToken, refreshToken }`                    |
| Perfil `GET /v1/users/:id`                      | **Simple**: `{ id, email, name }`, solo el propio usuario, sin recursos    |
| Auth: acceso a recurso de otro                  | `403 FORBIDDEN`                                                            |
| Código de error de credenciales inválidas       | `401 INVALID_CREDENTIALS`                                                  |
| Refresh token inválido/expirado                 | `401 INVALID_REFRESH_TOKEN`                                                |
| Código de invitación (`inviteCode`)             | Campo único en `Household`, auto-generado (8 chars criptográficos)         |
| Crear hogar (quién puede)                       | Cualquier usuario autenticado; el creador queda `admin` automáticamente    |
| Unirse a hogar                                 | Por `inviteCode`, sin intervención del admin; el que se une queda `member` |
| `inviteCode` en respuestas                      | Solo visible para `admin` (listar/detalle); el creador lo recibe al crear  |
| Listas de colección                             | Envuelta en clave (`{ "households": [...] }`), NO array raíz (extensible a paginación) |
| Códigos de error Hogares                        | `404 INVALID_INVITE_CODE` (join), `409 ALREADY_MEMBER` (join), `403 FORBIDDEN` (no miembro) |
| Estrategias de división                          | EQUAL, PERCENTAGE, EXACT; se persisten en `Expense.strategy` y `ExpenseSplit.percent`      |
| Crear gasto sin splits                           | EQUAL automático entre todos los miembros actuales                                         |
| Editar/borrar gasto                              | Solo el `paidBy` (creador). `paidBy` no cambia por `PATCH`. Splits en PATCH = reemplazo completo |
| Marcar split pagado                              | `PATCH /v1/expense-splits/:expenseId/:userId`, propio usuario o admin del hogar            |
| Id del split en la API                           | Cada split debe exponer un `id` propio en la respuesta (requiere migración de `ExpenseSplit`) |
| Divisiones parciales (centavos) en EQUAL         | Se reparte el remanente al primer split / sobrante redondeado al primer usuario           |

### Contratos de autenticación documentados (resumen)

- **`POST /v1/users` (201):** body `email/emailConfirm/password/passwordConfirm/name` → `{ email, message }` + `Location`. Errores: `409 USER_ALREADY_EXISTS`, `422 VALIDATION_ERROR`.
- **`POST /v1/auth/login` (200):** body `email/password` → `{ accessToken, refreshToken }`. Errores: `401 INVALID_CREDENTIALS`, `422 VALIDATION_ERROR`.
- **`GET /v1/users/:id` (200):** `{ id, email, name }`. Errores: `403 FORBIDDEN`, `404 NOT_FOUND`, `401 UNAUTHORIZED`, `422 VALIDATION_ERROR`.
- **`POST /v1/auth/refresh` (200):** body `{ refreshToken }` → `{ accessToken, refreshToken }`. Errores: `401 INVALID_REFRESH_TOKEN`, `422 VALIDATION_ERROR`.

## Pendientes / Próximo paso

- [x] **Contrato de autenticación completo** (`POST /v1/users`, `POST /v1/auth/login`, `GET /v1/users/:id`, `POST /v1/auth/refresh`).
- [x] **Contrato de Hogares (Households) en `API.md`** (4 endpoints):
  - `POST /v1/households` — Crear hogar (body `{ name }`, creador queda `admin`, genera `inviteCode`).
  - `POST /v1/households/join` — Unirse con `{ inviteCode }`.
  - `GET /v1/households` — Listar hogares del usuario (con su `role`; `inviteCode` solo si es admin).
  - `GET /v1/households/:id` — Detalle con miembros; `inviteCode` solo si es admin.
- [x] **Contrato de Gastos (Expenses) en `API.md`** (6 endpoints):
  - `POST /v1/households/:householdId/expenses` — Crear gasto (strategy EQUAL/PERCENTAGE/EXACT; sin splits = EQUAL entre todos).
  - `GET /v1/households/:householdId/expenses` — Listar (nuevos primero, sin splits).
  - `GET /v1/expenses/:id` — Detalle con splits.
  - `PATCH /v1/expenses/:id` — Editar cabecera (solo `paidBy`; si envía splits, reemplazo completo).
  - `DELETE /v1/expenses/:id` — Borrar (solo `paidBy`).
  - `PATCH /v1/expense-splits/:expenseId/:userId` — Marcar split pagado/no (propio usuario o admin del hogar).
- [x] **Cambio de esquema Prisma requerido por el contrato:** agregado `inviteCode String @unique` a `Household` + migración `20260904120000_add_invite_code` aplicada (BD vacía, sin conflictos). Cliente regenerado.
- [x] **Esquema de Gastos (soporta el contrato de estrategias):** migración `20260904130000_expense_strategy_and_split_id` aplicada:
  - `Expense`: + `title Text?`, `strategy Text @default("EQUAL")`.
  - `ExpenseSplit`: + `id String @id @default(uuid())` (PK propia), + `percent Int?`, y `@@unique([expenseId, userId])` (antes PK compuesta). BD vacía → cambio de PK sin riesgo.
- [ ] **Módulo de Balances y Liquidaciones — contrato pendiente** en `API.md`: cálculo de deudas, `POST /v1/households/:householdId/settlements`.
- [ ] Hogares que faltan ajustar: gastos, balances, liquidaciones.
- [ ] **Después del contrato:** implementar el flujo completo de **todos** los endpoints, **empezando por `POST /v1/users`** (Registro).

### Flujo de implementación acordado (para `POST /v1/users` como plantilla)

Express route → middleware validate(Zod) → controlador → caso de uso → repositorio Prisma → BD

- Archivo del validador: `src/interface/validators/createUserValidator.ts`.
- Middleware de validación genérico reutilizable (`validate(schema)`), NO incrustado en cada ruta.
- El esquema Zod (mínimos, formato email, coincidencia de confirmaciones) vive solo en el código.

## Decisiones de arquitectura (para no re-discutir)

- ESM nativo (`"type": "module"`) + `module: "nodenext"` → imports relativos con extensión `.js` (`import app from './app.js'`).
- `strict: true` — prohibido `any`.
- Separación `app.ts` (config Express, exportada para tests) vs `server.ts` (bootstrap con `listen`).
- BD en contenedor es solo para dev; producción usará servicio en la nube. Solo cambia la `DATABASE_URL`.
- Logs en español, consistencia con el proyecto.
- Dinero como `Int` en pesos COP (sin decimales).
- IDs como UUID v4.
- Naming de archivos: camelCase para archivos multi-palabra (`expenseSplit.ts`, `householdMember.ts`, `createUserValidator.ts`).
- Interfaces en PascalCase (`ExpenseSplit`, `HouseholdMember`).
- Respuestas de éxito planas; formato de error `{ error: { code, message, details } }`.
- El contrato de API se documenta en `API.md`; los detalles de validación Zod solo en el código.

## Recordatorios

- No versionar: `node_modules/`, `dist/`, `.env`.
- En dev, levantar BD: `docker compose up -d`.
- Para que `docker` funcione en una terminal nueva: reiniciar la terminal (PATH).
