# Plan: Mapa de Pick Ups — React nativo + Supabase, embebido en el Protocolo de Pick Ups

**Fecha:** 2026-05-28
**Estado:** ✅ Completado — PR `feature/mapa-pickups` mergeado a `main`, migración 016 aplicada, seeds corridos (109 pickups · 1743 horarios · bloque insertado en la lección)
**Proyecto:** capacitacion-tm (Módulo 2 — Protocolos y Sistemas)
**Plan análogo de referencia:** `planes/2026-05-27-mapa-recorrido-react-nativo.md` (mismo patrón, ya ejecutado)

---

## Contexto y Justificación

Existe un prototipo funcional de **Mapeo de Pick Ups** hecho como artifact de Claude, en
`salidas/capacitacion-tm/data/mapa pick ups/`:

- `pickups-app.jsx` — app raíz (sidebar con búsqueda, filtros por tipo, selector de excursión,
  switch vendedor/admin, barra de edición con offsets visuales, panel de tweaks).
- `pickups-map.jsx` — mapa Leaflet (3 estilos dark/estándar/satélite, markers por tipo,
  popups con horarios y link a Maps, drag en modo admin).
- `pickups-data.jsx` — datos parseados del Excel: **109 pickups únicos** (`window.PICKUPS`)
  + **27 excursiones** (`window.EXCURSIONES`), cada una con `paradas: [{ pickup_id, hora }]`
  ya deduplicadas y ordenadas por hora.
- `Mapeo Pickups.html` — host HTML (React por CDN) con todo el CSS de markers/popups/sidebar.
- JSON intermedios (`parsed-*.json`, `geocoded-pickups.json`) — no se usan en producción,
  los datos finales están en `pickups-data.jsx`.

El prototipo vive embebido por iframe / standalone. Hay que **portarlo a la app real**
(React Router v7 + Supabase) siguiendo el mismo patrón con el que se migró el mapa de recorrido,
e **integrarlo dentro de la lección "Protocolo de Pick Ups"** del Módulo 2, para que los
vendedores vean el mapa junto al texto del protocolo. Cubre el pendiente registrado en memoria:
*"cargar pick ups en protocolo de pick ups"*.

---

## Alcance

### Incluye
- Migración de los datos del prototipo a Supabase (tablas `pickups` + `pickup_horarios`).
- Seed idempotente que lee credenciales de `.env.local` (NO hardcodeadas).
- Componente React nativo (`PickupsViewer` + `PickupsMapLeaflet` + subcomponentes), Leaflet
  imperativo (NO react-leaflet), SSR-safe.
- Nuevo tipo de **bloque de contenido** `pickups_map` → el mapa se renderiza **embebido dentro
  de la lección "Protocolo de Pick Ups"**, debajo del texto del protocolo (la lección sigue
  siendo `lesson_type = 'generic'`, no se toca el enum).
- **Editor admin con drag**: ruta `/admin/pickups` donde el admin arrastra markers y guarda
  los offsets visuales en Supabase (coordenadas reales se preservan, igual que el prototipo).
- **Vista Agencias** (`/agencia`): el mapa de pick ups también se muestra a las agencias, como
  un acordeón "Mapa de Pick Ups" (read-only), igual que se hizo con el mapa de recorrido.
- Resource route `GET /api/pickups` para cargar los datos lazy desde el cliente.

### NO incluye
- Cambios al enum `lesson_type` (no hacen falta con el enfoque de bloque embebido).
- Control de visibilidad del mapa de pickups desde `/admin/catalogo-agencias` (en v1 el acordeón
  en `/agencia` es fijo; el toggle admin queda como mejora futura — ver Notas).
- Geocodificación nueva — los pickups ya tienen lat/long en `pickups-data.jsx`.
- Vincular `excursion_ref` de los pickups con `excursion_routes` (futuro, si se necesita).
- Soporte del bloque `pickups_map` en el editor visual de admin (palette) — opcional, se inserta
  por script en v1.

---

## Arquitectura / Decisiones Técnicas

### 1. Modelo de datos — migración `supabase/migrations/016_pickups.sql`
Mismo estilo que `015_excursion_routes.sql` (schema `capacitacion_tm`, RLS, grants, touch trigger).

**`capacitacion_tm.pickups`**
| Campo | Tipo | Nota |
|-------|------|------|
| `id` | uuid PK | `gen_random_uuid()` |
| `numero` | int unique not null | el `id` 1..109 del prototipo; matchea paradas en el seed y muestra `#001` |
| `lugar` | text not null | |
| `tipo_pickup` | text not null | hotel\|terminal\|puerto\|comercio\|parador\|punto\|lago\|cerro\|estacion\|centro |
| `activo` | boolean not null default true | |
| `latitude` | double precision not null | coordenada real (no se modifica al editar) |
| `longitude` | double precision not null | |
| `visual_offset_lat` | double precision not null default 0 | lo que mueve el admin con drag |
| `visual_offset_lng` | double precision not null default 0 | |
| `maplink` | text | link a Google Maps |
| `created_at` / `updated_at` | timestamptz | + trigger `touch_updated_at` |

**`capacitacion_tm.pickup_horarios`** (cronograma — flatten de `EXCURSIONES[].paradas`)
| Campo | Tipo | Nota |
|-------|------|------|
| `id` | uuid PK | |
| `pickup_id` | uuid FK → pickups(id) on delete cascade | |
| `excursion_ref` | text not null | el id del prototipo (ej `u8v5nbz4...`), agrupa la excursión |
| `excursion_nombre` | text not null | denormalizado |
| `hora` | text | "12:40" (ordenable como string HH:MM) |

Índices: `pickups(numero)`, `pickup_horarios(pickup_id)`, `pickup_horarios(excursion_ref)`.
**No** se crea tabla de excursiones aparte: el listado de 27 excursiones del selector se deriva
de `pickup_horarios` (distinct `excursion_ref` + `excursion_nombre`).

**RLS** (igual que rutas):
- `select to authenticated` — cualquier rol autenticado puede leer.
- `all to authenticated using is_admin(auth.uid())` — admin escribe (guardar offsets).
- Grants a `service_role` y `authenticated`.

### 2. Backend — `app/lib/pickups.server.ts`
Modelado sobre `excursion-routes.server.ts` (usa `getSupabaseAdmin()`).
- Tipos: `Pickup`, `PickupExcursion { ref; nombre; paradas: { pickup_numero; hora }[] }`,
  `PickupsData { pickups: Pickup[]; excursiones: PickupExcursion[] }`.
- `getPickupsData(): Promise<PickupsData>` — 2 queries (pickups + horarios), agrupa horarios
  → excursiones en JS (sin N+1). Devuelve ambos arrays como espera el viewer.
- `updatePickupOffsets(updates: { numero; offset_lat; offset_lng }[])` — para el editor admin.

### 3. Resource route — `app/routes/api-pickups.tsx`
`GET /api/pickups` → `requireUser(request)` → `getPickupsData()` → JSON con
`Cache-Control: private, max-age=300`. Registrar en `app/routes.ts` junto a `api/excursion-route`.

### 4. Frontend — `app/components/pickups/` (port de los 3 .jsx a TSX)
- `PickupsViewer.tsx` — raíz. SSR-safe (`mounted`), `fetch("/api/pickups")` on mount, estado de
  filtros (search, tipo, activo, excursión), prop `editable` (false alumno / true admin) y
  `onSave`. Lazy-import de `PickupsMapLeaflet`. **Se eliminan del prototipo:** el switch
  vendedor/admin (el rol viene del auth), el wiring de edit-mode por `postMessage` y el panel
  de Tweaks (eran del entorno de artifacts).
- `PickupsMapLeaflet.tsx` — port de `pickups-map.jsx`: `import L from "leaflet"`, markers por
  tipo (divIcon), popups (horarios + coords + offset + link Maps), drag en `editMode` → callback
  `onMove`. Colores `TIPO_COLOR` alineados al tema.
- `PickupsList.tsx`, `PickupExcursionPicker.tsx`, `PickupFilters.tsx`, `PickupsAdminBar.tsx`
  (guardar/descartar) — extraídos de `pickups-app.jsx`.
- `pickups.css` — extraer del `<style>` de `Mapeo Pickups.html` los estilos de
  `.pk-marker/.pk-dot/.pk-popup*` y sidebar; mapear colores hardcodeados → variables CSS
  (`--bg`, `--fg`, `--accent`, `--muted-fg`, `--border`). Importar en `PickupsViewer`.
- Leaflet CSS ya está cargado globalmente en `app/root.tsx` (del mapa de recorrido).

### 5. Bloque de contenido embebido — `pickups_map`
- `app/lib/content-blocks.ts`: agregar `"pickups_map"` a `ContentBlockType`, interface
  `PickupsMapBlock { id; type:"pickups_map"; title?; height? }`, agregar a la union `ContentBlock`
  y helper `emptyPickupsMapBlock()`.
- `_alumno-lesson...$lessonId.tsx` → `LessonBlockRenderer`: caso
  `if (block.type === "pickups_map") return <PickupsViewer editable={false} />` dentro de un
  contenedor con borde (estilo `embedded_app`). Incluir `pickups_map` en la lógica
  `hasEmbeddedApp` (renombrar a `hasWideBlock`) para que use el grid ancho.
- Insertar el bloque en la lección "Protocolo de Pick Ups" (Módulo 2, Bloque 1
  `04c11591-...`) vía script: leer `content_json`, `migrateToNewFormat`, **append** del bloque
  `pickups_map` después del `rich_text`, guardar. (No destruye el texto del protocolo.)

### 6. Editor admin — `app/routes/_admin-pickups._index.tsx`
- Render `<PickupsViewer editable onSave={...} />` full-screen.
- `action` POST con los offsets → `requireUser({ roles:["superadmin","sp","editor"] })` →
  `updatePickupOffsets`. Registrar `route("admin/pickups", ...)` en `app/routes.ts` junto a
  `admin/recorridos`, y agregar link en la navegación admin.

### 7. Seed — `scripts/seed-pickups.mjs`
- **Lee `SUPABASE_URL` + `SUPABASE_SECRET_KEY` de `.env.local`** (no hardcodear — el seed
  de Módulo 2 las tiene expuestas, no repetir ese error).
- Parsea `salidas/capacitacion-tm/data/mapa pick ups/pickups-data.jsx` → extrae `window.PICKUPS`
  y `window.EXCURSIONES`.
- Upsert de 109 pickups por `numero`; reconstruye `pickup_horarios` (delete+insert) resolviendo
  `pickup_id` (numérico) → uuid vía mapa por `numero`. Idempotente.

---

## Tareas

- [x] 1. Crear migración `supabase/migrations/016_pickups.sql` (tablas `pickups` +
  `pickup_horarios`, índices, RLS, grants, trigger). **Aplicar en Supabase → PENDIENTE (Cielo).**
- [x] 2. Crear `scripts/seed-pickups.mjs` (lee `.env.local`, parsea `pickups-data.jsx`, upsert
  idempotente). **Ejecutar → PENDIENTE (tras aplicar la migración).**
- [x] 3. Crear `app/lib/pickups.server.ts` (`getPickupsData`, `updatePickupOffsets` + tipos).
- [x] 4. Crear resource route `app/routes/api-pickups.tsx` y registrarla en `app/routes.ts`.
- [x] 5. Extraer el CSS de markers/popups/sidebar de `Mapeo Pickups.html` →
  `app/components/pickups/pickups.css` (scopeado bajo `.pickups-app`, módulo dark autocontenido).
- [x] 6. Portar `pickups-map.jsx` → `app/components/pickups/PickupsMapLeaflet.tsx`
  (Leaflet imperativo, markers/popups/drag) + `constants.ts` compartido.
- [x] 7. Portar `pickups-app.jsx` → `PickupsViewer.tsx` (subcomponentes internos en el mismo
  archivo, como el prototipo); quitado role-switch / postMessage / Tweaks; fetch `/api/pickups`;
  SSR-safe + lazy Leaflet.
- [x] 8. Agregar tipo de bloque `pickups_map` en `app/lib/content-blocks.ts`
  (type + interface + union + helper).
- [x] 9. Agregar el render de `pickups_map` en `LessonBlockRenderer` y renombrar
  `hasEmbeddedApp` → `hasWideBlock` en `_alumno-lesson...$lessonId.tsx`.
- [x] 10. Crear `scripts/swap-pickup-map-block.mjs` que **reemplaza** el viejo `embedded_app`
  (`/mapeo/Mapeo.html`) por el bloque `pickups_map` (conserva texto + alerts). **Ejecutar →
  PENDIENTE (tras aplicar migración + seed).**
- [x] 11. Crear editor admin `app/routes/_admin-pickups._index.tsx` (PickupsViewer editable +
  action de guardado), ruta registrada y link en nav admin (i18n es/en/pt).
- [x] 12. Integrar en Vista Agencias: acordeón "Mapa de Pick Ups" en
  `app/routes/_agencia._index.tsx` con `<PickupsViewer editable={false} />` (read-only).
- [~] 13. Verificación:
  - [x] `pnpm run typecheck` → **cero errores en código de pickups** (los 6 errores existentes
    son de `_alumno._index.tsx`, archivo no relacionado con cambios sin commitear de otra rama).
  - [ ] Navegador (`pnpm run dev`) → **PENDIENTE** (gated: requiere migración + seeds aplicados):
    - Alumno: lección "Protocolo de Pick Ups" muestra texto + mapa.
    - Admin: `/admin/pickups` arrastra + guarda + persiste.
    - Agencia: `/agencia` muestra el acordeón funcional.

---

## Criterio de Éxito

- En la lección "Protocolo de Pick Ups" (Módulo 2) el vendedor ve, debajo del texto del
  protocolo, el mapa interactivo con los 109 pickups, filtrables por tipo/estado/excursión y
  con búsqueda, popups con horarios y link a Maps.
- El admin puede reposicionar pickups con drag en `/admin/pickups` y los cambios persisten en
  Supabase (las coordenadas reales se preservan; solo cambia el offset visual).
- Las agencias ven el mapa de pick ups en `/agencia` (acordeón read-only) y reusa el mismo
  componente y datos que la vista del alumno.
- Diseño 100% alineado a capacitacion-tm (variables CSS, sin colores hardcodeados).
- Datos cargados desde Supabase (no desde los `.jsx` del prototipo).
- Las demás lecciones `generic` no se ven afectadas (fallback seguro).

---

## Notas / Riesgos

- **Patrón ya probado:** es el mismo enfoque del mapa de recorrido (Leaflet imperativo, lazy +
  Suspense, datos en Supabase, getSupabaseAdmin sin singleton). Reusar decisiones de
  `app/components/recorrido/`.
- **NO usar react-leaflet** — causó "Invalid hook call" por doble React; usar Leaflet directo.
- **Seguridad de credenciales:** el seed nuevo debe leer de `.env.local`. Pendiente histórico
  aparte: la `SERVICE_ROLE_KEY` está expuesta en `scripts/seed-modulo2-protocolos-sistemas.mjs`
  y en el historial git → rotarla en Supabase (fuera del alcance de este plan, pero relacionado).
- **CSS del prototipo:** el `<style>` de `Mapeo Pickups.html` es la parte más fina del port;
  hay que mapear colores a variables del tema y verificar markers/popups en dark y light.
- **Layout embebido:** el mapa es una app de 3 columnas; embebida en una lección hay que usar el
  grid ancho (`hasWideBlock`) y hacerla responsive (apilar en pantallas chicas).
- **Decisión de DB:** se prioriza simplicidad — `pickup_horarios` denormaliza el nombre de la
  excursión; no se enlaza con `excursion_routes`. Si más adelante se quiere "ver recorrido desde
  un pickup", se agrega ese join después.
- **Vista Agencias — mejora futura:** en v1 el acordeón "Mapa de Pick Ups" en `/agencia` es fijo
  (siempre visible para agencias). Si más adelante se quiere que el admin lo prenda/apague desde
  `/admin/catalogo-agencias`, hay que extender `agency_catalog_sections` (hoy las filas referencian
  un `block_id` de catálogo; el mapa no tiene block) con un `section_type` o un `block_id` nullable
  + UI en el admin. Fuera del alcance de v1.
```
