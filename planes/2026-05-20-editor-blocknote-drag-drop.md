# Plan: Editor Drag & Drop tipo Notion con BlockNote

**Fecha:** 2026-05-20  
**Estado:** Completado  
**Proyecto:** salidas/app-capacitacion-gral

---

## Contexto y Justificación

El editor actual de la app de capacitación (`AdminContent.tsx`, 2020 líneas) es un sistema custom homemade con 3 tipos de secciones fijas: texto, cuadro de alerta y lista de pasos. No permite reordenar secciones, ni tiene formato inline (negritas, cursivas, encabezados) fuera del modo HTML.

Cielo necesita un editor más flexible tipo Notion donde pueda:
- Arrastrar y reordenar bloques de contenido
- Escribir con formato completo (H2, H3, bold, italic, listas)
- Agregar distintos tipos de bloques según el contenido de cada lección

Impacto directo: permite cargar contenido de capacitación más rápido y con mejor estructura sin depender del modo HTML.

---

## Alcance

**Incluye:**
- Instalar BlockNote y configurarlo para Next.js 16 / React 19
- Reemplazar el editor visual de secciones en tipo `reading`
- Reemplazar el editor de contenido de cada tarjeta en tipo `protocols`
- Reemplazar el editor en tipo `cards`
- Actualizar el LessonViewer para renderizar contenido BlockNote
- Compatibilidad con contenido HTML existente (no se pierde nada)

**No incluye:**
- Cambiar la estructura de módulos/bloques
- Cambiar el tipo `excursions_catalog` ni `providers_directory`
- Migración forzada del contenido antiguo (se mantiene HTML legacy)

---

## Arquitectura / Decisiones Técnicas

### BlockNote
- Librería: `@blocknote/core` + `@blocknote/react` + `@blocknote/mantine`
- Editor de bloques open source basado en Tiptap/ProseMirror
- Drag and drop nativo entre bloques
- Formato completo: H1-H3, bold, italic, listas, citas
- Guarda en JSON (array de bloques)

### Formato de storage
El campo `Block.content` y `BlockItem.content` actualmente guardan HTML string. Con BlockNote guardarán **JSON string** (serializado con `JSON.stringify`).

Detección automática del formato:
```typescript
const isBlockNoteContent = (content: string) => {
  try { 
    const parsed = JSON.parse(content);
    return Array.isArray(parsed);
  } catch { return false; }
}
```
- Si el contenido es JSON array → renderizar con BlockNote
- Si el contenido es HTML string → renderizar con dangerouslySetInnerHTML (legacy)

Esto garantiza que todo el contenido existente sigue funcionando sin migración.

### Componente nuevo
Crear `components/admin/BlockEditor.tsx` — componente reutilizable que envuelve BlockNote:
- Recibe `content: string` (JSON o HTML) y `onChange: (content: string) => void`
- Si recibe HTML legacy, lo convierte a bloque de texto plano para editar
- Al guardar, serializa a JSON string

---

## Tareas

- [x] 1. **Instalar dependencias** — `npm install @blocknote/core @blocknote/react @blocknote/mantine @mantine/core @mantine/hooks`

- [x] 2. **Verificar compatibilidad** — Configurado con dynamic import `ssr: false` para Next.js 16 / React 19.

- [x] 3. **Crear `components/admin/BlockEditor.tsx`** — Componente wrapper con:
  - Inicialización de BlockNote con tema oscuro (para coincidir con el diseño actual)
  - Detección automática HTML vs JSON en el prop `content`
  - Conversión de HTML legacy a texto plano al cargar
  - `onChange` que serializa a JSON string

- [x] 4. **Integrar en `AdminContent.tsx` — tipo `reading`** — Reemplazado el editor visual de secciones por `<BlockEditor>`. Se mantiene el tab "Código HTML" como fallback.

- [x] 5. **Integrar en `AdminContent.tsx` — tipo `protocols`** — `<BlockEditor>` integrado en el campo de contenido de cada protocolo.

- [x] 6. **Integrar en `AdminContent.tsx` — tipo `cards`** — `<BlockEditor>` integrado en el campo de contenido de cada tarjeta.

- [x] 7. **Actualizar `BlockViewer`** — Renderiza BlockNote JSON con `BlockNoteRenderer`. Contenido HTML legacy sigue funcionando con `dangerouslySetInnerHTML`.

- [x] 8. **Prueba funcional** — Verificar en el navegador:
  - Crear una lección nueva con el editor BlockNote
  - Arrastrar y reordenar bloques
  - Guardar y recargar (persistencia)
  - Verificar que una lección con contenido HTML antiguo sigue mostrándose correctamente

---

## Criterio de Éxito

- El editor de tipo `reading` muestra BlockNote con drag and drop funcional
- Se puede escribir texto, H2, H3, listas, negritas con el editor visual
- Los bloques se pueden reordenar arrastrando
- El contenido nuevo se guarda correctamente y se muestra en el LessonViewer
- El contenido HTML existente no se rompe (sigue visible en el viewer)
- El modo "Código HTML" sigue disponible como opción avanzada

---

## Notas / Riesgos

- **React 19:** BlockNote puede tener peers warnings con React 19. Verificar en la tarea 2. Si hay problemas, usar `--legacy-peer-deps` en el install.
- **SSR:** BlockNote usa APIs del browser, necesita `dynamic(() => import(...), { ssr: false })` en Next.js para evitar errores de hidratación.
- **Mantine:** BlockNote requiere Mantine como peer dependency para los estilos. Agregar `MantineProvider` solo en el contexto del admin para no afectar el resto de la app.
- **Tamaño del bundle:** BlockNote agrega ~150KB al bundle del admin. Aceptable dado que el admin no es público.
- **Contenido existente:** No hay migraciones automáticas. El HTML legacy se mantiene tal cual en la base de datos/localStorage hasta que alguien edite la lección con el nuevo editor.
