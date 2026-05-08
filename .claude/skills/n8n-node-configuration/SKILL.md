---
name: "n8n-node-configuration"
description: "Guía para configurar nodos de n8n con conocimiento de operaciones y propiedades. Invocar al configurar nodos o entender dependencias de propiedades."
---

# n8n Node Configuration

Esta habilidad guía la configuración precisa de nodos basada en operaciones y requisitos de propiedad.

## Cuándo Invocar
- Al configurar nodos (`configure_node`).
- Al entender dependencias de propiedades (`sendBody` -> `contentType`).
- Al configurar flujos de IA (Agentes).

## Reglas de Configuración
- **Dependencias**: Algunas propiedades solo aparecen si otras están activas (ej. `sendBody` activa `contentType`).
- **Requisitos de Operación**: Asegúrate de que todas las propiedades requeridas para la operación seleccionada estén presentes.
- **Tipos de Conexión de IA**: Hay 8 tipos diferentes de conexiones para flujos de Agente de IA. Elige la correcta.
- **Patrones Comunes**:
  - `HTTP Request`: Configura el método (GET, POST), URL y cuerpo.
  - `Set`: Configura los campos y sus valores (estáticos o expresiones).
  - `Google Sheets`: Configura el ID de la hoja, el nombre de la pestaña y la acción (Read, Append, Update).
