# Motor de contenido CM — Plan 3a: Fuente Catálogo (invierno) Implementation Plan

> Primer avance del Plan 3 (fuentes adicionales) mencionado como bloqueado en `planes/2026-07-13-motor-contenido-cm-plan-fase1-backend.md` y en `planes/2026-07-13-motor-contenido-cm-plan-fase2-frontend.md`. Decisión tomada con Cielo (14/07/2026): **duplicar el catálogo en el Supabase "TM Platform"** en vez de conectar n8n al Supabase de capacitacion-tm (proyectos separados, sin necesidad real de cruzarlos).

**Goal:** Que el motor de contenido CM pueda generar copy para las 9 marcas a partir de una excursión real del catálogo de invierno — sin depender de que alguien escriba un brief a mano — reusando el mismo generador ya construido en la Fase 1.

**Architecture:** El catálogo de invierno (`contexto/negocio/catalog_invierno.md`, 34 excursiones) se parseó una vez y se cargó en `crm_cm.excursion_catalog`. Workflow nuevo **"CM - Generar desde Catálogo"** elige una excursión (por id o al azar entre las activas), arma un brief de texto a partir de sus datos reales (recorrido/incluye/no incluye), y llama al webhook ya existente de **"CM - Generar Contenido"** (Fase 1) — que ahora acepta un campo `origen` dinámico en vez de tenerlo hardcodeado a `brief_manual`.

**Tech Stack:** Node.js (script de parseo, uso único, no queda en el repo de código — vive en el scratchpad de la sesión), Supabase (tabla nueva), n8n (workflow nuevo + fix al existente).

---

## Qué se hizo

### 1. Tabla `crm_cm.excursion_catalog`

```sql
create table crm_cm.excursion_catalog (
  id bigint generated always as identity primary key,
  nombre text not null,
  categoria text,
  temporada text not null check (temporada in ('invierno','verano','todo_el_anio')),
  recorrido text,
  lugar_encuentro text,
  incluye text,
  no_incluye text,
  precio_info text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

`precio_info` es texto de referencia suelto (no numérico) — el generador tiene instrucción explícita de no citar precios, así que no hace falta modelarlo con precisión. **Lección de Fase 1/Fase 2 aplicada de entrada:** el `RLS` + policy (`excursion_catalog_read_all`, select para `anon`/`authenticated`/`service_role`) y los `GRANT` se agregaron en la MISMA migración de creación de tabla, no como paso separado — evita repetir el bug de "tabla con RLS sin policy" y el de "grants faltantes" que aparecieron dos veces en sesiones anteriores.

### 2. Parseo y carga del catálogo de invierno

`catalog_invierno.md` tiene un formato consistente (`### NOMBRE`, secciones `**RECORRIDO**`/`**LUGAR DE ENCUENTRO**`/`**PUNTO DE ENCUENTRO**`/`**INCLUYE**`/`**NO INCLUYE**`/`**PRECIO**`/`**FORMAS DE PAGO**`, separadas por `---`). Se escribió un script Node de un solo uso para parsearlo (más confiable que transcribir 34 excursiones a mano) y generar el `INSERT`.

- **34 excursiones cargadas**, de las cuales **8 quedaron con `activa = false`** — son las que el catálogo fuente lista bajo el encabezado `## EXCURSIONES SUSPENDIDAS`. El resto (26) incluye 3 en `SERVICIOS ADICIONALES` (seguro de cancelación, alquiler de equipo/ropa) que no son excursiones en sí pero se dejaron `activa = true` con su `categoria` propia — el generador las puede filtrar por categoría si hace falta.
- Solo se cargó `catalog_invierno.md` (temporada actual). `catalog_verano.md` y `catalog_anio_completo.md` son mucho más cortos (65 y 32 líneas — probablemente listados/índices, no fichas completas) y quedan **fuera de este plan**, para cuando se acerque la temporada de verano.

### 3. Workflow "CM - Generar Contenido" (Fase 1) — modificado

- `Normalizar input`: se agregó el campo `origen` (`{{ $json.body?.origen ?? $json.origen ?? "brief_manual" }}`), antes no existía.
- `Armar filas content_pipeline`: `origen` pasó de estar hardcodeado a `'brief_manual'` a leer `input.origen` (con el mismo default) — esto es lo que permite que un llamador externo etiquete el origen real de la generación.

### 4. Workflow nuevo "CM - Generar desde Catálogo" (`xVFu5zlRlauJcdAk`)

Webhook `POST /webhook/cm-generar-desde-catalogo`, body opcional `{ excursion_id?, formato? }`:

1. `Supabase - Traer excursiones activas` — trae TODAS las excursiones `activa=true, temporada=invierno` (26 filas) en una sola llamada.
2. `Armar brief desde catalogo` (Code) — si vino `excursion_id`, busca esa excursión exacta en la lista; si no, elige una al azar (`Math.random()`) entre las 26. Arma un brief de texto con nombre + recorrido + incluye + no incluye. Etiqueta `origen: 'catalogo'`.
3. `Llamar CM - Generar Contenido` — POST al webhook de la Fase 1 con `{ brief, formato, origen }`, reusa el generador entero (GPT + 9 marcas + insert a `content_pipeline`) sin duplicar esa lógica.

**Gotcha real encontrado durante la prueba (ya solucionado):** después de modificar "CM - Generar Contenido" para aceptar `origen`, la primera prueba end-to-end siguió devolviendo `origen: 'brief_manual'` en las filas nuevas. Causa: **guardé los cambios pero no publiqué esa versión** — el webhook en producción seguía sirviendo la versión anterior (con `origen` hardcodeado), aunque el editor mostraba el cambio ya hecho. Mismo patrón de error que hay que recordar en toda esta serie de workflows: **modificar ≠ publicar**, y hasta no publicar, cualquier integración externa (como este workflow nuevo llamando al webhook) sigue viendo el comportamiento viejo. Fix: `publish_workflow` después de cada cambio, antes de dar por buena una prueba de integración entre dos workflows.

---

## Verificación

Dos ejecuciones manuales reales de "CM - Generar desde Catálogo" (sin `excursion_id`, para probar la selección al azar):

1. Primera corrida (antes del fix de publicación) → eligió "NIEVE ENCANTADA" pero insertó con `origen='brief_manual'` (bug, corregido).
2. Segunda corrida (después de publicar el fix) → eligió una excursión distinta relacionada a Cerro Catedral, insertó 9 filas reales (una por marca) con `origen='catalogo'` confirmado por SQL, tono adaptado por marca igual que en la Fase 1.

Confirma que: (a) la selección al azar funciona (dos corridas, dos excursiones distintas), (b) el `origen` viaja correctamente de punta a punta cuando ambos workflows están publicados, (c) el generador reusado en la Fase 1 no necesitó ningún cambio en su lógica de generación — solo aceptar un parámetro más.

---

## Fuera de alcance de este plan

- **`catalog_verano.md` / `catalog_anio_completo.md`** — no cargados, son archivos mucho más cortos y probablemente no tienen el mismo detalle por excursión. Revisar cuando se acerque la temporada.
- **Botón en `crm-cm` para "generar desde catálogo"** — hoy el Generador de `salidas/crm-cm/` (Fase 2) solo tiene el campo de brief manual. Falta un selector de excursión (o un botón "sorprendeme") que llame a este nuevo webhook — es trabajo de frontend, no incluido acá.
- **Actualización del catálogo cuando cambien precios/excursiones** — hoy es una carga de una sola vez. No hay proceso para mantenerlo sincronizado si se edita `catalog_invierno.md` más adelante.
- **Fuentes Chatwoot y tendencias** — siguen sin empezar, son las otras dos fuentes que faltaban del diseño original de la Fase 1.
