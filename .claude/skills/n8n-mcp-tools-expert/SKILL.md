---
name: "n8n-mcp-tools-expert"
description: "Guía experta para usar herramientas n8n-mcp eficientemente. Invocar al buscar nodos, validar configuraciones, o gestionar flujos de trabajo."
---

# n8n MCP Tools Expert

Esta habilidad guía el uso efectivo de las herramientas MCP de n8n para buscar, configurar y validar nodos.

## Cuándo Invocar
- Al buscar nodos (`search_nodes`).
- Al validar configuraciones de nodos (`validate_node_config`).
- Al gestionar flujos de trabajo (`create_workflow`, `update_workflow`).
- Para entender los formatos de `nodeType` (ej. `nodes-base.*` vs `n8n-nodes-base.*`).

## Reglas de Oro
- **Selección de Herramienta**: Usa `search_nodes` para encontrar el `nodeType` correcto antes de configurar.
- **Perfiles de Validación**:
  - `minimal`: Validación rápida.
  - `strict`: Validación rigurosa para producción.
- **Parámetros Inteligentes**: Asegúrate de pasar valores como strings (ej. `branch="true"`) si el nodo lo requiere.
- **Saneamiento Automático**: Entiende cómo el servidor MCP limpia los parámetros antes de enviarlos a n8n.

## Formato de nodeType
Los nodos base suelen tener el prefijo `n8n-nodes-base.`. Siempre verifica con la herramienta de búsqueda.
