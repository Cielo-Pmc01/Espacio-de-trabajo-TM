# Plan: Integrar Catálogo de Excursiones en Lectura de Lecciones

**Fecha:** 2026-05-19  
**Estado:** Pendiente Aprobación  
**Proyecto:** capacitacion-tm  

---

## Contexto

El catálogo de excursiones y directorio de proveedores fue creado como rutas públicas independientes (`/catalogo/excursiones`, `/catalogo/proveedores`). Sin embargo, el usuario quiere que aparezcan **dentro del Módulo 1 (Invierno) como lecciones**, con el diseño y tipografía de capacitacion-tm.

---

## Cambios Requeridos

### 1. Rediseñar ExcursionsViewer y ProvidersViewer
**Ubicación:** `app/components/catalogo/`

Cambios:
- Remover "Catálogo de Excursiones" / "Proveedores y Prestadores" como títulos principales
- Remover header con filtros (que aparezca como contenido, no header)
- Adaptar a container estrecho (width del layout de lección)
- Usar tipografía y colores de capacitacion-tm, no colores personalizados (C.sky, C.text1, etc.)
- Remover `padding: '0 0 4rem 0'` excesivo

### 2. Detectar Tipo de Lección
**Archivo:** `app/routes/_alumno-lesson.$categorySlug.$moduleId.$blockId.$lessonId.tsx`

- Agregar condición: Si `lesson.lesson_type === 'catalog_excursions'` → renderizar ExcursionsViewer
- Agregar condición: Si `lesson.lesson_type === 'catalog_providers'` → renderizar ProvidersViewer
- Sino → renderizar Tiptap content normal

### 3. Actualizar Tipo de Lección en BD
**Archivo:** Migraciones / Manual update

- Cambiar lección "Excursiones de Invierno 2026" (ea2253f5...) → `lesson_type = 'catalog_excursions'`
- Cambiar lección "Directorio de Proveedores" (6b94e483...) → `lesson_type = 'catalog_providers'`

### 4. Ajustar Colores
**Cambio:** Reemplazar colores `C.*` hardcodeados por variables CSS de capacitacion-tm:
- `C.sky` → `var(--accent)` o color azul de tema
- `C.text1` → `var(--fg)` (foreground)
- `C.text2` → `var(--muted-fg)` (muted foreground)
- `C.surface` → `var(--muted)` o rgba similar
- `C.border` → `var(--border)`

### 5. Remover Rutas Públicas (Opcional)
**Archivos a eliminar:**
- `app/routes/catalogo.tsx`
- `app/routes/catalogo.excursiones.tsx`
- `app/routes/catalogo.proveedores.tsx`
- Remover entrada en `routes.ts`

O MANTENER como fallback/links directos si prefiers.

---

## Flujo de Implementación

1. **Refactor ExcursionsViewer** — Remover estilos independientes, adaptar a layout
2. **Refactor ProvidersViewer** — Remover estilos independientes, adaptar a layout
3. **Actualizar lesson viewer** — Agregar condiciones para detectar tipo
4. **Actualizar BD** — Cambiar `lesson_type` de las 2 lecciones
5. **Test en browser** — Navegar a Módulo 1 → Ver lecciones renderizadas
6. **Commit**

---

## Criterio de Éxito

✅ Navegar a `/alumno/cursos/invierno/modulos/[id]/bloques/[id]/lecciones/[id]`  
✅ Si es catálogo → Ver ExcursionsViewer con diseño capacitacion-tm  
✅ Si es directorio → Ver ProvidersViewer con diseño capacitacion-tm  
✅ Mantener toda funcionalidad: filtros, búsqueda, accordion  
✅ Tipografía y colores idénticos a lecciones normales  

---

## Estimación: 2-3 horas
