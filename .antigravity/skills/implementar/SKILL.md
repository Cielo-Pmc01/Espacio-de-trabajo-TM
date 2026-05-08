# implementar

## Descripción

Ejecuta un plan de implementación ya creado en `planes/`, siguiendo paso a paso y actualizando el progreso.

## Cuándo usar

- Cuando tienes un plan listo y quieres ejecutarlo
- Para trabajar paso a paso en una tarea estructurada
- Cuando necesitas seguimiento del progreso

## Parámetros

- **plan** (opcional): Nombre del archivo de plan a implementar
- Si no se especifica, se listarán los planes disponibles

## Instrucciones

1. Listar todos los archivos `.md` en `planes/`
2. Si no hay planes, sugerir crear uno con /crear-plan
3. Si hay múltiples planes, pedir selección al usuario
4. Leer contenido completo del plan seleccionado
5. Extraer:
   - Objetivo
   - Lista de pasos
   - Criterios de éxito
   - Entregables
   - Contexto relevante
6. Para cada paso no completado:
   - Mostrar paso actual
   - Leer contexto adicional si es necesario
   - Ejecutar la acción
   - Marcar como completado actualizando el archivo
   - Preguntar si continuar con siguiente paso
7. Verificar criterios de éxito al finalizar

## Formato de salida

```markdown
## Implementando: [Nombre del plan]

**Progreso:** [X/Y] pasos completados

### Paso actual: [N] - [Descripción]

[Acciones realizadas]

**Estado:** ✅ Completado

---
**Siguiente paso:** [Descripción o "Plan completado"]
```

## Ejemplo de uso

```
/implementar plan:"2026-05-07-campana-invierno.md"
```

O escribe: "Implementa el plan de [nombre]"
