# usar-otros-modelos

## Descripción

Proporciona estrategia para usar el workspace con modelos de IA con límite de tokens (Claude 3 Haiku, GPT-3.5) o agentes alternativos.

## Cuándo usar

- Cuando trabajas con modelos de tokens limitados
- Para agentes de IA alternativos a Claude
- Cuando necesitas optimizar el uso de tokens

## Parámetros

- **modelo** (opcional): Nombre del modelo alternativo que usarás

## Instrucciones

1. Explicar estrategia fundamental de tokens:
   - No procesar todo el repositorio al mismo tiempo
   - Trabajar por archivo o tareas pequeñas
   - Enviar solo fragmentos de texto necesarios
   - Usar `planes/` para mantener trabajo organizado

2. Mostrar flujo recomendado:
   ```
   1. Abrir CLAUDE.md → revisar estructura
   2. Revisar contexto/*.md relacionado al tema
   3. Crear plan en planes/ con objetivo y estructura
   4. Generar contenido en salidas/
   5. Guardar patrones útiles en referencia/
   ```

3. Ofrecer formato de prompt optimizado:
   ```
   ## Contexto
   [2-3 frases máximo]

   ## Archivo de referencia
   ```
   [Contenido relevante de contexto/]
   ```

   ## Tarea
   [Descripción específica y acotada]

   ## Formato de salida esperado
   [Estructura deseada]
   ```

4. Preguntar si necesita prompt optimizado para modelo específico
5. Si sí, ofrecer usar /crear-prompt-modelo-alternativo

## Formato de salida

```markdown
## Uso con Modelos Alternativos

### Estrategia principal
[Resumen de estrategia de tokens]

### Flujo de trabajo recomendado
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]
4. [Paso 4]
5. [Paso 5]

### Recomendaciones clave
- No procesar todo el repo a la vez
- Trabajar por archivos pequeños
- Usar planes/ para organizar
- Enviar solo fragmentos necesarios

### Próximo paso
¿Necesitas crear un prompt optimizado? Usa /crear-prompt-modelo-alternativo
```

## Ejemplo de uso

```
/usar-otros-modelos modelo:"Claude 3 Haiku"
```

O escribe: "Cómo uso este workspace con modelos de tokens limitados?"
