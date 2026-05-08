---
name: "n8n-code-python"
description: "Guía para escribir Python efectivo en nodos de Código de n8n. Invocar al escribir Python en nodos de Código o entender limitaciones de Python en n8n."
---

# n8n Code Python

Esta habilidad guía la escritura de Python efectivo para nodos de Código de n8n y advierte sobre sus limitaciones.

## Cuándo Invocar
- Al escribir Python en nodos de Código (`Code node`).
- Al necesitar entender las limitaciones de Python en n8n.
- Al trabajar con la biblioteca estándar de Python en n8n.

## Reglas de Escritura
- **Acceso a Datos**:
  - `_input`: Obtiene los ítems de entrada.
  - `_json`: Obtiene los datos JSON.
  - `_node`: Accede a otros nodos.
- **Formato de Retorno**: Igual que en JavaScript (ej. `return [{"json": {"foo": "bar"}}]`).

## Limitaciones Críticas
- **Sin Librerías Externas**: NO puedes importar `requests`, `pandas`, `numpy`, ni ninguna librería que no sea parte de la estándar de Python.
- **Alternativa**: Usa JavaScript para el 95% de los casos de uso si necesitas librerías específicas.
- **Biblioteca Estándar**: Puedes usar `json`, `datetime`, `re`, `math`, etc.
- **Sustitutos**: Usa `urllib` para peticiones HTTP si es necesario, pero JavaScript `$helpers.httpRequest()` es preferible.
