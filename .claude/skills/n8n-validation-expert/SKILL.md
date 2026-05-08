---
name: "n8n-validation-expert"
description: "Guía para interpretar errores de validación de n8n y corregirlos. Invocar al fallar la validación, depurar errores de flujo o manejar falsos positivos."
---

# n8n Validation Expert

Esta habilidad interpreta errores de validación y guía el proceso de corrección.

## Cuándo Invocar
- Al fallar la validación (`validate_node_config`).
- Al depurar errores en un flujo de trabajo.
- Al manejar posibles falsos positivos de validación.

## Proceso de Validación
1. **Validación de Perfil**: Comienza con un perfil `minimal`.
2. **Interpretación del Catálogo**: Lee el mensaje de error completo.
3. **Saneamiento**: Verifica si el servidor MCP ha saneado los parámetros.
4. **Ciclo de Corrección**: Modifica la configuración y re-valida.

## Errores Comunes
- `Missing required property`: Falta un campo obligatorio.
- `Incorrect data type`: Se pasó un string en lugar de un objeto.
- `Invalid expression`: Error de sintaxis en `{{ }}`.
- `Property dependency`: Falta una propiedad de la que depende otra.
