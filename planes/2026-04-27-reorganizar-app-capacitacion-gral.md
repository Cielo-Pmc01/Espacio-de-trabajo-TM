# Plan: Reorganizar App Capacitación General — Estructura Profesional con Next.js

**Creado:** 2026-04-27
**Estado:** En progreso — Pasos 1-2 completados, Pendiente: migración de componentes, API routes, assets
**Pedido:** Reorganizar la app de capacitación general con estructura profesional similar a app-invierno, incluyendo .env, videos, avatar IA, y compatibilidad servidor

---

## Descripción General

### Qué Logra Este Plan

Transformar los archivos sueltos de Claude Design (`platform-*.jsx`, `Capacitacion.html`) en una aplicación Next.js profesional con arquitectura escalable, seguridad (.env), y soporte para videos, avatar Sofía con IA, y múltiples módulos de capacitación.

### Por Qué Importa

La app actual tiene archivos sueltos sin estructura clara, sin manejo de variables de entorno, y sin la arquitectura necesaria para escalar con videos e integraciones IA. Este plan establece las bases para una app de capacitación enterprise-grade.

---

## Estado Actual

### Estructura Existente en `app-capacitacion-gral/`

**Archivos de contenido legacy (desde antes de Claude Design):**
- `README.md` — Documentación del export
- `capacitacion_v4.html` — App anterior (107KB, monolítica)
- `modulo-1-excursiones/` — 18 archivos .md con lecciones
- `modulo-2-protocolos-y-sistemas/` — 16 archivos .md con protocolos
- `modulo-3-desarrollo-area-comercial/` — 2 archivos .md

**Archivos nuevos de Claude Design:**
- `capacitacion-gral/project/Capacitacion.html` — HTML exportado
- `capacitacion-gral/project/platform-*.jsx` — 8 componentes React sueltos
  - `platform-app.jsx` — App principal
  - `platform-views.jsx` — Vistas de módulos
  - `platform-admin.jsx` — Panel admin
  - `platform-admin-content.jsx` — Gestión contenido
  - `platform-admin-ai.jsx` — Configuración IA
  - `platform-avatar.jsx` — Avatar Sofía
  - `platform-data.js` — Datos y configuración
- `capacitacion-gral/project/uploads/` — 21 assets (imágenes/videos)

### Referencia: `app-invierno/` (estructura objetivo)

- Next.js 16 + React 19 + TypeScript + Tailwind CSS
- Estructura: `app/`, `components/`, `lib/`
- Variables de entorno en `.env`
- API Routes organizadas
- Integración Notion + Supabase
- Auth con cookies HMAC

### Brechas que se Abordan

1. ❌ No hay estructura de carpetas profesional (archivos sueltos)
2. ❌ No hay `.env` para datos sensibles
3. ❌ No hay TypeScript (archivos .jsx)
4. ❌ No hay framework (Next.js) para SSR/API Routes
5. ❌ Videos están en `uploads/` sin organización clara
6. ❌ Avatar no tiene integración de voz/IA configurada
7. ❌ No hay sistema de autenticación definido
8. ❌ No hay integración con Notion como base de datos principal

---

## Cambios Propuestos

### Resumen de Cambios

- Migrar de archivos estáticos a Next.js 16 con TypeScript
- Establecer estructura de carpetas profesional (`app/`, `components/`, `lib/`)
- Crear sistema de variables de entorno (`.env` + `.env.example`)
- Organizar assets en `public/` (videos, imágenes, audio avatar)
- Implementar auth básico para vendedores y admin
- Preparar arquitectura para integración IA del avatar (GPT-4 + ElevenLabs)
- **Notion como base de datos principal**: Todo (contenido, usuarios, evaluaciones, progreso) se guarda en Notion. Más simple, una sola fuente de verdad.

### Nuevos Archivos a Crear

| Ruta del Archivo | Propósito |
|-----------------|-----------|
| `salidas/app-capacitacion-gral/.env` | Variables sensibles (API keys, tokens, PINs) |
| `salidas/app-capacitacion-gral/.env.example` | Template de variables para desarrollo |
| `salidas/app-capacitacion-gral/.gitignore` | Excluir node_modules, .env, .next |
| `salidas/app-capacitacion-gral/package.json` | Dependencias (next, react, typescript, tailwind, @notionhq/client) |
| `salidas/app-capacitacion-gral/next.config.ts` | Configuración Next.js |
| `salidas/app-capacitacion-gral/tsconfig.json` | Configuración TypeScript |
| `salidas/app-capacitacion-gral/tailwind.config.ts` | Configuración Tailwind |
| `salidas/app-capacitacion-gral/postcss.config.mjs` | Configuración PostCSS |
| `salidas/app-capacitacion-gral/eslint.config.mjs` | Configuración ESLint |
| `salidas/app-capacitacion-gral/app/layout.tsx` | Layout global con providers |
| `salidas/app-capacitacion-gral/app/page.tsx` | Home / Login vendedores |
| `salidas/app-capacitacion-gral/app/capacitacion/page.tsx` | App principal de capacitación (después de login) |
| `salidas/app-capacitacion-gral/app/admin/page.tsx` | Panel de administración |
| `salidas/app-capacitacion-gral/app/api/auth/login/route.ts` | API: Login vendedores |
| `salidas/app-capacitacion-gral/app/api/auth/logout/route.ts` | API: Logout |
| `salidas/app-capacitacion-gral/app/api/auth/verify/route.ts` | API: Verificar sesión |
| `salidas/app-capacitacion-gral/app/api/evaluations/route.ts` | API: Enviar/recibir evaluaciones |
| `salidas/app-capacitacion-gral/app/api/avatar/chat/route.ts` | API: Chat con avatar IA |
| `salidas/app-capacitacion-gral/components/training-app.tsx` | App principal de capacitación (migrado de platform-app.jsx) |
| `salidas/app-capacitacion-gral/components/module-viewer.tsx` | Visualizador de módulos (migrado de platform-views.jsx) |
| `salidas/app-capacitacion-gral/components/avatar-sofia.tsx` | Avatar Sofía con IA (migrado de platform-avatar.jsx) |
| `salidas/app-capacitacion-gral/components/admin-panel.tsx` | Panel admin (migrado de platform-admin.jsx) |
| `salidas/app-capacitacion-gral/components/login-form.tsx` | Formulario login vendedores |
| `salidas/app-capacitacion-gral/lib/server/config.ts` | Configuración server-side (env vars) |
| `salidas/app-capacitacion-gral/lib/server/notion-client.ts` | Cliente Notion API |
| `salidas/app-capacitacion-gral/lib/server/notion-database.ts` | Funciones CRUD para Notion como base de datos |
| `salidas/app-capacitacion-gral/lib/server/auth-session.ts` | Gestión de sesiones (cookies HMAC) |
| `salidas/app-capacitacion-gral/lib/training-types.ts` | Tipos TypeScript globales |
| `salidas/app-capacitacion-gral/lib/utils.ts` | Utilidades client-side |
| `salidas/app-capacitacion-gral/public/videos/` | Videos de capacitación |
| `salidas/app-capacitacion-gral/public/images/` | Imágenes y assets |
| `salidas/app-capacitacion-gral/public/avatar/` | Assets del avatar (audio, sprites) |
| `salidas/app-capacitacion-gral/README.md` | Documentación actualizada (reemplazar existente) |

### Archivos a Modificar

| Ruta del Archivo | Cambios |
|-----------------|---------|
| `salidas/app-capacitacion-gral/capacitacion_v4.html` | Migrar funcionalidad a componentes React, luego eliminar |
| `salidas/app-capacitacion-gral/modulo-1-excursiones/*.md` | Crear script para migrar a Notion o JSON |
| `salidas/app-capacitacion-gral/modulo-2-protocolos-y-sistemas/*.md` | Crear script para migrar a Notion o JSON |
| `CLAUDE.md` | Agregar referencia a nueva estructura |
| `contexto/proyectos.md` | Actualizar estado: "estructura Next.js implementada" |

### Archivos a Eliminar (después de migrar)

| Archivo | Razón |
|---------|-------|
| `capacitacion-gral/project/Capacitacion.html` | Reemplazado por app Next.js |
| `capacitacion-gral/project/platform-*.jsx` | Migrados a components/ con TypeScript |
| `capacitacion-gral/project/platform-data.js` | Migrado a lib/config.ts y tipos |
| `capacitacion_v4.html` | Obsoleto después de migrar funcionalidad |

---

## Decisiones de Diseño

### Decisiones Clave

1. **Mantener Next.js 16 (App Router)**: Consistencia con `app-invierno`, SSR para SEO/auth, API Routes integradas.

2. **TypeScript obligatorio**: Tipado seguro para escalabilidad, especialmente con la complejidad del avatar IA.

3. **Variables de entorno centralizadas en `lib/server/config.ts`**: Un único punto de acceso para todas las env vars, con validación en runtime.

4. **Auth con cookies HMAC (sin librería externa)**: Mismo patrón que `app-invierno` para consistencia y simplicidad.

5. **Assets en `public/`**: Videos, imágenes y audio del avatar servidos estáticamente, organizados por tipo.

6. **Migración gradual de contenido .md**: Los módulos existentes en .md se migrarán a Notion (como app-invierno) o se convertirán a JSON/MDX según complejidad.

7. **Avatar Sofía como componente aislado**: `avatar-sofia.tsx` maneja todo: visualización, síntesis de voz, chat IA, estado de animación.

### Alternativas Consideradas

- **Quedar en HTML estático**: Descartado. No permite .env seguro, SSR, ni API Routes necesarias para el avatar IA.
- **Usar Vite en lugar de Next.js**: Descartado. Next.js ofrece más valor para este caso de uso (SSR, API Routes, integración Notion ya probada en app-invierno).
- **Auth con NextAuth.js**: Descartado. Para el alcance actual (PIN simple para admin, login básico vendedores), HMAC manual es suficiente y evita dependencias.

### Decisiones Resueltas ✅

1. **IA para avatar**: OpenAI GPT-4 (chat) + ElevenLabs (voz)
2. **Videos**: Archivos existen en `uploads/` pero no están producidos finalmente → organizar en `public/videos/` y reemplazar luego
3. **Drag & drop Módulo 2**: **PENDIENTE** — decidir si reparar, reemplazar por quiz tradicional, o eliminar
4. **Base de datos**: **Notion como base de datos principal** para TODO (contenido, usuarios, evaluaciones, progreso) — no usar Supabase
5. **Estructura Notion**: 4 bases de datos separadas en Notion:
   - `Content`: Contenido de módulos
   - `Users`: Vendedores y credenciales
   - `Evaluations`: Resultados de evaluaciones
   - `Progress`: Progreso por vendedor/módulo

---

## Tareas Paso a Paso

### Paso 1: Setup inicial de proyecto Next.js

**Descripción:** Crear estructura base de Next.js 16 con TypeScript y Tailwind.

**Acciones:**
- Crear `package.json` con dependencias
- Crear `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Crear `.gitignore` y `.env.example`
- Instalar dependencias (comando: `npm install`)

**Archivos afectados:**
- Nuevos: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`

---

### Paso 2: Configuración de variables de entorno

**Descripción:** Establecer sistema de configuración segura.

**Acciones:**
- Crear `lib/server/config.ts` con validación de env vars
- Crear `.env` (no commiteado) con placeholders
- Crear `.env.example` con todas las variables documentadas
- Variables necesarias: `NOTION_TOKEN`, `NOTION_DATABASE_CONTENT_ID`, `NOTION_DATABASE_USERS_ID`, `NOTION_DATABASE_EVALUATIONS_ID`, `NOTION_DATABASE_PROGRESS_ID`, `ADMIN_PIN`, `AVATAR_OPENAI_API_KEY`, `AVATAR_ELEVENLABS_API_KEY`, `N8N_WEBHOOK_URL`

**Archivos afectados:**
- Nuevos: `lib/server/config.ts`, `.env`, `.env.example`

```dotenv
NOTION_TOKEN=tu_token_de_notion
NOTION_DATABASE_CONTENT_ID=id_base_contenido
NOTION_DATABASE_USERS_ID=id_base_usuarios
NOTION_DATABASE_EVALUATIONS_ID=id_base_evaluaciones
NOTION_DATABASE_PROGRESS_ID=id_base_progreso
ADMIN_PIN=pin_admin
AVATAR_OPENAI_API_KEY=sk_...
AVATAR_ELEVENLABS_API_KEY=sk_...
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/...
```

### Paso 3: Organizar assets públicos

**Descripción:** Mover y organizar videos, imágenes y assets del avatar.

**Acciones:**
- Crear `public/videos/`, `public/images/`, `public/avatar/`
- Mover contenido de `capacitacion-gral/project/uploads/` a `public/`
- Organizar por módulos: `public/videos/modulo-1/`, `public/videos/modulo-2/`, etc.
- Verificar que los videos tengan formatos compatibles (mp4, webm)

**Archivos afectados:**
- Nuevos directorios en `public/`
- Movidos desde `capacitacion-gral/project/uploads/`

---

### Paso 4: Migrar componentes principales (JSX → TSX)

**Descripción:** Convertir archivos .jsx de Claude Design a componentes TypeScript.

**Acciones:**
- Migrar `platform-app.jsx` → `components/training-app.tsx`
- Migrar `platform-views.jsx` → `components/module-viewer.tsx`
- Migrar `platform-avatar.jsx` → `components/avatar-sofia.tsx`
- Migrar `platform-admin.jsx` → `components/admin-panel.tsx`
- Agregar tipos TypeScript en `lib/training-types.ts`
- Refactorizar imports y dependencias

**Archivos afectados:**
- Nuevos: `components/training-app.tsx`, `components/module-viewer.tsx`, `components/avatar-sofia.tsx`, `components/admin-panel.tsx`, `lib/training-types.ts`
- Referencia: `capacitacion-gral/project/platform-*.jsx`

---

### Paso 5: Crear páginas principales

**Descripción:** Estructurar rutas de la aplicación.

**Acciones:**
- Crear `app/layout.tsx` con layout global, metadatos, fonts
- Crear `app/page.tsx` como landing/login
- Crear `app/capacitacion/page.tsx` para la app principal
- Crear `app/admin/page.tsx` para panel admin
- Crear `app/layout.tsx` con providers si son necesarios

**Archivos afectados:**
- Nuevos: `app/layout.tsx`, `app/page.tsx`, `app/capacitacion/page.tsx`, `app/admin/page.tsx`

---

### Paso 6: Implementar sistema de autenticación

**Descripción:** Auth básico para vendedores y admin.

**Acciones:**
- Crear `lib/server/auth-session.ts` con cookies HMAC
- Crear `app/api/auth/login/route.ts` para vendedores
- Crear `app/api/auth/logout/route.ts`
- Crear `app/api/auth/verify/route.ts`
- Crear `components/login-form.tsx` con UI
- Crear middleware o guard para rutas protegidas

**Archivos afectados:**
- Nuevos: `lib/server/auth-session.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/verify/route.ts`, `components/login-form.tsx`

---

### Paso 7: Preparar API Routes para evaluaciones y avatar

**Descripción:** Endpoints backend para funcionalidades clave.

**Acciones:**
- Crear `app/api/evaluations/route.ts` (POST/GET evaluaciones)
- Crear `app/api/avatar/chat/route.ts` (POST mensajes al avatar IA)
- Preparar integración con Notion para guardar evaluaciones (como base de datos)
- Preparar estructura para webhook n8n

**Archivos afectados:**
- Nuevos: `app/api/evaluations/route.ts`, `app/api/avatar/chat/route.ts`, `lib/server/notion-client.ts`

---

### Paso 8: Integración con Notion (opcional para esta fase)

**Descripción:** Preparar cliente Notion como en app-invierno.

**Acciones:**
- Crear `lib/server/notion-client.ts`
- Crear tipos para contenido de Notion
- Preparar fetchers para módulos (si se usa Notion como CMS)

**Archivos afectados:**
- Nuevos: `lib/server/notion-client.ts`

---

### Paso 9: Limpiar archivos legacy

**Descripción:** Eliminar archivos obsoletos después de migrar.

**Acciones:**
- Eliminar `capacitacion_v4.html` (ya migrado)
- Eliminar `capacitacion-gral/project/*.html` (ya migrado)
- Mantener `modulo-*/` por ahora (migrar contenido después)
- Actualizar `README.md` con nueva documentación

**Archivos afectados:**
- Eliminados: `capacitacion_v4.html`, `capacitacion-gral/project/Capacitacion.html`
- Modificado: `README.md`

---

### Paso 10: Documentación y README

**Descripción:** Crear documentación clara para futuro desarrollo.

**Acciones:**
- Reemplazar `README.md` con documentación completa
- Incluir: stack, estructura, variables de entorno, comandos, arquitectura
- Crear `AGENTS.md` si es necesario para Claude Code
- Documentar cómo agregar nuevos módulos o videos

**Archivos afectados:**
- Modificado: `README.md`
- Nuevo: `AGENTS.md` (opcional)

---

## Conexiones y Dependencias

### Archivos que Referencian Esta Área

- `contexto/proyectos.md` — lista app-capacitacion-gral como en desarrollo
- `CLAUDE.md` — menciona app-capacitacion-gral en estructura
- `datos-actuales.md` — tiene estado detallado de la app

### Actualizaciones Necesarias para Consistencia

- `contexto/proyectos.md`: Actualizar estado a "estructura Next.js implementada, pendiente integración IA"
- `datos-actuales.md`: Actualizar checklist de la app (drag & drop, Notion, avatar, deploy)
- `CLAUDE.md`: Verificar que estructura documentada sea correcta

### Impacto en Flujos de Trabajo Existentes

- Nuevo comando potencial: `/capacitacion` para operaciones específicas de la app
- Los workflows existentes (`/iniciar`, `/crear-plan`, `/implementar`) se usan para esta migración

---

## Lista de Validación

- [ ] Proyecto Next.js inicia sin errores (`npm run dev`)
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] ESLint pasa (`npm run lint`)
- [ ] `.env` carga correctamente (no expuesto en código)
- [ ] Assets en `public/` son accesibles (videos, imágenes)
- [ ] Componentes migrados renderizan correctamente
- [ ] Auth funciona (login/logout/sesión)
- [ ] Rutas protegidas redirigen si no hay sesión
- [ ] API Routes responden correctamente
- [ ] README documenta cómo agregar nuevos módulos
- [ ] Archivos legacy eliminados

---

## Criterios de Éxito

1. La app inicia localmente sin errores y muestra el login
2. Un vendedor puede loguearse, ver módulos y navegar
3. El admin puede acceder al panel de administración
4. Los videos cargan y reproducen correctamente
5. La estructura de carpetas permite agregar fácilmente nuevos módulos
6. Las variables de entorno funcionan en local y están preparadas para servidor
7. El código está en TypeScript con tipos definidos
8. Cualquier IA puede leer el README y entender cómo continuar

---

## Notas

- **Pregunta abierta crítica**: Resolver drag & drop del Módulo 2 antes de migrar componentes (Paso 4).
- **Videos**: Organizar en `public/videos/modulo-1/`, `public/videos/modulo-2/`, etc. Reemplazar cuando estén producidos finalmente.
- **Avatar**: Implementar con GPT-4 para chat y ElevenLabs para voz. Integración paso a paso.
- **Notion como BD**: Crear 4 bases de datos en Notion con estructura definida. Migración contenido .md en fase 2.
- **Compatibilidad servidor**: Next.js compatible con Vercel, servidor propio Node.js, o Docker.
