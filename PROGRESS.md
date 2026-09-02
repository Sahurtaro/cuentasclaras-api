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

- Se creó `API.md` en la raíz con el contrato del primer endpoint: **`POST /v1/users`** (Registro).
- Se decidió **documentar el contrato completo ANTES de implementar endpoints**, para tener una base probada y consistente.
- El contrato usa **respuestas planas** (sin envelope `{error, data}`, sin repetir `statusCode` en el body).

## Trabajo de hoy (2 de septiembre de 2026)

- Definida la decisión de **empezar por el contrato de API** antes que por la implementación de endpoints, para validar formato de respuestas, errores y arquitectura sobre una base sólida.
- Creado y revisado `API.md` con el endpoint `POST /v1/users`. Se evaluó el uso de bloques preformateados (code blocks) pero se **descartó**: se prefiere el formato plano para legibilidad.
- Pendiente: **completar el contrato con los demás endpoints** antes de pasar a implementación.

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

### Contrato del endpoint `POST /v1/users` (resumen)

**Request body:** `email`, `emailConfirm`, `password`, `passwordConfirm`, `name`.
**Response 201:** plano `{ email, message }` + header `Location: /v1/users/{id}`.
**Errores:** `409 USER_ALREADY_EXISTS` y `422 VALIDATION_ERROR` (formato `{ error: {...} }`).

## Pendientes / Próximo paso

- [ ] **Terminar el contrato de API** en `API.md` añadiendo los demás endpoints (candidatos, por decidir/ajustar):
  - Auth: Login, Refresh Token.
  - Usuarios: GET `/v1/users/:id`.
  - Hogares: crear, unirse por `inviteCode`, listar, detalle.
  - Gastos: crear (split EQUAL / PERCENTAGE / EXACT), listar por hogar.
  - Balances: cálculo de deudas (`balance.service.ts`).
  - Liquidaciones: registro de `Settlements`.
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
