# Plan — Fase 1: Bootstrap de `capacitacion-tm`

> **Proyecto:** Plataforma de Capacitación TM (rediseño total de `app-capacitacion-gral`)
> **PRD fuente:** [planes/2026-05-14-prd-plataforma-capacitacion.md](2026-05-14-prd-plataforma-capacitacion.md) — leer antes de cualquier paso
> **Fecha:** 2026-05-14
> **Owner:** Cielo · Ejecutor: Claude Code
> **Resultado esperado:** un repo navegable con auth real, roles, sectores y dos layouts base (alumno + admin). Sin contenido cargado todavía. Demo en local con `npm run dev`.

---

## Pre-flight (no romper nada existente)

Antes de tocar cualquier cosa:

- [ ] **NO** modificar `salidas/app-invierno/` ni nada que esté en producción.
- [ ] **NO** modificar `salidas/app-capacitacion-gral/` — sigue activa hasta que la nueva la reemplace.
- [ ] El proyecto Supabase es **compartido** con app-invierno. **NO crear, modificar ni renombrar la tabla `evaluaciones`** ni cualquier tabla que app-invierno consuma.
- [ ] Todo el trabajo de la nueva plataforma vive en un **schema propio** de Postgres llamado `capacitacion_tm` (no `public`).
- [ ] Crear rama Git nueva: `feature/capacitacion-tm-fase-1` antes del primer commit.

---

## Decisiones técnicas resueltas

| Tema | Decisión |
|------|----------|
| Framework | **React Router v7** en modo framework (ex-Remix). |
| Package manager | **pnpm** (más rápido y consistente entre devs). Si Cielo no lo tiene instalado, lo instalamos en este paso. |
| Lenguaje | TypeScript `strict: true`. |
| Estilos | Tailwind v4 (CSS-first, sin tailwind.config.js). |
| Componentes | shadcn/ui sobre Radix. |
| Editor rico | Tiptap (se instala en Fase 2, no Fase 1). |
| Auth + DB | Supabase (proyecto compartido con app-invierno) — schema `capacitacion_tm`. |
| Variables de entorno | `.env.local` (gitignored), `.env.example` (commited). |
| Linter | ESLint + Prettier. |
| Hosting eventual | Servidor empresa (Hostinger VPS). Build estático/SSR via Node + reverse proxy. Se resuelve en Fase 7. |

---

## Estructura objetivo del repo

```
salidas/capacitacion-tm/
├── app/                          # React Router v7 (carpeta de routes)
│   ├── root.tsx                  # Layout raíz (HTML, providers, tema)
│   ├── routes/
│   │   ├── _auth.login.tsx       # Login (sin layout)
│   │   ├── _alumno.tsx           # Layout grupo Alumno
│   │   ├── _alumno._index.tsx    # Home alumno
│   │   ├── _admin.tsx            # Layout grupo Admin/SP/SuperAdmin
│   │   ├── _admin._index.tsx     # Dashboard admin
│   │   └── ...                   # se llenan en fases siguientes
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── layout/               # Sidebar, Topbar, Breadcrumb
│   │   ├── theme/                # ThemeProvider, ThemeSwitcher
│   │   └── i18n/                 # LanguageProvider, useTranslation
│   ├── lib/
│   │   ├── supabase.server.ts    # cliente server (service role)
│   │   ├── supabase.client.ts    # cliente browser (anon key)
│   │   ├── auth.server.ts        # sessions, roles, sectores
│   │   ├── i18n.server.ts        # carga de traducciones
│   │   └── env.server.ts         # validación env vars (Zod)
│   └── styles/
│       ├── app.css               # Tailwind v4 + tema base
│       └── themes/               # paletas (clasica, azul, amarillo)
├── public/
│   ├── manifest.json             # PWA
│   ├── icons/                    # iconos PWA
│   └── locales/                  # JSONs de traducción (es, pt, en)
├── supabase/
│   ├── migrations/               # SQL versionado
│   │   └── 001_init_capacitacion_tm.sql
│   └── seed.sql                  # datos de prueba (3 users de cada rol)
├── .env.example
├── .env.local                    # gitignored
├── .eslintrc.json
├── .prettierrc
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Tareas de la Fase 1

### Tarea 1 — Crear repo y bootstrap inicial
- [ ] Crear carpeta `salidas/capacitacion-tm/`.
- [ ] Ejecutar `pnpm create react-router@latest capacitacion-tm` o equivalente con flags TypeScript.
- [ ] Init Git, primer commit "chore: bootstrap react-router v7".
- [ ] Crear rama `feature/capacitacion-tm-fase-1`.

### Tarea 2 — Instalar dependencias base
- [ ] `pnpm add @supabase/supabase-js zod` (Zod para validar env y formularios).
- [ ] `pnpm add -D tailwindcss@next @tailwindcss/vite postcss` (Tailwind v4).
- [ ] Configurar `vite.config.ts` con plugin de Tailwind v4 y plugin de React Router.
- [ ] Setup base de `app/styles/app.css` con `@import "tailwindcss";` y variables CSS de tema.

### Tarea 3 — shadcn/ui setup
- [ ] `pnpm dlx shadcn@latest init` (o equivalente para v4).
- [ ] Instalar componentes base: `button`, `input`, `card`, `dialog`, `dropdown-menu`, `sheet`, `tabs`, `select`, `toast`, `avatar`.
- [ ] Verificar que `Lucide` queda como dep.
- [ ] Instalar `framer-motion`.

### Tarea 4 — Sistema de temas
- [ ] Crear 3 archivos en `app/styles/themes/`: `clasica.css`, `azul.css`, `amarillo.css`.
- [ ] Cada uno define CSS variables `--bg`, `--fg`, `--accent`, `--muted`, `--border`, etc. para light y dark.
- [ ] Crear `ThemeProvider` (Context React) que lee preferencia del usuario de localStorage o sistema.
- [ ] Crear `ThemeSwitcher` (componente con dropdown: tema + modo claro/oscuro).
- [ ] Persistir elección en Supabase columna `users.theme_preference` (jsonb) cuando hay sesión.

### Tarea 5 — i18n setup
- [ ] Instalar `i18next` + `react-i18next` (o equivalente liviano).
- [ ] Estructura `public/locales/{es,pt,en}/common.json` con keys básicas.
- [ ] `LanguageProvider` con default `es-AR`.
- [ ] Helper `t('key')` para usar en componentes.
- [ ] Cero strings hardcoded en componentes nuevos (lint rule eventualmente).

### Tarea 6 — Supabase schema inicial
- [ ] Conectarse al proyecto Supabase existente (usar mismas credenciales que app-invierno, agregar a `.env.local`).
- [ ] Crear schema dedicado: `CREATE SCHEMA capacitacion_tm;`.
- [ ] Migración `001_init_capacitacion_tm.sql` con las tablas mínimas para Fase 1:
  - `capacitacion_tm.users` (id, email, role, sector, full_name, theme_preference, language, created_at)
  - `capacitacion_tm.sectors` (code, name, description) — seed con B1, VR, VP
  - `capacitacion_tm.audit_log` (id, who, action, payload, created_at)
- [ ] Tablas de contenido (categories, modules, blocks, lessons, etc.) se crean en Fase 2.
- [ ] RLS habilitada en todas las tablas. Policies básicas:
  - `users`: cada usuario lee su propio row, SuperAdmin lee todos.
  - `audit_log`: solo SuperAdmin y SP leen.
- [ ] Vincular auth de Supabase: cuando alguien se registra, trigger crea row en `capacitacion_tm.users`.

### Tarea 7 — Auth (login + sesión)
- [ ] Página `/login` con email + password (Supabase Auth).
- [ ] Sin signup público — usuarios los crea SuperAdmin (en Fase 2 hacemos la UI; en Fase 1 los crea Cielo desde Supabase Studio o por SQL).
- [ ] Loader/action de root carga sesión y la pone en contexto.
- [ ] Helper `requireUser(roles?: Role[])` para rutas protegidas.
- [ ] Logout en menú de avatar.

### Tarea 8 — Roles y layouts
- [ ] Definir tipo `Role = 'alumno' | 'editor' | 'sp' | 'superadmin'`.
- [ ] Definir tipo `Sector = 'B1' | 'VR' | 'VP'` (solo aplica si role === 'alumno').
- [ ] Crear layout `_alumno.tsx`:
  - Topbar mínimo (logo + breadcrumb + avatar)
  - Sin sidebar de árbol — vista limpia (decisión del PRD §6.bis.2)
  - Botón flotante Sofía abajo a la derecha (placeholder click → toast "Próximamente")
- [ ] Crear layout `_admin.tsx`:
  - Topbar (logo + buscador + avatar)
  - Sidebar izquierdo con: Inicio, Cursos, Usuarios, IA, Analíticas, Configuración
  - Acepta roles `editor`, `sp`, `superadmin` (Alumno no entra acá)
- [ ] Home placeholder en cada uno con texto "Fase 1 OK — esperando Fase 2".

### Tarea 9 — Seeds de prueba
- [ ] `supabase/seed.sql` con:
  - 1 SuperAdmin (Cielo)
  - 1 SP (placeholder)
  - 1 Editor
  - 3 Alumnos (uno de cada sector B1, VR, VP)
- [ ] Documentar credenciales en `README.md` (solo locales, contraseñas obvias tipo `demo1234`).

### Tarea 10 — PWA mínima
- [ ] `public/manifest.json` con nombre, iconos, colores de tema.
- [ ] Service worker básico (cache shell). Plugin Vite o manual.
- [ ] Iconos en `public/icons/` (placeholders por ahora).
- [ ] Verificar "Install app" en Chrome funciona.

### Tarea 11 — Linter, formatter, scripts
- [ ] ESLint config heredando de React Router defaults + reglas básicas.
- [ ] Prettier config con `printWidth: 100`.
- [ ] Scripts en `package.json`: `dev`, `build`, `start`, `lint`, `format`, `typecheck`.
- [ ] Pre-commit hook con `lint-staged` (formato automático).

### Tarea 12 — Documentación
- [ ] `README.md` con:
  - Cómo levantar el repo local
  - Variables de entorno requeridas (referencia a `.env.example`)
  - Cómo correr migraciones Supabase
  - Comandos disponibles
  - Decisiones técnicas con link al PRD
- [ ] `.env.example` con todas las claves vacías y comentarios.

### Tarea 13 — Push + reportar
- [ ] Commit final: "feat(fase-1): bootstrap completo con auth, roles, layouts base, temas e i18n".
- [ ] Crear repo en GitHub (nombre sugerido: `iadventurecenter01/capacitacion-tm`).
- [ ] Push de la rama `feature/capacitacion-tm-fase-1`.
- [ ] **Reportar a Cielo el link del PR**, NO mergear a main directo (protocolo del workspace).
- [ ] Cielo aprueba y mergea.

---

## Variables de Entorno Requeridas

```
# Supabase (mismo proyecto que app-invierno)
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Schema dedicado (ya creado en la migración)
SUPABASE_SCHEMA=capacitacion_tm

# Session
SESSION_SECRET=

# IA — se completan en fases siguientes
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Notion — se completa en Fase 4
NOTION_TOKEN=
NOTION_DATABASE_ID_EVALUACIONES=
```

---

## Criterios de aceptación de Fase 1

Para que esta fase se considere completa, todo esto debe funcionar:

1. ✅ `pnpm install && pnpm dev` levanta la app en `localhost:5173` sin errores.
2. ✅ Login con email/password funciona contra Supabase.
3. ✅ Logout funciona y limpia la sesión.
4. ✅ Si Alumno entra a una ruta admin, se le redirige a su home con un toast "Acceso denegado".
5. ✅ Si SuperAdmin/SP/Editor entran a la ruta de Alumno, se les redirige al admin.
6. ✅ El selector de tema en el avatar cambia paleta y modo (claro/oscuro) y persiste tras refresh.
7. ✅ Cambio de idioma (en el avatar) recarga UI en el idioma elegido (probar `es` y `pt`).
8. ✅ Schema `capacitacion_tm` existe en Supabase y RLS está activa.
9. ✅ Botón flotante de Sofía aparece en la vista del alumno (con tooltip "Consultame tus dudas") aunque sin funcionalidad real.
10. ✅ La app se puede instalar como PWA en Chrome.

---

## Lo que NO se hace en Fase 1 (queda para fases siguientes)

- ❌ Editor de contenido (Fase 2).
- ❌ Schemas tipados (Excursión, Proveedor, Protocolo) (Fase 2).
- ❌ Vista de módulo / bloque con contenido real (Fase 3).
- ❌ Motor de evaluaciones (Fase 4).
- ❌ IA Admin para cargar contenido (Fase 5).
- ❌ Sofía IA RAG funcional (Fase 6).
- ❌ Integración Notion para reportes (parte de Fase 4-6).
- ❌ Tour guiado de onboarding (Fase 7 — pulido).

---

## Estimación

- **Tiempo:** 2-3 días de trabajo enfocado.
- **Sesiones de Claude Code:** ~3-4 sesiones (cortar entre Tarea 6 y 7 si se hace pesado).

---

## Próximo paso después de Fase 1

Crear plan `planes/2026-MM-DD-fase-2-editor-contenido.md` con el detalle del editor genérico + schemas tipados.

---

_Plan vivo. Cualquier ajuste se versiona acá._
