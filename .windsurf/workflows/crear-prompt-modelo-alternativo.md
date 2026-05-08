---
description: Crear prompts optimizados para modelos con límite de tokens
---

# /crear-prompt-modelo-alternativo - Prompt optimizado

## Propósito

Crear prompts compactos y eficientes para usar con modelos de IA con limitaciones de tokens, extrayendo solo la información esencial del workspace.

## Instrucciones para el asistente

1. **Recopilar requisitos**
   - Preguntar: "¿Para qué modelo necesitas el prompt?" (ej: Claude 3 Haiku, GPT-3.5, etc.)
   - Preguntar: "¿Cuál es la tarea específica?" (ej: crear contenido, analizar texto, generar ideas)
   - Preguntar: "¿Qué tema/contexto del workspace necesitas incluir?"

2. **Extraer contexto relevante**
   - Identificar archivos en `contexto/` relacionados con el tema
   - Leer solo las secciones relevantes (no archivos completos)
   - Extraer:
     - Información de marca/clima de voz
     - Datos clave del negocio
     - Estructuras o formatos requeridos

3. **Construir el prompt**
   Estructura optimizada:
   ```
   ## Contexto del Proyecto
   [2-3 líneas máximo - descripción concisa]

   ## Información de Marca/Negocio
   - [Bullet points esenciales]
   - [Tono de voz: X]
   - [Público objetivo: Y]

   ## Tu Tarea
   [Descripción clara y específica]

   ## Restricciones
   - [Límite de tokens/caracteres si aplica]
   - [Estilo/formato requerido]

   ## Formato de Salida
   ```
   [Template o estructura deseada]
   ```

   ## Ejemplo (opcional)
   [Si aplica, 1 ejemplo corto]
   ```

4. **Optimización**
   - Eliminar redundancias
   - Usar bullet points en lugar de párrafos largos
   - Priorizar información accionable
   - Mantener bajo 500 tokens si es posible

5. **Entregar el prompt**
   - Mostrar en bloque de código listo para copiar
   - Incluir instrucciones de uso
   - Sugerir dónde guardar (ej: `referencia/prompts/`)

## Formato de salida esperado

```
## Prompt Optimizado para [Modelo]

**Tokens estimados:** [N]
**Tarea:** [Descripción]

### Prompt listo para usar:

```
[CONTENIDO DEL PROMPT]
```

### Instrucciones de uso:
1. [Paso 1]
2. [Paso 2]

### ¿Guardar este prompt?
¿Deseas que guarde este prompt en `referencia/prompts/` para uso futuro?
```

// turbo - Este comando puede ejecutarse automáticamente
