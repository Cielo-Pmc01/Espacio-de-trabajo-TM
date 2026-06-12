# Plan: Catálogo de Excursiones y Directorio de Proveedores

**Fecha:** 2026-05-19  
**Estado:** Pendiente Aprobación  
**Proyecto:** capacitacion-tm  
**Estimación:** 3-4 horas

---

## Contexto y Justificación

El proyecto capacitacion-gral tiene dos componentes UI muy funcionales y visualmente atractivos para mostrar:
1. **ExcursionsViewer** — Master-detail con filtros por categoría + búsqueda
2. **ProvidersViewer** — Accordion expandible agrupado por proveedor

Capacitacion-tm ya tiene las **lecciones cargadas** con datos de excursiones e invierno (2 lecciones en Tiptap JSON):
- Lección 1: "Excursiones de Invierno 2026" (11 excursiones detalladas)
- Lección 2: "Directorio de Proveedores — Invierno" (contactos + listado)

**Objetivo:** Reutilizar los componentes UI de capacitacion-gral, adaptándolos para que consulten **datos de Supabase** (lecciones ya cargadas) en lugar de archivos estáticos. Resultado: dos vistas públicas y atractivas para alumnos.

---

## Alcance

### ✅ INCLUYE
- Crear 2 nuevas rutas públicas (sin autenticación requerida, o público lectura)
  - `/catálogo/excursiones` — Catálogo con master-detail, filtros, búsqueda
  - `/catálogo/proveedores` — Directorio con accordion expandible
- Adaptar ExcursionsViewer para consultar BD Supabase
- Adaptar ProvidersViewer para consultar BD Supabase
- Parser de Tiptap JSON → estructura `Excursion` compatible
- Mantener **100% del diseño visual** (colores, animaciones, layout)
- Mantener **100% de la funcionalidad** (filtros, búsqueda, expansión)

### ❌ NO INCLUYE
- Edición de datos desde estas vistas
- Integración con módulos/bloques (son vistas standalone)
- Cambios en la estructura de BD
- Permisos diferenciados por sector (mostrar todo público)

---

## Arquitectura / Decisiones Técnicas

### Stack
- **Frontend:** React Router v7, Framer Motion (ya instalado)
- **Backend:** Supabase (schema `capacitacion_tm`, tabla `lessons`)
- **Datos:** Tiptap JSON en `lessons.content_json.tiptap`

### Decisiones Clave

**1. Parsing de Tiptap JSON → Excursion[]**
- Lección 1 (excursiones): Lista con estructura clara de títulos + detalles
- Lección 2 (proveedores): Texto + tabla/lista de contactos
- Crear helper `parseExcursionContent()` que extraiga datos de ambas lecciones
- **Falback:** Si JSON no tiene estructura esperada, mostrar mensaje "Contenido no disponible"

**2. Autenticación**
- Rutas serán **públicas** (sin layout alumno requerido)
- Si querés restricción después, agregar `requireUser()` en loader

**3. Caching**
- Usar `loader()` en React Router para fetch desde Supabase
- No usar `useState` + `useEffect` (anti-patrón con loaders)
- Cache automático por React Router

**4. Reutilización de Componentes**
- Copiar ExcursionsViewer.tsx → `components/catalogo/ExcursionsViewer.tsx`
- Copiar ProvidersViewer.tsx → `components/catalogo/ProvidersViewer.tsx`
- Cambiar imports: `EXCURSIONS_DATA` → prop `excursions: Excursion[]`
- Cambiar acceso a `storage.getExcursions()` → pasar datos desde loader

### Flujo de Datos
```
Loader (route) 
  ↓
Supabase query: lessons WHERE (id = lección_excursiones OR id = lección_proveedores)
  ↓
parseExcursionContent(json) → Excursion[]
  ↓
Component <ExcursionsViewer excursions={data} />
  ↓
UI master-detail + filtros
```

---

## Tareas

- [ ] **1. Crear helper de parsing**
  - Archivo: `app/lib/parse-excursions.ts`
  - Función: `parseExcursionContent(tiptapJson: any): Excursion[]`
  - Lógica: Extraer de estructura Tiptap JSON → array de excursiones
  - Test: Validar con contenido cargado en BD

- [ ] **2. Crear route loader**
  - Archivo: `app/routes/catalogo.tsx` (layout wrapper)
  - Archivo: `app/routes/catalogo.excursiones.tsx`
  - Archivo: `app/routes/catalogo.proveedores.tsx`
  - Loader: Query Supabase, parse JSON, return `{ excursions, error }`

- [ ] **3. Adaptar ExcursionsViewer component**
  - Copiar: `components/catalogo/ExcursionsViewer.tsx`
  - Cambios:
    - Remove `useState` / `useEffect` para storage
    - Accept prop `excursions: Excursion[]` del loader
    - Remove import de `storage`
  - Mantener: Filtros, búsqueda, master-detail, animaciones

- [ ] **4. Adaptar ProvidersViewer component**
  - Copiar: `components/catalogo/ProvidersViewer.tsx`
  - Cambios: (mismo que ExcursionsViewer)
    - Accept prop `providers: Excursion[]`
    - Remove storage logic
  - Mantener: Accordion, agrupación alfabética, animaciones

- [ ] **5. Registrar rutas en routes.ts**
  - Agregar layout `catalogo` con ambas rutas
  - Rutas públicas (sin layout alumno/admin)
  - URLs: `/catalogo/excursiones` y `/catalogo/proveedores`

- [ ] **6. Crear página layout catalogo**
  - Archivo: `app/routes/catalogo.tsx`
  - Breadcrumb / navegación entre dos vistas
  - Link: "Catálogo de Excursiones" ↔ "Directorio de Proveedores"

- [ ] **7. Test en browser**
  - Navegar a `/catalogo/excursiones`
  - Verificar: Filtros, búsqueda, master-detail, animaciones
  - Navegar a `/catalogo/proveedores`
  - Verificar: Accordion, agrupación, cards de productos
  - Error handling: Sin datos en BD, sin lesión, etc.

- [ ] **8. Commit + Merge**
  - Branch: `feature/catalogo-excursiones-proveedores`
  - Commit message: `feat: add excursions catalog and providers directory with Supabase data`
  - Merge a `main`

---

## Criterio de Éxito

✅ **Ambas páginas cargan datos de Supabase sin errores**
```
GET /catalogo/excursiones → Muestra ~11 excursiones con detalles
GET /catalogo/proveedores → Muestra ~11 proveedores (agrupados)
```

✅ **Funcionalidad preservada**
- Filtros por categoría (ExcursionsViewer)
- Búsqueda por título + proveedor (ExcursionsViewer)
- Accordion expandible (ProvidersViewer)
- Animaciones suaves (ambas)
- Master-detail layout (ExcursionsViewer)

✅ **Diseño visual idéntico a capacitacion-gral**
- Colores, tipografía, espaciado
- Iconos (Clock, MapPin, Building2, etc.)
- Glows, blur effects, gradientes

✅ **Error handling**
- Sin lecciones en BD → "No hay datos disponibles"
- JSON malformado → Fallback graceful
- Network error → Mostrar error al usuario

---

## Notas / Riesgos

### Dependencias
- ✅ Lecciones de invierno **ya cargadas en BD** (Fase 6)
- ✅ Componentes de capacitacion-gral accesibles
- ✅ Stack (React Router, Framer Motion) ya en proyecto

### Riesgos
- **Parsing JSON:** Estructura Tiptap puede ser compleja. Solución: Inspeccionar BD, crear parser robusto con fallbacks
- **Performance:** Si JSON es muy grande, podría ser lento. Solución: Lazy-load o paginar
- **Cambios futuros:** Si lecciones se editan, estructura Tiptap puede cambiar. Solución: Documentar formato esperado

### Decisiones Pendientes
- ¿Mostrar en menú principal? (sidebar alumno/admin)
- ¿Permisos por sector (B1, VR, VP)?
- ¿Integración con búsqueda de Sofía IA?

---

## Próximos Pasos Post-Aprobación

1. Inspeccionar contenido Tiptap JSON en BD (query Supabase directamente)
2. Diseñar parser robusto
3. Crear branch feature
4. Implementar paso a paso (tasks 1-8)
5. Test exhaustivo
6. Commit + merge

**¿Aprobado para proceder?**
