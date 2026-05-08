# flujo - Crear nuevo workflow

## Descripción

Crea un nuevo workflow para automatizar tareas repetitivas o estandarizar procesos.

## Instrucciones

1. Preguntar:
   - "¿Qué tarea quieres automatizar?"
   - "¿Frecuencia de uso?"
   - "¿Pasos específicos a seguir?"

2. Diseñar workflow:
   - Nombre del comando
   - Descripción del propósito
   - Pasos del asistente
   - Formato de salida

3. Crear archivo en `.windsurf/workflows/[nombre].md` o `.claude/commands/[nombre].md`

## Template

```markdown
---
description: [descripción corta]
---

# /[nombre] - [título]

## Propósito
[descripción]

## Instrucciones
1. [paso 1]
2. [paso 2]

## Formato de salida
[ejemplo]

// turbo (opcional)
```
