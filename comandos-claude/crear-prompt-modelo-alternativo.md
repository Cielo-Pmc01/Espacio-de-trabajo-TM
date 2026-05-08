# crear-prompt-modelo-alternativo - Prompt optimizado

## Descripción

Crea prompts compactos para modelos con límite de tokens, extrayendo solo información esencial.

## Instrucciones

1. Preguntar:
   - "¿Para qué modelo?" (Claude 3 Haiku, GPT-3.5, etc.)
   - "¿Cuál es la tarea específica?"
   - "¿Qué contexto incluir?"

2. Extraer contexto de `contexto/` (solo secciones relevantes):
   - Marca/tone of voice
   - Datos clave
   - Formatos requeridos

3. Construir prompt optimizado:
   ```
   ## Contexto
   [2-3 líneas]

   ## Información de Marca
   - [bullets esenciales]

   ## Tarea
   [descripción específica]

   ## Formato de Salida
   [template]
   ```

4. Entregar listo para copiar y sugerir guardar en `referencia/prompts/`
