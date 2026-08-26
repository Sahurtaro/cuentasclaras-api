# Cuentas Claras API — Checkpoint de Desarrollo

> Estado guardado al **26 de agosto de 2026**. Este archivo documenta el avance para poder retomar el trabajo en otra sesión.

## Fase actual

**Fase 1: Setup y Base de Datos** — completada.

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
- `src/app.ts`: instancia Express + `app.use(express.json())`, export default.
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

## Pendientes / Próximo paso

- [ ] Luego: Fase 2 (dominio + manejo de errores), Fase 3 (auth)...

## Decisiones de arquitectura (para no re-discutir)

- ESM nativo (`"type": "module"`) + `module: "nodenext"` → imports relativos con extensión `.js` (`import app from './app.js'`).
- `strict: true` — prohibido `any`.
- Separación `app.ts` (config Express, exportada para tests) vs `server.ts` (bootstrap con `listen`).
- BD en contenedor es solo para dev; producción usará servicio en la nube. Solo cambia la `DATABASE_URL`.
- Logs en español, consistencia con el proyecto.
- Dinero como `Int` en pesos COP (sin decimales).
- IDs como UUID v4.

## Recordatorios

- No versionar: `node_modules/`, `dist/`, `.env`.
- En dev, levantar BD: `docker compose up -d`.
- Para que `docker` funcione en una terminal nueva: reiniciar la terminal (PATH).
