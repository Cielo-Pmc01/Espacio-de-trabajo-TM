# Guía de uso del workspace

Este repositorio es un espacio de trabajo de contenido y capacitación, diseñado para organizar documentación, planes y salidas. No es un proyecto de software tradicional con compilación; está pensado para trabajar con inteligencia artificial, agentes y procesos de contenido.

## Qué hay aquí

- `CLAUDE.md`
  - Guía principal del workspace.
  - Define cómo debe comportarse el asistente y la estructura del proyecto.
- `.claude/commands/`
  - Contiene comandos diseñados para Claude Code: `iniciar`, `crear-plan`, `implementar`.
- `contexto/`
  - Información de negocio, estrategia, catálogos y documentación base.
- `planes/`
  - Lugar para guardar planes de implementación y documentos de trabajo.
- `salidas/`
  - Productos generados y entregables, especialmente material de capacitación.
- `referencia/`
  - Plantillas y ejemplos reutilizables.
- `scripts/`
  - Scripts auxiliares o automatizaciones (si existen).

## Cómo usarlo con Claude

1. Ejecuta `/iniciar` para que el asistente lea el contexto.
2. Usa `/crear-plan` para planificar cambios importantes.
3. Usa `/implementar` para ejecutar un plan ya definido.

Esto es útil si estás trabajando dentro de un entorno Claude Code que reconoce `.claude/commands/`.

## Cómo usarlo con otros modelos o agentes

1. Lee `CLAUDE.md` para entender la estructura y el propósito general.
2. Usa `contexto/` como fuente principal de información sobre marcas, estrategia y catálogos.
3. Crea planes en `planes/` cuando necesites estructurar un cambio o idea.
4. Genera contenidos en `salidas/` y guarda resultados útiles en `referencia/`.
5. Si trabajas con un modelo de tokens limitados, envía solo el contexto esencial:
   - describe el objetivo
   - indica la estructura de salida
   - referencia los archivos relevantes

## Comandos habilitados

Estos comandos están disponibles en `.claude/commands/` y funcionan como plantillas de flujo de trabajo:

- `/iniciar` — lee el contexto y resume el workspace.
- `/crear-plan` — crea un plan de implementación estructurado.
- `/implementar` — ejecuta un plan existente.
- `/usar-otros-modelos` — guía el uso del repo con modelos alternativos y agentes token-limitados.
- `/crear-prompt-modelo-alternativo` — crea prompts optimizados para modelos con límite de tokens.

## Recomendaciones para ahorrar tokens

- No intentes procesar todo el repositorio al mismo tiempo.
- Trabaja por archivo o por tareas pequeñas.
- Envía solo los fragmentos de texto necesarios al modelo.
- Usa el formato `planes/` para mantener el trabajo organizado.

## Flujo sugerido fuera de Claude

1. Abrir `CLAUDE.md` y revisar la estructura.
2. Revisar los archivos `contexto/*.md` relacionados con el tema que te interese.
3. Crear un nuevo plan en `planes/` con el objetivo y la estructura de entrega.
4. Generar el contenido y guardarlo en `salidas/` o en un archivo `.md` nuevo.
5. Usar `referencia/` para copiar patrones de estilo o formatos ya existentes.

## Nota

Este workspace sirve como base de trabajo y documentación, no como software ejecutable. Puedes usar cualquier IA o agente que prefieras; simplemente dale el contexto adecuado y mantén la estructura del repositorio organizada.
