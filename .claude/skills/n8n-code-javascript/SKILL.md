---
name: "n8n-code-javascript"
description: "Guía para escribir JavaScript efectivo en nodos de Código de n8n. Invocar al escribir JavaScript en nodos de Código o solucionar errores."
---

# n8n Code JavaScript

Esta habilidad guía la escritura de código JavaScript efectivo para nodos de Código de n8n.

## Cuándo Invocar
- Al escribir JavaScript en nodos de Código (`Code node`).
- Al solucionar errores en nodos de Código.
- Al hacer peticiones HTTP con `$helpers`.
- Al trabajar con fechas en JavaScript.

## Reglas de Escritura
- **Acceso a Datos**:
  - `$input.all()`: Obtiene todos los ítems de entrada.
  - `$input.first()`: Obtiene el primer ítem.
  - `$input.item`: Ítem actual en una iteración.
- **Formato de Retorno**: Siempre debe ser un array de objetos con una propiedad `json` (ej. `return [{ json: { foo: "bar" } }]`).
- **Funciones Integradas**:
  - `$helpers.httpRequest()`: Para peticiones HTTP.
  - `DateTime`: Para manejo de fechas.
  - `$jmespath()`: Para consultas de datos.

## Errores de Producción
- Retornar un objeto plano en lugar de un array con `json`.
- Errores de acceso a datos de Webhook (`$json.body`).
- Fallas de promesas no manejadas.
