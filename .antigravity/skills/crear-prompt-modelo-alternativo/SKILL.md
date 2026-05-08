# crear-prompt-modelo-alternativo

## Descripción

Crea prompts compactos y eficientes para modelos de IA con limitaciones de tokens, extrayendo solo información esencial del workspace.

## Cuándo usar

- Cuando trabajas con Claude 3 Haiku, GPT-3.5 u otros modelos token-limitados
- Para crear prompts portátiles que funcionen en cualquier IA
- Cuando necesitas optimizar el contexto enviado

## Parámetros

- **modelo** (requerido): Nombre del modelo destino (Claude 3 Haiku, GPT-3.5, etc.)
- **tarea** (requerido): Descripción específica de la tarea
- **contexto** (opcional): Tema o contexto del workspace a incluir

## Instrucciones

1. Preguntar para qué modelo necesita el prompt
2. Preguntar cuál es la tarea específica
3. Preguntar qué tema/contexto del workspace incluir
4. Extraer contexto relevante de `contexto/`:
   - Información de marca/tone of voice
   - Datos clave del negocio
   - Estructuras o formatos requeridos
   - Leer solo secciones relevantes, no archivos completos
5. Construir prompt optimizado:
   ```
   ## Contexto del Proyecto
   [2-3 líneas máximo]

   ## Información de Marca
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
6. Optimizar:
   - Eliminar redundancias
   - Usar bullet points en lugar de párrafos largos
   - Priorizar información accionable
   - Mantener bajo 500 tokens si es posible
7. Entregar:
   - Mostrar en bloque de código listo para copiar
   - Incluir instrucciones de uso
   - Sugerir guardar en `referencia/prompts/`

## Formato de salida

```markdown
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

### ¿Guardar para reutilizar?
¿Deseas que guarde este prompt en `referencia/prompts/` para uso futuro?
```

## Ejemplo de uso

```
/crear-prompt-modelo-alternativo modelo:"Claude 3 Haiku" tarea:"Crear copy para Instagram" contexto:"marca Tierra Maya"
```

O escribe: "Crea un prompt optimizado para [modelo] que [tarea]"
