# Plan: Actualizar App Capacitación General

**Creado:** 2026-04-29
**Estado:** Borrador
**Pedido:** Cargar y actualizar la carpeta de app-capacitacion-gral (enfocado en corregir el juego drag & drop y actualizar contenidos).

---

## Descripción General

### Qué Logra Este Plan

Este plan aborda las deudas técnicas y funcionales reportadas en `datos-actuales.md` para la aplicación de capacitación general. Principalmente, implementa el bloque de juego **Drag & Drop** en el Módulo 2, agrega soporte para videos de YouTube y prepara la estructura para futuras integraciones.

### Por Qué Importa

La aplicación es la herramienta principal para onbordear vendedores. Tener juegos interactivos mejora la retención del conocimiento. Corregir el error del Módulo 2 es crítico para que los vendedores puedan completar su capacitación de forma autónoma.

---

## Estado Actual

### Estructura Existente Relevante

- `salidas/app-capacitacion-gral/components/BlockViewer.tsx`: Renderiza los bloques actuales (`reading`, `protocols`, `cards`).
- `salidas/app-capacitacion-gral/lib/data/modules.ts`: Contiene la data hardcodeada de los módulos.
- `salidas/app-capacitacion-gral/lib/types/index.ts`: Define las interfaces de `Block` y `Module`.

### Brechas o Problemas que se Abordan

- ❌ **Juego Drag & Drop**: Módulo 2 requiere este juego pero no existe en el código o no funciona.
- ❌ **Videos**: Faltan links de YouTube en los bloques.
- ❌ **Estructura**: El tipo de bloque `drag-drop` no está definido.

---

## Cambios Propuestos

### Resumen de Cambios

- Actualizar interfaces en `lib/types/index.ts` para soportar nuevos tipos de bloques y videos.
- Implementar componente `DragDropGame.tsx` para la interactividad.
- Modificar `BlockViewer.tsx` para integrar el nuevo componente.
- Actualizar `lib/data/modules.ts` con el contenido del juego y links de video.

### Nuevos Archivos a Crear

| Ruta del Archivo  | Propósito                          |
| ----------------- | ---------------------------------- |
| `components/DragDropGame.tsx` | Componente interactivo para ordenar elementos por arrastre. |

### Archivos a Modificar

| Ruta del Archivo  | Cambios                      |
| ----------------- | ---------------------------- |
| `lib/types/index.ts` | Agregar tipo `'drag-drop'` a `Block` y propiedad `videoUrl`. |
| `lib/data/modules.ts` | Agregar el bloque de juego al Módulo 2 y placeholders de videos. |
| `components/BlockViewer.tsx` | Agregar case en `renderContent` para manejar `drag-drop`. |

---

## Decisiones de Diseño

### Decisiones Clave Tomadas

1. **Implementación Custom de Drag & Drop**: Dado que el proyecto es liviano y no tiene librerías pesadas, usaré la API nativa de HTML5 o una implementación simple con eventos de mouse/touch para evitar agregar dependencias como `dnd-kit` a menos que sea estrictamente necesario.
2. **Soporte de Video**: Se agregará un campo `videoUrl` a los bloques para que `BlockViewer` renderice un iframe de YouTube si está presente.

---

## Tareas Paso a Paso

### Paso 1: Actualizar Tipos y Data

**Acciones:**

- Modificar `lib/types/index.ts` para incluir el tipo `'drag-drop'`.
- Modificar `lib/data/modules.ts` para agregar un bloque de juego al Módulo 2 (ej. "Ordenar los pasos del Protocolo de Venta").

**Archivos afectados:**
- `salidas/app-capacitacion-gral/lib/types/index.ts`
- `salidas/app-capacitacion-gral/lib/data/modules.ts`

---

### Paso 2: Crear Componente DragDropGame

**Acciones:**

- Crear `components/DragDropGame.tsx`.
- Implementar la lógica de arrastrar elementos de una lista a una zona de ordenamiento.
- Validar si el orden es correcto y mostrar feedback.

**Archivos afectados:**
- `salidas/app-capacitacion-gral/components/DragDropGame.tsx`

---

### Paso 3: Integrar en el Visualizador

**Acciones:**

- Modificar `components/BlockViewer.tsx` para importar y renderizar `DragDropGame` cuando el tipo de bloque coincida.
- Agregar renderizado de video de YouTube sobre el contenido del bloque si `videoUrl` está presente.

**Archivos afectados:**
- `salidas/app-capacitacion-gral/components/BlockViewer.tsx`

---

## Lista de Validación

- [ ] El bloque de Módulo 2 carga el juego correctamente.
- [ ] Es posible arrastrar y soltar elementos (o seleccionarlos en orden).
- [ ] Se muestra un mensaje de "¡Correcto!" al completar el orden.
- [ ] Los videos de YouTube se visualizan si se agrega la URL.

---

## Criterios de Éxito

1. El Módulo 2 tiene un bloque funcional de "Juego de Ordenamiento".
2. No hay errores de consola al navegar por los módulos.
3. La interfaz sigue la estética premium de la aplicación.
