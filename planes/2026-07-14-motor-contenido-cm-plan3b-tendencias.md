# Motor de contenido CM — Plan 3b: Fuente Tendencias Implementation Plan

> Continuación de `planes/2026-07-14-motor-contenido-cm-plan3-catalogo.md` (Plan 3a). Misma arquitectura de composición: un workflow nuevo investiga y arma un brief, y llama al webhook ya existente de `CM - Generar Contenido` — sin duplicar la lógica de generación.

**Goal:** Generar contenido sobre un ángulo real y actual (no inventado), detectado por búsqueda web, sin que nadie tenga que proponer el tema a mano.

**Architecture:** Webhook → Agent con modelo `gpt-5-mini` + búsqueda web nativa (`builtInTools.webSearch` de `lmChatOpenAi`, no un tool externo) investiga qué genera interés esta semana para turismo de nieve en Bariloche/Patagonia → arma `{tema, brief}` con salida estructurada → llama a `CM - Generar Contenido` con `origen: 'tendencia'`.

---

## Qué se hizo

### Workflow nuevo "CM - Generar desde Tendencia" (`qVhjYBYazpKdI3QT`)

Webhook `POST /webhook/cm-generar-desde-tendencia`, body opcional `{ formato? }`:

1. `Investigar tendencia` (Agent + `GPT-5 mini con busqueda web`) — el prompt incluye la fecha real del día (`$now`) para que la búsqueda sea sobre "esta semana" de verdad, no una fecha de entrenamiento del modelo. Instrucción explícita de no inventar si la búsqueda no trae nada relevante — en ese caso, elegir un ángulo genérico de temporada y aclararlo como sugerencia, no tendencia confirmada.
2. `Armar brief desde tendencia` (Code) — arma el brief con `formato` y `origen: 'tendencia'`.
3. `Llamar CM - Generar Contenido` — mismo patrón de reuso que el workflow de catálogo.
4. `Formatear respuesta` — devuelve `{ tema, count, piezas }`.

**Gotcha nuevo de la SDK de n8n (no de lógica, de validación):** `builtInTools.webSearch` en el nodo `lmChatOpenAi` requiere `responsesApiEnabled: true` explícito en los parámetros — sin eso, `validate_workflow` rechaza el nodo con "This field is only allowed when responsesApiEnabled=true", aunque `true` sea el valor por default del campo. Hay que setearlo a mano.

**Consulta de Cielo respondida en esta sesión:** por qué se arman workflows separados en vez de uno solo combinado — decisión deliberada (reuso de la lógica de generación en un solo lugar, cada fuente dispara distinto, más fácil de debuggear aislado). Confirmado con Cielo: mantener separados.

---

## Verificación

Ejecución manual real (sin credencial extra necesaria — usa la misma `OpenAI IADVC01` que ya tenía acceso a búsqueda web incluido): el agente detectó un ángulo genuinamente real y con vigencia (una duda operativa sobre si el Cerro Catedral estaba abierto ese día) y generó 9 piezas — una por marca, cada una resolviendo esa duda con una alternativa, tono correcto por marca (incluido portugués en TBBR/PBRS). Confirmado por SQL: `origen='tendencia'` en las 9 filas.

**Nota de calidad:** este resultado fue un buen caso — la fuente más experimental puede no encontrar siempre algo tan accionable. Sigue siendo la fuente a revisar con más cuidado antes de aprobar contenido generado desde acá, como ya estaba anotado en el diseño original.

---

## Fuera de alcance de este plan

- **Sin botón en `crm-cm` todavía** — el Generador solo tiene "Brief manual" y "Desde catálogo". Agregar "Desde tendencia" es un cambio de frontend análogo al ya hecho para catálogo, no incluido acá.
- **Sin cron automático** — hoy es 100% a demanda por webhook. Ponerlo en automático (ej. todos los lunes) es la razón por la que se mantuvo como workflow separado, pero el cron en sí no está armado.
- **Fuente Chatwoot** — sigue bloqueada. Cielo pidió un token nuevo y aislado de Chatwoot (no reusar el de Pb2) — pendiente que lo genere y lo pase.
