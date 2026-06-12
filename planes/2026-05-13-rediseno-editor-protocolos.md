# Rediseño del Editor de Protocolos — App Capacitación General

**Fecha:** 2026-05-13
**Proyecto:** `salidas/app-capacitacion-gral/`
**Archivo a tocar:** `components/admin/AdminContent.tsx` (líneas ~1041-1395)
**Rama base:** `feature/mejorar-editor-protocolos`

---

## Contexto

El editor visual de protocolos del admin (módulo "Protocolos Operativos") está construido con cards anidadas de 6 niveles: módulo → bloque → editor → "contenido visual" → sección (párrafo/alerta/lista) → inputs internos. Cada nivel agrega su propio border y padding, generando sensación de "cuadrado dentro de cuadrado".

Diagnóstico de Cielo:
- "Cuadrado adentro de cuadrado"
- Falta dinamismo
- No se ve profesional / "parece hecho con IA"

## Objetivo

Reescribir la zona del editor de tarjetas (la parte central, no la lista de protocolos a la izquierda ni la vista previa a la derecha) con dos propuestas alternativas. Cielo prueba ambas en vivo y elige cuál se queda en producción.

**Lo que se conserva:**
- Layout exterior de 3 columnas (Lista | Editor | Preview)
- Vista previa en vivo a la derecha (es excelente)
- Modelo de datos (`item.title`, `item.id`, `item.content`, `item.files`, `protocolSections[]`)
- Funcionalidad de modo "Editar HTML"
- Archivos descargables (gestor de archivos abajo)

**Lo que se reemplaza:**
- Solo la sección "Contenido Visual de la Tarjeta" (líneas 1088-1205 actuales)
- Posiblemente "Configuración Básica" del header (Título + ID) si se gana mucho con eso

## Principios Comunes a Ambos Estilos

1. **Sin cards anidadas.** Las secciones se separan con aire y un slim accent strip de 2-3px a la izquierda, NO con border completo.
2. **Tipografía hace la jerarquía**, no los bordes. Headers de sección en peso 700, contenido en peso 400, etiquetas en peso 500 con color text2.
3. **Inputs sin border por defecto**, solo `border-bottom` que se enciende al focus. Ahorra ruido visual.
4. **Iconos Lucide consistentes** (`FileText`, `AlertTriangle`, `List`, `MoreVertical`, `GripVertical`). Eliminar emojis decorativos del editor.
5. **Acciones contextuales al hover.** Botón borrar / mover no visible hasta hover en la fila.
6. **Microinteracciones.** Transiciones de 150-200ms en hover, focus, expand/collapse.
7. **Espaciado generoso.** Mínimo 1.5rem entre secciones, 0.875rem entre campos.
8. **Color con propósito.** Sky/orange/green solo en accent strip e iconos, no en backgrounds tintados.

---

## Variante A — Formulario Premium (Typeform/Tally-like)

**Idea:** una sección expandida y editable a la vez. Las demás colapsadas a una línea (preview del título). Click en una colapsada → expande con transición suave, colapsa la anterior. Navegación tipo "documento enfocado".

### Layout

```
Protocolo de Ingreso                               ⋮
 ay2-b1-ingreso                              ←editable inline
 ─────────────────────────────────────────────────

 ▸ ALERTA · Toma de Conciencia y Responsabilidad    1 / 7

 ▾ PÁRRAFO · Revisión de Celulares                  2 / 7
 ┃
 ┃   Verificá que el dispositivo esté encendido,
 ┃   con el sonido activado, las notificaciones
 ┃   habilitadas al 100% y una conexión Wi-Fi/datos
 ┃   móviles sumamente estable.
 ┃
 ┃                                      [Quitar] [✓]

 ▸ PÁRRAFO · Control de WhatsApp Business           3 / 7
 ▸ PÁRRAFO · Confirmación de Ingreso                4 / 7
 ─────────────────────────────────────────────────

      ⊕  Agregar bloque
         Párrafo  ·  Alerta  ·  Lista
```

### Características técnicas

- Estado `expandedSectionIdx: number | null` (solo una expandida a la vez)
- Secciones colapsadas: una sola fila clickeable, altura ~44px, muestra: ícono tipo · título (o "Sin título") · contador "N / total"
- Sección expandida: padding generoso, textareas grandes con auto-resize, fuente 0.95rem para contenido, line-height 1.7
- Accent strip izquierdo de 3px del color del tipo (sky/orange/green)
- Transición de expand: 200ms ease-out con `max-height` o framer-motion
- Botón "Agregar bloque" al final, con tipo seleccionable inline (3 opciones en una sola fila)
- Header "ALERTA · Color" — el color es una row de pills clickeables (no select)

### Ventajas
- Foco único: editás una cosa a la vez, sin distracción
- Se siente premium, "como editar en una herramienta seria"
- Funciona bien para protocolos largos (7+ secciones)

### Desventajas
- Click extra para editar una sección
- Comparar 2 secciones requiere expandir-colapsar
- Más estado a manejar

---

## Variante B — Dashboard Moderno (Linear/Stripe-like)

**Idea:** todas las secciones visibles simultáneamente, en columna fluida con whitespace generoso. Sin cards. Solo separación por aire y accent strip. Acciones aparecen al hover.

### Layout

```
Protocolo de Ingreso                            Guardar  ⋮
ay2-b1-ingreso

──────────────────────────────────────────────────────────


┃ ALERTA   Celeste                          [edit] [del]
┃
┃ Toma de Conciencia y Responsabilidad
┃
┃ El teléfono celular es tu herramienta principal
┃ de trabajo. De su correcto funcionamiento depende
┃ la comunicación con nuestros clientes, el
┃ seguimiento de reservas y el rendimiento...


┃ PÁRRAFO                                   [edit] [del]
┃
┃ Revisión de Celulares
┃
┃ Verificá que el dispositivo esté encendido,
┃ con el sonido activado, las notificaciones
┃ habilitadas al 100%...


┃ PÁRRAFO                                   [edit] [del]
┃
┃ Control de WhatsApp Business
┃ ...


──────────────────────────────────────────────────────────

  ⊕  Nuevo bloque       Párrafo  ·  Alerta  ·  Lista
```

### Características técnicas

- Sección = accent strip de 2-3px a la izquierda + padding generoso (1.5rem) + sin border ni background
- Header de sección: tipo en uppercase peso 700 letterspacing wide (Linear style)
- Inputs invisibles: el título y contenido se ven como texto editable inline (similar a Notion). `border: none; background: transparent;` por default
- Al focus en un input: `border-bottom: 2px solid C.sky` aparece con transición
- Acciones (editar / borrar / mover ▲▼) flotantes a la derecha, opacity: 0 → 1 al hover en la sección
- Separador entre secciones: 2.5rem de aire (sin línea visible)
- Color en select de tipo de alerta: chips/pills clickeables horizontales en vez de dropdown
- Toolbar "Nuevo bloque" en una sola fila al final

### Ventajas
- Todo visible de un vistazo, ideal para revisión rápida
- Se siente "developer-tool-like" (Linear, Stripe)
- Sin clicks extra para editar
- Menos estado, más simple

### Desventajas
- Si el protocolo tiene 15 secciones, mucho scroll
- Menos foco en una sección particular

---

## Plan de Ejecución

### Fase 1 — Implementar Variante A (Formulario Premium)
- [ ] Crear branch desde rama actual: ya estamos en `feature/mejorar-editor-protocolos`
- [ ] Reemplazar líneas 1088-1205 de `AdminContent.tsx` con la implementación de Variante A
- [ ] Agregar estado `expandedSectionIdx` al componente
- [ ] Importar iconos Lucide adicionales: `FileText`, `AlertTriangle`, `List`, `GripVertical`, `MoreVertical`, `ChevronDown`, `ChevronRight`
- [ ] Implementar collapse/expand con transición CSS (`max-height` + `opacity`)
- [ ] Eliminar emojis del editor (mantener en vista previa que es output)
- [ ] Migrar select de tipo de cuadro a pills clickeables
- [ ] Type-check con `npx tsc --noEmit`
- [ ] Levantar dev server y probar visualmente:
  - Crear protocolo nuevo
  - Agregar 3 secciones distintas
  - Expandir/colapsar
  - Borrar una sección
  - Verificar que la vista previa actualiza en vivo

### Fase 2 — Decisión de Cielo
- Cielo prueba Variante A
- Si le gusta: merge a `main`, fin del plan
- Si quiere comparar con B: pasamos a Fase 3

### Fase 3 — Implementar Variante B en rama paralela
- [ ] Crear branch `feature/editor-dashboard-moderno` desde el commit anterior a Variante A (para que Variante B parta del editor original, no del A)
- [ ] Implementar Variante B con los mismos cambios estructurales pero distinto layout
- [ ] Type-check + dev server
- [ ] Cielo prueba B
- [ ] Cielo decide cuál merge

### Verificación Final
- [ ] El protocolo "Protocolo de Ingreso" del Bloque 1 se ve correctamente
- [ ] Crear protocolo nuevo → agregar 3 secciones (párrafo + alerta + lista) → guardar
- [ ] Recargar la página → datos se mantienen
- [ ] La vista previa de la derecha se actualiza en vivo
- [ ] El modo "Editar HTML" sigue funcionando
- [ ] El gestor de archivos descargables sigue funcionando
- [ ] No hay errores de TypeScript
- [ ] No hay warnings nuevos en consola del navegador

---

## Archivos a Tocar

| Archivo | Cambio |
|---------|--------|
| `components/admin/AdminContent.tsx` | Reemplazo de líneas ~1088-1205 (editor visual de secciones). Posible agregado de estado local `expandedSectionIdx`. |

No se tocan: `BlockViewer.tsx` (output), `AdminPanel.tsx` (estilos globales), modelo de datos (`item.content`, `protocolSections`).

## Riesgos

- **Auto-resize de textareas:** si el contenido es muy largo, el editor puede crecer indefinidamente. Mitigación: `maxHeight: 400px` con scroll interno.
- **Pérdida de funcionalidad del modo HTML:** asegurar que el botón "Editar HTML" sigue accesible y funcional.
- **Compatibilidad con datos existentes:** los protocolos ya cargados (B1) usan el formato de secciones actual. Verificar que se renderizan correctamente al cargar.

## Notas

- Mantener el dev server corriendo durante la implementación para iteración rápida.
- Tomar capturas al final de cada variante para que Cielo compare lado a lado.
- Si Cielo elige Variante A pero quiere algo de B (ej: pills de color), se hace cherry-pick puntual.
