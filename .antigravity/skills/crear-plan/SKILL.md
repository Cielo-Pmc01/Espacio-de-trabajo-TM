# crear-plan

## Descripción

Crea un plan de implementación estructurado en la carpeta `planes/` para organizar cambios importantes.

## Cuándo usar

- Antes de iniciar un cambio significativo
- Para estructurar tareas complejas
- Cuando necesitas documentar objetivos y criterios de éxito

## Parámetros

- **objetivo** (requerido): Descripción clara del objetivo del plan
- **contexto** (opcional): Archivos de contexto relevantes a revisar
- **plazo** (opcional): Fecha objetivo de completitud
- **prioridad** (opcional): alta, media o baja (default: media)

## Instrucciones

1. Preguntar por el objetivo del plan
2. Preguntar si hay contexto específico a revisar
3. Preguntar por plazo y prioridad
4. Crear archivo en `planes/YYYY-MM-DD-nombre-del-plan.md`
5. Usar template estructurado:

```markdown
# Plan: [Título]

**Fecha:** YYYY-MM-DD  
**Estado:** pendiente  
**Prioridad:** [alta|media|baja]

## Objetivo
[Descripción clara]

## Contexto
- [Archivos relevantes]

## Pasos
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## Criterios de éxito
- [ ] [Criterio 1]
- [ ] [Criterio 2]

## Entregables
- [ ] [Entregable 1]
- [ ] [Entregable 2]

## Notas
[Información adicional]
```

6. Confirmar con usuario antes de crear
7. Crear archivo y mostrar confirmación

## Ejemplo de uso

```
/crear-plan objetivo:"Crear campaña de invierno para TM" contexto:"contexto/marcas/tm.md" prioridad:alta
```

O escribe: "Crea un plan para [descripción]"
