# /cerrar — Cierre de Sesión con Actualización de Memoria

Ejecuta este comando al final de una sesión productiva para que la memoria persistente quede sincronizada con lo que realmente trabajamos.

## Cuándo usarlo

- Después de implementar/avanzar un proyecto significativo
- Cuando se tomaron decisiones que cambian el estado de algo
- Cuando se aprendieron preferencias nuevas de Cielo
- Antes de cerrar una sesión larga

## Pasos Obligatorios

### 1. Repasar lo trabajado en esta sesión

- Revisar `git log --oneline` y `git status` del workspace y de cualquier `salidas/<proyecto>/`
- Listar archivos modificados / creados
- Identificar proyectos tocados (capacitacion-tm, app-invierno, crm-meta-ads, etc.)
- Identificar decisiones, preferencias o feedback explícito del usuario

### 2. Mapear contra la memoria existente

Para cada cosa trabajada:

1. Leer el `MEMORY.md` index
2. Buscar memoria existente del proyecto/tema
3. Leer el archivo de memoria correspondiente
4. Comparar con lo que se trabajó: ¿qué quedó obsoleto, qué falta, qué cambió?

### 3. Proponer actualizaciones a Cielo

Presentar un resumen en formato:

```
📝 Memorias a actualizar:

1. project_capacitacion_tm.md
   - Estado actual dice: "Fase 5 en desarrollo"
   - Realidad: "Fase 6 con Sofía IA + RAG"
   - Cambio propuesto: actualizar sección Estado

2. project_workspace_overview.md (>14 días sin tocar)
   - Reescritura completa basada en datos actuales
```

Si hay memorias nuevas que crear, listarlas también:
```
📝 Memorias a crear:
- feedback_<tema>.md — porque Cielo expresó preferencia X
- project_<nuevo-proyecto>.md — porque arrancamos Y
```

Pedir confirmación: ¿qué actualizar, qué crear, qué dejar?

### 4. Aplicar los cambios aprobados

- Actualizar el cuerpo de los archivos de memoria
- Renovar la fecha en cualquier `**Última actualización:**` que tengan
- Crear nuevos archivos siguiendo el formato definido en CLAUDE.md (frontmatter con `name`, `description`, `metadata.type`)
- Si se crearon/renombraron archivos, actualizar el índice `MEMORY.md`

### 5. Reportar el cierre

Resumen final breve:
- Qué memorias se actualizaron
- Qué memorias se crearon
- Si quedaron pendientes que vale la pena trackear

## Reglas

- **No inventar.** Solo actualizar lo que realmente cambió o se aprendió en esta sesión.
- **Verificar antes.** Antes de marcar algo como "completo" en una memoria, confirmar con el código/los archivos actuales.
- **Pedir confirmación.** Nunca escribir memorias sin que Cielo apruebe el contenido.
- **Concisión.** Las memorias deben ser hooks útiles, no documentación exhaustiva. El detalle vive en los archivos del proyecto.

## Criterio de Éxito

Al iniciar la próxima sesión, `MEMORY.md` y las memorias individuales reflejan fielmente el estado del workspace y de las preferencias de Cielo, sin requerir re-explicación.
