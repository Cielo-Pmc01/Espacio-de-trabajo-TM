# crear-plan - Crear plan de implementación

## Descripción

Crea un plan de implementación estructurado en la carpeta `planes/` con objetivo claro, pasos detallados y criterios de éxito.

## Instrucciones

1. Preguntar al usuario:
   - "¿Cuál es el objetivo de este plan?"
   - "¿Hay contexto específico que deba revisar?"
   - "¿Cuál es el plazo o fecha objetivo?"

2. Crear un archivo en `planes/` con nombre: `YYYY-MM-DD-nombre-del-plan.md`

3. Usar este template:

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

4. Confirmar con el usuario antes de crear el archivo
5. Crear el archivo y mostrar confirmación
