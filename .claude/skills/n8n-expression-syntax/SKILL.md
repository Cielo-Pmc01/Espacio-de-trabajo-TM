---
name: "n8n-expression-syntax"
description: "Guía experta para escribir expresiones correctas en n8n. Invocar al escribir {{ }}, usar variables $json/$node, o solucionar errores de expresiones."
---

# n8n Expression Syntax

Esta habilidad enseña la sintaxis correcta de las expresiones de n8n y corrige errores comunes.

## Cuándo Invocar
- Al escribir expresiones en n8n.
- Al usar la sintaxis `{{ }}`.
- Al acceder a variables `$json`, `$node`, `$now`, o `$env`.
- Para solucionar errores de "undefined" en el flujo de trabajo.

## Reglas Clave
- **Estructura**: Las expresiones deben ir envueltas en `{{ }}`.
- **Datos de Webhook**: Los datos de un Webhook siempre están bajo `$json.body.*`.
- **Variables Core**:
  - `$json`: Datos del nodo actual.
  - `$node["Nombre Nodo"]`: Datos de un nodo anterior.
  - `$now`: Fecha y hora actual.
- **Evitar**: NO usar expresiones dentro de nodos de Código (Code nodes); usa JavaScript/Python plano allí.

## Errores Comunes
1. Olvidar las llaves `{{ }}`.
2. Acceder directamente a `$json` en lugar de `$json.campo`.
3. Error en la ruta de datos de Webhook (olvidar `.body`).
