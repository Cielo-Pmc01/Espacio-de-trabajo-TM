# flujo

## Descripción

Crea un nuevo workflow/skill para automatizar tareas repetitivas o estandarizar procesos.

## Cuándo usar

- Cuando identificas una tarea que haces frecuentemente
- Para estandarizar procesos en el equipo
- Para crear herramientas reutilizables

## Parámetros

- **tarea** (requerido): Descripción de la tarea a automatizar
- **frecuencia** (opcional): qué tan seguido se usa (alta, media, baja)
- **pasos** (opcional): Pasos específicos a incluir

## Instrucciones

1. Preguntar qué tarea quiere automatizar
2. Preguntar frecuencia de uso
3. Preguntar si hay pasos específicos requeridos
4. Diseñar workflow:
   - Nombre del comando (ej: /generar-reporte)
   - Descripción clara del propósito
   - Instrucciones paso a paso para el asistente
   - Formato de salida esperado
5. Determinar ubicación según IDE objetivo:
   - **Windsurf**: `.windsurf/workflows/[nombre].md`
   - **Claude Code**: `.claude/commands/[nombre].md`
   - **Antigravity**: `.antigravity/skills/[nombre]/SKILL.md`
6. Crear archivo con formato apropiado
7. Mostrar confirmación y explicar cómo usar el nuevo comando

## Template por plataforma

**Windsurf:**
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

**Antigravity:**
```markdown
# [nombre]

## Descripción
[descripción]

## Cuándo usar
[contexto de uso]

## Parámetros
[parametros]

## Instrucciones
[pasos detallados]

## Formato de salida
[ejemplo]

## Ejemplo de uso
[ejemplo]
```

## Formato de salida

```markdown
## Workflow creado: /[nombre] ✅

**Ubicación:** `[ruta-al-archivo]`

**Descripción:** [Breve descripción]

**Uso:**
Escribe `/[nombre]` para ejecutar este flujo.

**Pasos incluidos:**
1. [Paso 1]
2. [Paso 2]
...
```

## Ejemplo de uso

```
/flujo tarea:"Generar reporte mensual de campañas" frecuencia:media
```

O escribe: "Crea un workflow para [descripción de tarea]"
