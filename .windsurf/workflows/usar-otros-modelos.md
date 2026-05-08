---
description: Guía para usar el workspace con modelos alternativos y agentes token-limitados
---

# /usar-otros-modelos - Uso con modelos alternativos

## Propósito

Proporcionar guía y estrategia para usar este workspace con:
- Modelos con límite de tokens (Claude 3 Haiku, GPT-3.5, etc.)
- Agentes de IA alternativos
- Herramientas sin integración nativa con el workspace

## Instrucciones para el asistente

1. **Explicar estrategia de tokens**
   - No procesar todo el repositorio a la vez
   - Trabajar por archivos o tareas pequeñas
   - Enviar solo fragmentos de texto necesarios
   - Usar `planes/` para mantener trabajo organizado

2. **Flujo recomendado**
   ```
   1. Abrir CLAUDE.md → revisar estructura
   2. Revisar contexto/*.md relevante al tema
   3. Crear plan en planes/ con objetivo y estructura
   4. Generar contenido en salidas/
   5. Guardar patrones útiles en referencia/
   ```

3. **Formato de prompt para modelos token-limitados**
   - Plantilla:
     ```
     ## Contexto
     [2-3 frases sobre el proyecto]

     ## Archivo de referencia
     ```
     [Pegar contenido relevante de contexto/]
     ```

     ## Tarea
     [Descripción específica y acotada]

     ## Formato de salida esperado
     [Estructura deseada]
     ```

4. **Ofrecer crear prompt optimizado**
   - Preguntar: "¿Necesitas que cree un prompt optimizado para un modelo específico?"
   - Si sí: usar `/crear-prompt-modelo-alternativo`

## Formato de salida esperado

```
## Uso con Modelos Alternativos

### Estrategia principal
[Resumen de estrategia de tokens]

### Flujo de trabajo
[Pasos numerados]

### Recomendaciones
- [Bullet points clave]

### Próximo paso
¿Necesitas crear un prompt optimizado? Usa /crear-prompt-modelo-alternativo
```

// turbo - Este comando puede ejecutarse automáticamente
