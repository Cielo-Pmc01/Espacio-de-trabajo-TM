---
description: Ejecutar un plan de implementación existente
---

# /implementar - Ejecutar plan existente

## Propósito

Ejecutar un plan de implementación ya creado en `planes/`, siguiendo los pasos definidos y actualizando el progreso.

## Instrucciones para el asistente

1. **Listar planes disponibles**
   - Buscar todos los archivos `.md` en `planes/`
   - Mostrar lista numerada con:
     - Nombre del archivo
     - Estado (extraer de contenido si existe)
     - Fecha de creación

2. **Seleccionar plan**
   - Si hay múltiples planes: "¿Qué plan deseas implementar? (número o nombre)"
   - Si hay uno solo: ofrecer implementarlo directamente
   - Si no hay planes: informar y sugerir usar `/crear-plan` primero

3. **Leer el plan seleccionado**
   - Leer contenido completo del archivo
   - Extraer:
     - Objetivo
     - Lista de pasos
     - Criterios de éxito
     - Entregables
     - Contexto relevante (archivos a revisar)

4. **Ejecutar paso a paso**
   - Para cada paso pendiente:
     1. Mostrar el paso actual
     2. Verificar si se necesita leer contexto adicional
     3. Ejecutar la acción requerida
     4. Marcar como completado en el archivo
     5. Preguntar: "¿Continuar con el siguiente paso?"

5. **Actualizar el plan**
   - Marcar pasos completados
   - Actualizar estado general si se completan todos los pasos
   - Registrar cualquier desviación o nota importante

6. **Verificar criterios de éxito**
   - Al finalizar: revisar si se cumplieron todos los criterios
   - Listar entregables generados

## Formato de salida esperado

```
## Implementando: [Nombre del plan]

**Progreso:** [X/Y] pasos completados

### Paso actual: [N] - [Descripción del paso]

[Acciones ejecutadas]

---
**Estado actualizado:** ✅ Completado / ⏳ En progreso

**Próximo paso:**
[Descripción siguiente paso o mensaje de completado]
```

// turbo - Este comando puede ejecutarse automáticamente
