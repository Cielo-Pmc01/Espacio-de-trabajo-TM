---
description: Crear nuevos workflows para automatizar tareas repetitivas
---

# /flujo - Crear nuevo workflow

## Propósito

Crear un nuevo workflow (archivo `.md`) en `.windsurf/workflows/` para automatizar una tarea repetitiva o estandarizar un proceso.

## Instrucciones para el asistente

1. **Recopilar requisitos**
   - Preguntar: "¿Qué tarea quieres automatizar?"
   - Preguntar: "¿Con qué frecuencia harás esta tarea?"
   - Preguntar: "¿Hay pasos específicos que deba seguir?"

2. **Diseñar el workflow**
   - Nombre del comando (ej: `/generar-reporte`, `/revisar-seo`)
   - Descripción clara del propósito
   - Pasos que el asistente debe seguir
   - Formato de salida esperado

3. **Crear el archivo**
   - Ubicación: `.windsurf/workflows/[nombre].md`
   - Formato YAML frontmatter + markdown
   - Incluir `// turbo` si el comando puede ejecutarse automáticamente

4. **Template de workflow**

```markdown
---
description: [Breve descripción del propósito]
---

# /[nombre-comando] - [Título descriptivo]

## Propósito

[Descripción de qué hace este comando]

## Instrucciones para el asistente

1. [Paso 1 con detalles]
2. [Paso 2 con detalles]
3. [Paso 3...]

## Formato de salida esperado

```
[Ejemplo de cómo debe verse la salida]
```

// turbo - Este comando puede ejecutarse automáticamente (opcional)
```

5. **Probar y documentar**
   - Explicar cómo usar el nuevo comando
   - Sugerir alias o atajos si aplica

## Formato de salida esperado

```
## Workflow creado: /[nombre-comando] ✅

**Ubicación:** `.windsurf/workflows/[nombre].md`

**Descripción:** [Breve descripción]

**Uso:**
Escribe `/[nombre-comando]` para ejecutar este flujo.

**Pasos incluidos:**
1. [Paso 1]
2. [Paso 2]
...
```

// turbo - Este comando puede ejecutarse automáticamente
