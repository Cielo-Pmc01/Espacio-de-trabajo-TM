---
description: Crear un plan de implementación estructurado
---

# /crear-plan - Crear plan de implementación

## Propósito

Crear un plan de implementación estructurado en la carpeta `planes/` con:
- Objetivo claro
- Pasos detallados
- Criterios de éxito
- Estructura de entrega

## Instrucciones para el asistente

1. **Recopilar información**
   - Preguntar al usuario: "¿Cuál es el objetivo de este plan?"
   - Preguntar: "¿Hay algún contexto específico que deba revisar?"
   - Preguntar: "¿Cuál es el plazo o fecha objetivo?"

2. **Estructurar el plan**
   Crear un archivo en `planes/` con el formato:
   - Nombre: `YYYY-MM-DD-nombre-del-plan.md`
   - Template base:

```markdown
# Plan: [Título]

**Fecha de creación:** YYYY-MM-DD  
**Estado:** [pendiente | en progreso | completado]  
**Prioridad:** [alta | media | baja]

## Objetivo

[Descripción clara del objetivo]

## Contexto relevante

- [Archivos de contexto a revisar]
- [Información de negocio necesaria]

## Pasos de implementación

1. [Paso 1 con descripción detallada]
2. [Paso 2 con descripción detallada]
3. [Paso 3...]

## Criterios de éxito

- [ ] [Criterio 1 - medible/verificable]
- [ ] [Criterio 2]
- [ ] [Criterio 3]

## Entregables

- [ ] [Archivo/salida esperada 1]
- [ ] [Archivo/salida esperada 2]

## Notas

[Información adicional, riesgos, dependencias]
```

3. **Confirmar y crear**
   - Mostrar estructura propuesta al usuario
   - Confirmar antes de crear el archivo
   - Crear el archivo con el nombre apropiado

## Formato de salida esperado

```
## Plan creado: [Nombre del plan]

**Ubicación:** `planes/YYYY-MM-DD-nombre-del-plan.md`

**Resumen:**
- Objetivo: [descripción]
- Pasos: [N] pasos definidos
- Entregables: [lista]

**Próximo paso:**
¿Deseas comenzar a implementar este plan ahora? (usa /implementar)
```

// turbo - Este comando puede ejecutarse automáticamente
