---
description: Iniciar sesión de trabajo - Lee el contexto y resume el workspace
---

# /iniciar - Iniciar sesión de trabajo

## Propósito

Este comando inicia una nueva sesión de trabajo leyendo el contexto del workspace y proporcionando un resumen de:
- Estructura del proyecto
- Archivos relevantes en `contexto/`
- Planes activos en `planes/`
- Tareas pendientes o en progreso

## Instrucciones para el asistente

1. **Leer el contexto base**
   - Buscar y leer `CLAUDE.md` si existe
   - Leer `README.md` para entender la estructura general

2. **Explorar el workspace**
   - Listar directorios principales: `contexto/`, `planes/`, `salidas/`, `referencia/`
   - Identificar archivos `.md` recientes o relevantes

3. **Resumen de inicio**
   - Mostrar estructura del proyecto en formato conciso
   - Listar planes activos (archivos en `planes/`)
   - Destacar contextos de negocio disponibles en `contexto/`
   - Si hay planes pendientes, preguntar si desea continuar alguno

4. **Preguntar próximo paso**
   - "¿Qué te gustaría trabajar hoy?"
   - Ofrecer opciones: crear plan, continuar plan existente, revisar contexto específico

## Formato de salida esperado

```
## Resumen del Workspace

**Estructura:** [breve descripción]

**Planes activos:**
- [lista de planes en planes/]

**Contexto disponible:**
- [temas principales en contexto/]

**Próximo paso:**
[Opciones sugeridas]
```

// turbo - Este comando puede ejecutarse automáticamente
