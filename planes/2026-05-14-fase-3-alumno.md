# Plan — Fase 3: Experiencia del Alumno

> **Proyecto:** Plataforma de Capacitación TM
> **PRD fuente:** [planes/2026-05-14-prd-plataforma-capacitacion.md](2026-05-14-prd-plataforma-capacitacion.md)
> **Fase anterior:** [Fase 2](2026-05-14-fase-2-contenido.md)
> **Fecha:** 2026-05-14
> **Owner:** Cielo · Ejecutor: Claude Code
> **Resultado esperado:** Alumno puede navegar categorías, módulos, bloques y lecciones. Ve contenido renderizado según su sector. Tracking de progreso (completados, en progreso, pendientes). Test de evaluación al final de módulo.

---

## Pre-flight

- [ ] No tocar `salidas/app-invierno/` ni ningún otro proyecto.
- [ ] Trabajar sobre rama `feature/capacitacion-tm-fase-3` (creada desde `main` con Phase 2 mergeada).
- [ ] Fase 2 ya en producción en `main`.
- [ ] Supabase: RLS policy para alumnos leyendo `lessons` filtrado por sector + `is_published` ya lista.

---

## Decisiones técnicas para esta fase

| Tema | Decisión |
|------|----------|
| Home alumno | Tarjetas de categorías (imagen de portada, nombre, cantidad módulos) |
| Vista categoría | Grid de módulos (nombre, duración estimada, progreso %) |
| Vista módulo | Acordeón de bloques (expandible, títulos alt por sector) |
| Vista bloque | Lista de lecciones (publicadas + visibles al alumno) |
| Vista lección | Renderizado de HTML desde Tiptap JSON + bloques especiales (AlertBlock, CardBlock, VideoBlock) |
| Progreso | Tabla `progress` (alumno_id, lesson_id, estado: started|completed, completed_at, score si has_evaluation) |
| Test evaluación | Modal con 3-5 preguntas al final de módulo (multiplechoice) → puntaje → unlock siguiente módulo |
| Breadcrumb | Categoría > Módulo > Bloque > Lección |
| Sector visibility | Renderizado diferencial: si no visible al alumno → texto "Contenido no disponible para tu sector" |

---

## Tareas

### T1 — Migration 007: Tabla progress + respuestas evaluación

**Tablas:**
- `capacitacion_tm.progress` — alumno_id, lesson_id, estado, started_at, completed_at, score
- `capacitacion_tm.evaluations` — module_id, preguntas JSON (id, texto, opciones[]), passing_score
- `capacitacion_tm.evaluation_responses` — alumno_id, evaluation_id, respuestas JSON, score, submitted_at

**RLS:**
- Alumnos leen su propio progreso.
- SP/SuperAdmin leen progreso de todos.
- Alumnos escriben solo su progreso.

**Criterio:** SQL corre sin errores, RLS permite lectura alumno de su fila.

---

### T2 — RLS policy lectura alumno

Actualizar RLS en `lessons`, `blocks`, `modules`, `categories`:
- Alumno lee si `is_published = true` Y sector en `visible_sectors`.
- Mantener políticas admin sin cambios.

**Criterio:** Test: alumno logueado ve solo lecciones visibles a su sector.

---

### T3 — Componente CategoryCard

Archivo: `app/components/student/category-card.tsx`

**Props:**
- `category: Category` — id, slug, name, description, image_url?
- `moduleCount: number`
- `onClick: () => void`

**UI:**
- Imagen de portada (placeholder si no existe)
- Nombre y descripción
- Badge "N módulos"
- Botón "Entrar"

**Criterio:** Renderiza sin errores.

---

### T4 — Componente ModuleCard

Archivo: `app/components/student/module-card.tsx`

**Props:**
- `module: Module` — id, title, description
- `progress: ModuleProgress` — completed: number, total: number
- `onClick: () => void`

**UI:**
- Nombre + descripción
- Progress bar (% completado)
- "X de Y lecciones" debajo
- Botón "Continuar"

**Criterio:** Progress bar calcula correctamente.

---

### T5 — Ruta /alumno (home)

Archivo: `app/routes/_alumno._index.tsx`

**Acción (loader):**
- Verificar alumno logueado
- Fetch categorías (sector del alumno)
- Fetch progreso de cada categoría

**UI:**
- Encabezado "Tu capacitación"
- Grid de CategoryCard
- Si no hay categorías: "No hay contenido disponible aún"

**Criterio:** Alumno ve solo categorías visibles a su sector.

---

### T6 — Ruta /alumno/cursos/:categorySlug

Archivo: `app/routes/_alumno-cursos.$categorySlug.tsx`

**Acción (loader):**
- Fetch categoría por slug
- Verificar acceso (visible al sector del alumno)
- Fetch módulos ordenados
- Fetch progreso de cada módulo

**UI:**
- Breadcrumb: "Inicio > [Categoría]"
- Descripción de categoría
- Grid de ModuleCard
- Botón "Volver" → home

**Criterio:** Usuario no logueado redirige a login.

---

### T7 — Ruta /alumno/cursos/:categorySlug/modulos/:moduleId

Archivo: `app/routes/_alumno-cursos.$categorySlug-modulos.$moduleId.tsx`

**Acción (loader):**
- Fetch módulo
- Fetch bloques del módulo (con títulos alt por sector)
- Fetch lecciones de cada bloque
- Fetch progreso del alumno

**UI:**
- Breadcrumb: "Inicio > [Categoría] > [Módulo]"
- Acordeón de bloques (expandible)
  - Cada bloque muestra lista de lecciones
  - Icono de estado: ○ (no empezado), ◐ (en progreso), ● (completado)
  - Click en lección → navega a `/alumno/cursos/.../bloques/.../lecciones/:lessonId`
- Botón "Volver a categoría"

**Criterio:** Acordeón funciona, estados visuales correctos.

---

### T8 — Ruta /alumno/cursos/:categorySlug/modulos/:moduleId/bloques/:blockId/lecciones/:lessonId

Archivo: `app/routes/_alumno-cursos.$categorySlug-modulos.$moduleId-bloques.$blockId-lecciones.$lessonId.tsx`

**Acción (loader):**
- Fetch lección completa
- Verificar visibilidad (is_published + visible_sectors)
- Fetch progreso actual
- Si bloque tiene `has_evaluation` → fetch evaluación

**Action (PUT/POST):**
- Marcar lección como iniciada (progress.started_at = now)
- Marcar lección como completada (progress.completed_at = now, estado = completed)
- Submit respuestas evaluación (evaluations.evaluation_responses)

**UI:**
- Breadcrumb
- 2-column layout:
  - **Izquierda:** Acordeón módulo + lista bloques + lección actual resaltada
  - **Centro:** 
    - Título lección
    - HTML renderizado (Tiptap JSON → generateHTML)
    - Bloques especiales (AlertBlock, CardBlock, VideoBlock)
    - Si no visible: "Contenido no disponible para tu sector"
    - Botones: "Marcar como completada" | "Siguiente lección"
  - **Derecha:** 
    - Progress del módulo
    - Tiempo estimado
    - Estado badge (no empezado, en progreso, completado)
    - Icono "Imprimir" (TODO Fase 4)

**Criterio:** 
- Contenido renderiza sin errores.
- Botón "Completada" actualiza DB y UI.
- Navegación funciona.

---

### T9 — Renderizado de contenido (helper)

Archivo: `app/lib/render-content.ts`

**Funciones:**
- `renderLessonContent(contentJson, blocks)` → HTML string
  - Usa Tiptap `generateHTML(contentJson, extensions)`
  - Renderiza bloques especiales (AlertBlock, CardBlock, VideoBlock) inline
  - Aplica estilos prose-sm

**Criterio:** Renderiza sin errores, bloques especiales visibles.

---

### T10 — Tabla progress UI

Archivo: `app/components/student/progress-panel.tsx`

**Props:**
- `moduleId: string`
- `lessonId: string`
- `lessonCount: number`
- `completedCount: number`

**UI:**
- "X de Y lecciones completadas"
- Progress bar
- Tiempo estimado restante (heurística: 5min por lección)

**Criterio:** Calcula correctamente.

---

### T11 — Test: evaluación módulo

Archivo: `app/components/student/evaluation-modal.tsx`

**Props:**
- `evaluation: Evaluation`
- `onSubmit: (respuestas) => Promise<void>`
- `onClose: () => void`

**UI:**
- Modal con preguntas multiplechoice
- 1 pregunta por pantalla o todas a la vez (UX decision)
- Radio buttons por pregunta
- Botón "Enviar respuestas"
- Feedback: "Pasaste con X%. Siguiente módulo desbloqueado."

**Criterio:** Calcula score, envía a DB.

---

### T12 — RLS update: alumno reads evaluations

Actualizar RLS en `evaluations`:
- Alumno lee evaluación de módulo que está cursando.
- Solo read, sin write.

**Criterio:** Alumno no puede ver evaluaciones de otros módulos.

---

### T13 — Testing integration

**Casos:**
1. Alumno navega home → ve categorías visibles a su sector
2. Alumno abre categoría → ve módulos
3. Alumno abre módulo → ve bloques y lecciones
4. Alumno abre lección no visible → ve "Contenido no disponible"
5. Alumno marca lección completada → progreso se actualiza
6. Alumno completa todas lecciones → aparece botón "Hacer evaluación"
7. Alumno responde evaluación → recibe puntaje y feedback

**Criterio:** Todos los casos pasan.

---

## Orden ejecución recomendado

1. **T1** — Migration 007 (progress + evaluations)
2. **T2** — RLS update lectura alumno
3. **T3, T4** — Componentes tarjeta (paralelo)
4. **T5** — Ruta home alumno
5. **T6** — Ruta vista categoría
6. **T7** — Ruta vista módulo (acordeón)
7. **T8** — Ruta vista lección (core)
8. **T9** — Renderizado contenido helper
9. **T10** — Panel progreso
10. **T11** — Modal evaluación
11. **T12** — RLS evaluations
12. **T13** — Testing integration

**Timeline estimado:** 3-4 sesiones (16-20 horas de desarrollo).

---

## Notas

- **Evaluación:** Decidir si preguntas se almacenan en DB o se hardcodean por módulo.
- **Progreso:** Considerar si alumno puede "saltar" lecciones o debe ir en orden.
- **Impresión:** Fase 4 — generar PDF de lección completada.
- **Certificado:** Fase 5 — generar PDF con calificaciones al completar curso.
