# implementar - Ejecutar plan existente

## Descripción

Ejecuta un plan de implementación ya creado en `planes/`, siguiendo los pasos definidos y actualizando el progreso.

## Instrucciones

1. Listar todos los archivos `.md` en `planes/`
2. Si hay múltiples planes, pedir al usuario que seleccione uno
3. Leer el contenido completo del plan seleccionado
4. Identificar el paso actual (primer paso no completado)
5. Para cada paso:
   - Mostrar el paso actual
   - Leer contexto adicional si es necesario
   - Ejecutar la acción
   - Marcar como completado actualizando el archivo
   - Preguntar si continuar con el siguiente paso
6. Al finalizar, verificar criterios de éxito y entregables

## Formato de salida

```markdown
## Implementando: [Nombre del plan]

**Progreso:** [X/Y] pasos completados

### Paso actual: [N] - [Descripción]

[Acciones realizadas]

**Estado:** ✅ Completado
```
