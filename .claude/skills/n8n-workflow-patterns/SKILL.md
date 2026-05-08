---
name: "n8n-workflow-patterns"
description: "Guía para construir flujos de trabajo en n8n usando patrones arquitectónicos probados. Invocar al crear flujos, conectar nodos o diseñar automatización."
---

# n8n Workflow Patterns

Esta habilidad ayuda a diseñar flujos de trabajo robustos usando patrones estándar de la industria.

## Cuándo Invocar
- Al crear flujos desde cero (`create_workflow`).
- Al conectar múltiples nodos (`connect_nodes`).
- Al diseñar sistemas de automatización complejos.
- Al elegir la mejor arquitectura para una tarea.

## Patrones Comunes
1. **Procesamiento de Webhook**:
   - `Webhook -> Set -> HTTP Request -> Respond to Webhook`.
   - **Tip**: Siempre responde al webhook lo antes posible.
2. **Consultas a Base de Datos**:
   - `HTTP Request -> PostgreSQL/MySQL -> Set -> Respond`.
3. **Flujos de IA (Agentes)**:
   - `Agent -> LLM -> Tools -> Output`.
   - **Tip**: Los agentes necesitan herramientas claras y descripciones detalladas.
4. **Tareas Programadas (Scheduled)**:
   - `Schedule -> Google Sheets -> Email`.
5. **Manejo de Errores**:
   - `Node -> Error Trigger -> Discord/Slack notification`.

## Lista de Verificación
- ¿Cada nodo tiene un nombre descriptivo?
- ¿Están configurados los reintentos (`Retry on Failure`)?
- ¿El flujo es lineal o tiene ramas (`IF`, `Switch`)?
- ¿Se están limpiando los datos innecesarios?
