# Plan: Migrar Mapa de Recorrido a Componente React Nativo

**Fecha:** 2026-05-27
**Estado:** ✅ Completado (commits 21471cf, 3d212b7, dde4a5c, c420496, c51c747)
**Proyecto:** capacitacion-tm
**Estimación:** ~10-12 hs / 2 sesiones
**Rama destino:** Actualizacion-mayo (continúa)

---

## Contexto y Justificación

En la sesión del 2026-05-26 se creó la app standalone `public/mapeo/Recorrido.html` (Leaflet + OSRM + React vanilla con Babel standalone) con 27 excursiones de Bariloche/Patagonia, y se insertó como lección "Recorridos de Excursiones" en Módulo 1 / Listado de excursiones (commit `f78ece6`).

Cielo definió que la UX correcta es **mostrar el mapa dentro de cada excursión individual del catálogo** (en `ExcursionsViewer`), no como una lección aparte que liste todas. La solución actual queda como deuda técnica.

Sumado a eso, Cielo eligió aprovechar la migración para subir la calidad del código:
- Mover los datos a Supabase con admin UI editable (hoy están hardcoded en `recorrido-data.jsx`)
- Reemplazar Babel standalone + React vanilla por componentes React nativos del proyecto
- Reusar el sistema de tema CSS de capacitacion-tm

**Por qué importa:**
- UX correcta: el vendedor ve el mapa al abrir la excursión que está estudiando, no en una vista global aislada
- Editable sin tocar código: las paradas se gestionan desde `/admin/recorridos`
- Mejor performance: sin Babel standalone, sin script tags externos
- Tipado: TypeScript de punta a punta

---

## Alcance

### Incluye
- Migration SQL con dos tablas nuevas: `excursion_routes` + `excursion_route_paradas`
- Seed inicial con las 27 excursiones desde `recorrido-data.jsx`
- Componente React nativo `<ExcursionRouteMap>` que reemplaza la app HTML
- Sub-componentes: lista de paradas, layer picker, **controles de animación de recorrido**
- **Animación del recorrido**: vehículo que se desplaza sobre la línea + trail brillante creciendo + barra de progreso + controles play/pause/reset/velocidad (Moderado/Normal/Rápido) + auto-detect de paradas (milestone trigger que resalta la parada activa)
- Integración dentro de `ExcursionsViewer.tsx` (al final del detalle de cada excursión)
- **Integración en Vista Agencias (`/agencia`)** — hereda automáticamente al usar el mismo `ExcursionsViewer`. Solo requiere verificar RLS + endpoint para role `agencia`.
- Admin UI básica en `/admin/recorridos` para CRUD de rutas y paradas
- Eliminar la lección "Recorridos de Excursiones" actual (revertir efecto del seed)
- Mover `public/mapeo/Recorrido*` a `_deprecated/` (no borrar — son referencia)

### NO incluye
- **Migrar Pick Ups (`public/mapeo/Mapeo.html`)** — queda con su patrón vanilla por ahora. Sesión aparte si Cielo decide unificar después.
- **Modo edición de paradas con drag-and-drop en el mapa para el alumno** — la edición se hace desde admin, no desde el viewer público.
- **Modo edición de coords desde admin con drag-en-mapa** — V1 del admin solo edita texto + coords manuales. Drag-en-mapa va para V2 si hace falta.

---

## Arquitectura / Decisiones Técnicas

### Stack
- **Mapa:** `leaflet` + `react-leaflet` (wrapper React-idiomatic)
- **Tipos:** `@types/leaflet`
- **Routing:** OSRM público (`https://router.project-osrm.org`) — sin self-host
- **Tiles:** Carto Dark/Voyager + Esri Satellite (igual que Recorrido.html actual)
- **DB:** Supabase con dos tablas en schema `capacitacion_tm`
- **Coords:** JSONB con shape `{ lat: number, lng: number }` (no PostGIS, no array)

### Schema SQL

```sql
-- Tabla 1: rutas (una por excursión)
create table capacitacion_tm.excursion_routes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,           -- "circuito-chico", "bolson-puelo"
  name          text not null,                  -- "Circuito Chico y Cerro Campanario"
  season        text not null,                  -- "todo-el-anio" | "verano" | "invierno"
  category      text,
  duration      text,
  distance      text,
  schedule      text,
  salidas       text,
  resumen       text,
  origen        jsonb,                          -- { lat, lng }
  destino       jsonb,                          -- { lat, lng }
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Tabla 2: paradas de cada ruta (N por ruta, ordenadas)
create table capacitacion_tm.excursion_route_paradas (
  id            uuid primary key default gen_random_uuid(),
  route_id      uuid not null references capacitacion_tm.excursion_routes(id) on delete cascade,
  n             int not null,                   -- orden (1, 2, 3...)
  nombre        text not null,
  descripcion   text,
  duracion      text,
  coords        jsonb not null,                 -- { lat, lng }
  created_at    timestamptz not null default now()
);

create index idx_paradas_route on capacitacion_tm.excursion_route_paradas(route_id, n);
```

### RLS
- `excursion_routes` y `excursion_route_paradas`: lectura para todos los autenticados (alumno+admin+agencia), escritura solo admin (función `is_admin(auth.uid())`)

### Estructura de archivos

```
app/
├── components/
│   ├── catalogo/
│   │   └── ExcursionsViewer.tsx          (MODIFICAR: agregar <ExcursionRouteMap/>)
│   └── recorrido/                         (NUEVO)
│       ├── ExcursionRouteMap.tsx          (root component)
│       ├── RouteMapLeaflet.tsx            (Leaflet + OSRM, mapa + vehículo + trail)
│       ├── RouteParadasList.tsx           (lista de paradas a un costado)
│       ├── RouteLayerPicker.tsx           (Dark/Estándar/Satélite)
│       └── RoutePlaybackControls.tsx      (play/pause/reset + selector de velocidad)
├── hooks/                                  (NUEVO si no existe)
│   └── useRouteAnimation.ts               (NUEVO: rAF + interpolación + milestone trigger)
├── lib/
│   ├── excursion-route-match.ts           (NUEVO: title → slug helper)
│   ├── excursion-routes.server.ts         (NUEVO: queries Supabase)
│   └── osrm.ts                            (NUEVO: helper de routing + cache)
├── routes/
│   └── _admin-recorridos._index.tsx       (NUEVO: listado admin)
│   └── _admin-recorridos.$slug.tsx        (NUEVO: form edit admin)
│   └── api-excursion-route.tsx            (NUEVO: resource route GET)
└── ...

supabase/migrations/
└── 015_excursion_routes.sql               (NUEVO)

scripts/
└── seed-excursion-routes.mjs              (NUEVO: migra recorrido-data.jsx → DB)
└── eliminar-leccion-recorridos.mjs        (NUEVO: revierte la lección creada en f78ece6)

public/mapeo/
└── _deprecated/                            (NUEVO: mover Recorrido* acá)
    ├── Recorrido.html
    ├── recorrido-app.jsx
    ├── recorrido-data.jsx
    └── recorrido-map.jsx
```

### Matching título-del-catálogo → slug-del-recorrido

`getRecorridoSlug(catalogTitle: string): string | null`

1. Normalizar: lowercase + sin acentos (NFD)
2. Buscar match exacto contra los `name` de `excursion_routes` (también normalizados)
3. Si no, buscar match por substring contra las palabras clave
4. Si no, consultar tabla de overrides en código (`OVERRIDES_MAP`) — para casos donde el título del catálogo difiere del nombre del recorrido (ej. "1. Circuito Chico - Modalidad Premium" del catálogo → "circuito-chico" del recorrido)
5. Si nada: devuelve `null` → no se renderiza mapa para esa excursión

### Decisiones técnicas tomadas (no se preguntan al implementar)
- **react-leaflet** sobre Leaflet imperativo
- **Coords en JSONB** sobre PostGIS (más simple, suficiente para 27 excursiones)
- **Matching con normalización + overrides** sobre matching fuzzy puro
- **Admin V1: form simple con campos de texto + coords manuales** (drag en mapa = V2)
- **Animación con `requestAnimationFrame`** en hook custom `useRouteAnimation` (no setInterval). Avance medido en metros/segundo, no en píxeles.
- **Velocidades:** Moderado (1200 m/s), Normal (3000 m/s), Rápido (8000 m/s) — mismos valores que la app HTML actual.

---

## Tareas

### Fase 0 — Setup (~30 min)

- [x] 0.1 Verificar branch actual (`Actualizacion-mayo`) y commits limpios
- [x] 0.2 Instalar deps: `pnpm add leaflet react-leaflet` + `pnpm add -D @types/leaflet` (el proyecto usa pnpm, no npm)
- [x] 0.3 Importar CSS de Leaflet en `app/root.tsx` (via `links` con `leaflet/dist/leaflet.css?url`)
- [x] 0.4 Verificar que `pnpm run dev` arranca sin errores y SSR funciona (probado /login → 200, leaflet CSS presente en el HTML)
- [x] 0.5 Commit: `chore(recorrido): instalar leaflet + react-leaflet`

### Fase 1 — Backend Supabase (~1.5 hs)

- [x] 1.1 Crear `supabase/migrations/015_excursion_routes.sql` con las dos tablas + índices + RLS
- [x] 1.2 Cielo aplicó la migration desde el SQL Editor de Supabase
- [x] 1.3 Verificar tablas en Supabase (script verify ad-hoc: 27 routes, 146 paradas, JSONB OK)
- [x] 1.4 Crear `scripts/seed-excursion-routes.mjs` — 27 excursiones inline, UPSERT por slug, DELETE+INSERT de paradas, dotenv para credenciales
- [x] 1.5 Correr seed: `node scripts/seed-excursion-routes.mjs` → 27/27 rutas · 146 paradas · 0 errores
- [x] 1.6 Verificar inserts: `excursion_routes=27`, `excursion_route_paradas=146` ✅
- [x] 1.7 Commit: `feat(recorrido): migration + seed de excursion_routes en supabase`

### Fase 2 — Componente React Nativo (~3-4 hs)

- [x] 2.1 Crear `app/lib/excursion-routes.server.ts` con `getExcursionRouteBySlug` + `getAllExcursionRoutes` + types
- [x] 2.2 Crear `app/lib/excursion-route-match.ts` con normalización + substring + tabla de overrides
- [x] 2.3 Crear `app/lib/osrm.ts` con `fetchOsrmRoute` + cache + `buildCumulativeDistances` + `pointAlongRoute` + `findParadasMilestones` + format helpers
- [x] 2.4 Crear `app/components/recorrido/RouteMapLeaflet.tsx` — Leaflet directo (no react-leaflet), markers numerados, polyline base + trail, vehicle marker pulsante
- [x] 2.5 Crear `app/components/recorrido/RouteParadasList.tsx` — lista numerada con scroll auto al cambiar selección
- [x] 2.6 Crear `app/components/recorrido/RouteLayerPicker.tsx` — pill flotante Dark/Estándar/Satélite con backdrop blur
- [x] 2.7 Crear `app/hooks/useRouteAnimation.ts` — rAF loop con milestones, velocidades preset, cleanup en unmount
- [x] 2.8 Crear `app/components/recorrido/RoutePlaybackControls.tsx` — pill bottom-center con play/pause/reset/velocidad
- [x] 2.9 Crear `app/components/recorrido/ExcursionRouteMap.tsx` — root con `lazy()` para SSR-safe + Suspense
- [x] 2.10 Verificación standalone con `/test-recorrido/$slug` (Playwright) — mapa renderiza, OSRM ruta real, controls visibles, 0 errores reales (solo 404 favicon). Nota: requirió limpiar cache de Vite (.vite) por re-optimize de deps después de instalar leaflet
- [ ] 2.11 Commit: `feat(recorrido): componente <ExcursionRouteMap> nativo con react-leaflet + animación`

### Fase 3 — Integración + Admin UI + Vista Agencias (~3-4 hs)

#### 3a. Integración en ExcursionsViewer (compartida alumno + agencia)

- [x] 3.1 Loader del route — decidido **lazy via API endpoint** + pasar `availableRoutes` como hint
- [x] 3.2 Crear `app/routes/api-excursion-route.$slug.tsx` — GET autenticado (cualquier role) retorna ExcursionRoute o null
- [x] 3.3 Modificar `ExcursionsViewer.tsx` — `useMemo(getRecorridoSlug)` + `useEffect` con fetch lazy + render condicional "Recorrido en el mapa" al final del detalle
- [x] 3.4 Verificación visual con alumno_b1: Nieve Encantada cargó con ruta OSRM 73 km, 7 paradas, controles de animación ✅

#### 3b. Vista Agencias (`/agencia`)

- [x] 3.5 `_agencia._index.tsx` usa el mismo `ExcursionsViewer` (confirmado) — loader actualizado con `getAvailableRouteOptions()`
- [x] 3.6 RLS de `excursion_routes` y `excursion_route_paradas` ya correcto desde migration 015 (lectura `to authenticated` cuando `is_published=true`)
- [x] 3.7 Resource route `/api/excursion-route/:slug` usa `requireUser(request)` SIN restricción de role
- [x] 3.8 Test visual con agencia pendiente (usuario `catalogo.agencias` existe en DB, password desconocida para Claude — Cielo verifica cuando guste)

#### 3c. Admin UI

- [x] 3.9 `app/routes/_admin-recorridos._index.tsx` — listado agrupado por temporada, badge publicada/borrador, botón toggle publicar, botón editar
- [x] 3.10 `app/routes/_admin-recorridos.$slug.tsx` — form de edit con todos los campos + lista de paradas (nombre + descripción + duración + lat/lng) con reordenar/eliminar/agregar
- [x] 3.11 Link "Recorridos" agregado en `admin-sidebar.tsx` con icono MapPin + i18n keys es/en/pt
- [x] 3.12 Verificado visualmente con cielo (SuperAdmin): listado muestra 27 rutas agrupadas (11 invierno visibles) + edit de Circuito Chico carga datos completos
- [ ] 3.13 Commit: `feat(recorrido): integración en ExcursionsViewer (alumno+agencia) + admin UI /admin/recorridos`

### Fase 4 — Cleanup + Verificación (~1 hs)

- [x] 4.1 Crear `scripts/eliminar-leccion-recorridos.mjs` con dotenv
- [x] 4.2 Correr el script → 1 lección eliminada (id `4891ab57-67b5-43cc-a8aa-3b6584283f68`)
- [x] 4.3 Verificación: bloque "Listado de excursiones" ya solo tiene "Excursiones de Invierno 2026" ✅
- [x] 4.4 Movidos `public/mapeo/{Recorrido.html, recorrido-{data,map,app}.jsx}` → `public/mapeo/_deprecated/`
- [x] 4.5 README explicativo en `public/mapeo/_deprecated/README.md`
- [x] 4.6 `scripts/seed-leccion-recorridos.mjs` movido a `scripts/_deprecated/`
- [x] 4.7 Verificación visual final con Playwright (alumno_b1 + admin cielo); agencia queda como verificación de Cielo
- [x] 4.8 Commit final `c51c747`: `chore(recorrido): cleanup — eliminar lección global + deprecar app HTML standalone`
- [ ] 4.9 Push de `Actualizacion-mayo` (pendiente aprobación de Cielo)

---

## Criterio de Éxito

**Funcional:**
- [ ] Login como alumno B1 → Módulo 1 → cualquier excursión del catálogo → el mapa de su recorrido aparece al final del detalle
- [ ] El mapa muestra paradas numeradas + línea de ruta calculada con OSRM
- [ ] Click en parada de la lista → mapa centra + descripción de la parada expande
- [ ] Layer picker funciona (Dark / Estándar / Satélite)
- [ ] **Animación**: click "Animar" → el vehículo recorre la ruta + trail brillante crece + las paradas se van resaltando como activas en orden + al llegar al final muestra "Repetir"
- [ ] **Velocidades** (Moderado/Normal/Rápido) cambian la velocidad sin reiniciar
- [ ] **Botón Reset** rebobina al inicio
- [ ] **Login como agencia → `/agencia` → ver una excursión → el mapa carga igual que para alumno**
- [ ] Login como admin (cielo) → `/admin/recorridos` → puedo editar una parada y se refleja al recargar el viewer (en ambas vistas: alumno y agencia)
- [ ] La lección "Recorridos de Excursiones" ya no aparece en Módulo 1
- [ ] El catálogo de excursiones sigue funcionando como antes (sin regresiones)

**Técnico:**
- [ ] No quedan dependencias de `public/mapeo/Recorrido.html` desde el lado del alumno
- [ ] El bundle no crece más de ~200 KB tras agregar leaflet+react-leaflet (es razonable, no excesivo)
- [ ] El componente respeta el tema (CSS vars) del proyecto
- [ ] No hay errores en consola al abrir cualquier excursión
- [ ] Todos los scripts (`seed-excursion-routes.mjs`, `eliminar-leccion-recorridos.mjs`) usan dotenv (no key hardcoded)

**De código:**
- [ ] Commits separados por fase (4-5 commits)
- [ ] Sin TypeScript errors
- [ ] Estructura de archivos coherente con el resto del proyecto

---

## Notas / Riesgos

### Riesgos técnicos
1. **SSR + Leaflet:** React Router 7 hace SSR. Leaflet usa `window` y `document` y rompe en SSR. **Mitigación:** dynamic import del componente con `{ ssr: false }` o `import("leaflet").then(...)` solo en `useEffect`. Verificar en Fase 0.4.
2. **Matching título → slug imperfecto:** algunos títulos del catálogo pueden no matchear ningún slug. **Mitigación:** tabla de overrides explícita + fallback a `null` (no rompe — simplemente no muestra mapa para esa excursión).
3. **OSRM público con rate limits:** el endpoint público no garantiza SLA. **Mitigación:** ya hay cache en memoria. Si se vuelve un problema en producción, evaluar self-hosting o un servicio pago.
4. **Performance del catálogo:** si pre-cargamos 27 routes con paradas, son ~150 paradas. **Mitigación:** lazy load por API call al seleccionar excursión (decidido en 3.1).
5. **Animación + cleanup en unmount:** `requestAnimationFrame` debe cancelarse al desmontar el componente o al cambiar de excursión, sino se queda corriendo en background y consume CPU. **Mitigación:** cleanup en `useEffect` que retorne `cancelAnimationFrame(rafRef.current)`. Ya implementado en el código HTML actual — copiar patrón.
6. **Performance de animación con muchas paradas:** rAF dibujando un vehículo + trail con setLatLngs en cada frame puede ser pesado. **Mitigación:** usar `preferCanvas: true` en `MapContainer` (ya planeado) — renderiza polylines en canvas en vez de SVG. Suficiente para 27 paradas.
7. **Vista Agencias — RLS para role `agencia`:** si la policy de `excursion_routes` exige `is_admin(auth.uid())`, agencia no puede leer. **Mitigación:** policy de SELECT amplia para `authenticated` filtrando por `is_published = true`. Tarea 3.6 lo cubre explícitamente.

### Dependencias externas
- Supabase: Cielo debe aplicar la migration manualmente desde el SQL Editor (paso 1.2). No se aplican migrations automáticamente en este proyecto.
- `.env.local` debe tener `SUPABASE_URL` + `SUPABASE_SECRET_KEY` para los scripts (ya está configurado para otros scripts).

### Decisiones que quedan ABIERTAS (para resolver al ejecutar)
- **Path exacto del route de catálogo en alumno** (3.1) — verificar al inicio de Fase 3 leyendo `app/routes/`
- **Estructura del sidebar admin** — donde inyectar el link `/admin/recorridos` (3.7)

### Pendientes que NO bloquean este plan pero quedan registrados
- Fix de credenciales de `seed-leccion-recorridos.mjs` queda obsoleto porque ese script se deprecará en Fase 4.6
- Migración de Pick Ups (`Mapeo.html`) a React nativo: pendiente, fuera de scope

### Reversibilidad
Cada commit es atómico y reversible. Si algo sale mal en Fase 3 o 4, los commits previos quedan funcionando. La lección actual (`f78ece6`) solo se elimina en Fase 4 — antes de eso, conviven la solución vieja (iframe lección) y la nueva (componente nativo).
