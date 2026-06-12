# Plan — Fase 2: Carga de Contenido Manual

> **Proyecto:** Plataforma de Capacitación TM
> **PRD fuente:** [planes/2026-05-14-prd-plataforma-capacitacion.md](2026-05-14-prd-plataforma-capacitacion.md)
> **Fecha:** 2026-05-14
> **Owner:** Cielo · Ejecutor: Claude Code
> **Resultado esperado:** Admin puede crear categorías, módulos, bloques y lecciones. Puede cargar contenido con editor WYSIWYG (Tiptap) o formularios tipados (Excursión, Proveedor, Protocolo). Vista previa en tab separado. SP puede crear usuarios desde el panel.

---

## Pre-flight

- [ ] No tocar `salidas/app-invierno/` ni `public` schema de Supabase.
- [ ] Trabajar sobre rama `feature/capacitacion-tm-fase-2` (nueva desde `feature/capacitacion-tm-fase-1`).
- [ ] Las migraciones SQL se aplican en el SQL Editor de Supabase (mismo proyecto compartido).

---

## Decisiones técnicas resueltas para esta fase

| Tema | Decisión |
|------|----------|
| Editor WYSIWYG | **Tiptap** (StarterKit + extensiones) |
| Contenido genérico | `content_json` en `lessons` (output JSON de Tiptap) |
| Contenido tipado | Tablas propias: `excursiones`, `proveedores`, `protocolos` |
| Visibilidad por sector | Columna `visible_sectors sector_code[]` en cada tabla nodo |
| Overrides de título | Tablas `*_sector_titles` (module, block) |
| Vista previa | Ruta `/preview/leccion/:id?sector=B1` — nueva pestaña |
| Auto-save editor | Debounce 2s → action de React Router |
| Gestión de usuarios | `/admin/usuarios` — `admin.auth.createUser()` + upsert en tabla users |

---

## Tareas

### T1 — Migration 005: Tablas de contenido

Aplicar en SQL Editor de Supabase.

**Tablas:**
- `capacitacion_tm.categories` — slug, name, order, season (yearround|winter|summer)
- `capacitacion_tm.modules` — category_id, title, description, order, has_evaluation, passing_score, is_published, visible_sectors[]
- `capacitacion_tm.module_sector_titles` — module_id, sector, alt_title
- `capacitacion_tm.blocks` — module_id, title, description, order, visible_sectors[]
- `capacitacion_tm.block_sector_titles` — block_id, sector, alt_title
- `capacitacion_tm.lessons` — block_id, title, lesson_type (generic|excursion|provider|protocol), content_json, order, visible_sectors[], is_published

**RLS:** Roles admin (editor, sp, superadmin) leen y escriben todo via `is_admin()`. Alumnos: sin acceso todavía (se agrega en Fase 3 con filtro por sector + is_published).

**Criterio:** SQL corre sin errores en Supabase.

---

### T2 — Migration 006: Schemas tipados + media

**Tablas:**
- `capacitacion_tm.excursiones` — lesson_id (FK, nullable), titulo, categoria, proveedor_id (FK), duracion, edad_minima, horarios text[], pickup, temporada, diferencial, programa, itinerario text[], incluye text[], no_incluye text[], restricciones, imagenes text[], visible_sectors[]
- `capacitacion_tm.proveedores` — nombre, logo_url, descripcion, contacto jsonb, visible_sectors[]
- `capacitacion_tm.protocolos` — lesson_id (FK), titulo, identificador text unique, tipo_alerta (info|warning|danger|success), destacado text, parrafos jsonb
- `capacitacion_tm.media` — url, storage_path, mime_type, size_bytes, title, uploaded_by (FK auth.users)

**Criterio:** SQL corre sin errores, tablas visibles en Supabase Dashboard.

---

### T3 — Panel /admin/usuarios

**Ruta:** `app/routes/_admin.usuarios.tsx`

**Funcionalidades:**
- Tabla de usuarios con columnas: Avatar (iniciales), Nombre, Usuario, Rol (badge), Sector (badge), Creado
- Filtro por rol y sector
- Botón "Nuevo usuario" → Dialog con formulario:
  - username (3-32 chars, validado con usernameSchema)
  - full_name
  - password inicial (mín. 6 chars)
  - role (select: alumno | editor | sp | superadmin)
  - sector (select: B1 | VR | VP | null — requerido si role=alumno)
- Acción: `admin.auth.createUser()` → el trigger crea el perfil automáticamente
- Botón "Resetear contraseña" por usuario → `admin.auth.updateUserById()` con nueva contraseña
- Actualizar rol/sector → `admin.from('users').update()`

**Criterio:** Cielo puede crear un nuevo alumno desde la UI sin tocar Supabase.

---

### T4 — Navegación de contenido admin

**Rutas:**
- `/admin/cursos` → vista principal (categorías como tabs o cards)
- `/admin/cursos/:categorySlug` → módulos en acordeón (estilo Mighty Networks wireframe)
- `/admin/cursos/:categorySlug/modulos/:moduleId` → bloques del módulo + botón "Nuevo bloque"
- `/admin/cursos/:categorySlug/modulos/:moduleId/bloques/:blockId` → lecciones + botón "Nueva lección"

**UI del acordeón de módulos:**
```
┌────────────────────────────────────────────────────────────────┐
│  ⬡  Módulo 0 — Introducción Institucional       🟢 Publicado  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ⋮⋮  📄  Bienvenido a Turismo Bariloche   [📝][👁][⋮] │  │
│  │ ⋮⋮  📄  Índice de aprendizajes           [📝][👁][⋮] │  │
│  │              [+ Añadir bloque]                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Criterio:** Admin puede navegar categoría → módulo → bloque → lección y crear cada nodo.

---

### T5 — Editor de lecciones genéricas (Tiptap)

**Ruta:** `/admin/cursos/:categorySlug/modulos/:moduleId/bloques/:blockId/lecciones/:lessonId`

**Instalaciones:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-text-align`

**Layout del editor:**
```
┌──────────────────────────┬─────────────────────────────────────┐
│  PALETA (sticky)         │  EDITOR                             │
│  Texto                   │  Toolbar: B I U H2 H3 lista ...    │
│  • Encabezado            │                                     │
│  • Texto                 │  Contenido editable (Tiptap)        │
│  • Lista                 │                                     │
│  Énfasis                 │  [+ Agregar componente especial]    │
│  • Alerta                │                                     │
│  • Card                  │                                     │
│  Multimedia              │                                     │
│  • Imagen                │                                     │
│  • Video                 │                                     │
│  Sectores:               │                                     │
│  [✓B1][✓VR][✓VP]        │                                     │
└──────────────────────────┴─────────────────────────────────────┘
```

**Componentes especiales** (insertados como nodos Tiptap custom o bloques JSON):
- Alerta (info | warning | danger | success) + texto
- Card / Recuadro (título + descripción + icono opcional)
- Separador horizontal
- Video embed (YouTube/Vimeo URL → iframe)

**Auto-save:** debounce 2s → `fetcher.submit()` al action de la ruta.

**Criterio:** Admin puede escribir texto con formato, insertar una alerta y un separador, y el contenido se guarda automáticamente.

---

### T6 — Vista previa en tab separado

**Ruta:** `/preview/leccion/:lessonId` (fuera del layout admin — sin sidebar)

**Query param:** `?sector=B1` (default B1)

**UI:**
- Banner top discreto: "Vista previa como alumno · Sector: [B1 / VR / VP ▼]" (selector de sector)
- Renderiza la lección exactamente como la verá el alumno
- Soporta todos los componentes del editor: texto, encabezados, listas, alertas, cards, video
- Si la lección es tipada → renderiza el schema correspondiente (Excursión / Proveedor / Protocolo)

**Criterio:** El botón "👁 Vista previa" en el editor abre la ruta en nueva pestaña y muestra el contenido correctamente.

---

### T7 — Schemas tipados: Excursión, Proveedor, Protocolo

**Ruta:** `/admin/cursos/.../lecciones/:lessonId?tipo=excursion`

**Excursión form:** todos los campos del PRD §7.2.bis (título, categoría, proveedor, duración, edad mínima, horarios, pickup, temporada, diferencial, itinerario multiline, incluye/no incluye, restricciones, galería de imágenes).

**Proveedor form:** nombre, logo_url, descripción, contacto (teléfono, email, whatsapp), excursiones asociadas.

**Protocolo form:** título, identificador, tipo de alerta (dropdown con preview del color), destacado, párrafos (textarea multiline).

**Vista del alumno (preview):** cada schema tiene su renderer propio en `/preview/leccion/:id`.

**Criterio:** Admin puede crear una Excursión completa y verla renderizada en el preview.

---

### T8 — Controles de visibilidad por sector

**Componente:** `<SectorVisibilityToggle value={visibleSectors} onChange={...} />`

- Tres toggles: B1 · VR · VP
- Si se desactiva un sector, ese módulo/bloque/lección no aparece para alumnos de ese sector
- Override de título: campo de texto que aparece debajo de cada sector activo (opcional)

**Integración:** disponible en el sidebar de config del editor (T5) y en los formularios de módulo y bloque.

**Criterio:** Se puede marcar un bloque como "solo B1" y el toggle persiste al guardar.

---

## Orden de ejecución

```
T1 (DB 005)  →  T2 (DB 006)
     ↓               ↓
T3 (Usuarios)   T4 (Navegación) → T5 (Editor) → T6 (Preview)
                                      ↓
                                 T7 (Schemas tipados)
                                 T8 (Sector visibility)
```

T1 y T2 se pueden aplicar en paralelo. T3 y T4 son independientes entre sí. T5, T6, T7, T8 dependen de T4.

---

## Criterio de aceptación de la fase

1. ✅ SP crea un usuario alumno desde `/admin/usuarios` sin tocar Supabase.
2. ✅ Admin navega a Categoría → Módulo → Bloque → Lección y crea cada nodo.
3. ✅ Admin carga una lección con texto, alerta y separador usando el editor WYSIWYG.
4. ✅ Admin crea una Excursión completa con formulario tipado.
5. ✅ Botón "Vista previa" abre la lección en nueva pestaña con el contenido correcto.
6. ✅ Los toggles B1/VR/VP en un bloque persisten al guardar.

---

## Migraciones a aplicar en Supabase SQL Editor

```
005_content_schema.sql    → tablas de contenido
006_typed_schemas.sql     → excursiones, proveedores, protocolos, media
```

_Aplicar en orden. Después de cada una confirmar "Success. No rows returned."_
