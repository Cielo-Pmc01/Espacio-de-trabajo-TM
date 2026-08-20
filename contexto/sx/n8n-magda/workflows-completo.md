# n8n — Análisis Completo de Workflows

> Relevamiento completo de los 26 workflows del servidor n8n de Adventure Center.
> Fuente: `salidas/N8N ORIGINAL/` + capturas de pantalla n8n (2026-06-19)
> Última actualización: 2026-06-19

---

## Estado Real — Confirmado por capturas (2026-06-19)

### ✅ Published (ON) — 16 workflows activos

| Workflow | Última actualización |
|---|---|
| Sasha Alpha Test | 2 semanas |
| MCP Servers | 2 semanas |
| Magda 1.9.1 HW - Beta Build | 2 semanas |
| Almacenar ultimo mensaje enviado por el cliente | 3 semanas |
| Magda 2.0 - Alpha Test | 2 meses |
| WordPress Sync | 2 meses |
| Pocision de vehiculos | 2 meses |
| **Redis Optimize & Extra Tools For Magda** | 2 meses |
| Formularios y Status | 2 meses |
| **Mercado Pago Brasil** ⚠️ no en JSON local | 3 meses |
| **Mercado Pago Argentina** ⚠️ no en JSON local | 3 meses |
| Magda For Chatwoot 1.9 HW - Alfa Chatwoot | 3 meses |
| Magda 1.6.4 Lite Services | 3 meses |
| Herramientas Magda 1.9 | 3 meses |
| VENTAS | 5 meses |
| MCP Magda 1.x | 6 meses |

### ❌ No Published (OFF) — 10 workflows inactivos

| Workflow | Última actualización |
|---|---|
| My workflow 3 (recién creado hoy) | 2 horas |
| SerpApi Google Maps → Strapi Alojamientos | 1 mes |
| Magda 2.1 Beta Release | 1 mes |
| My workflow 2 | 2 meses |
| RAG Auto-Update desde Notion v2 | 2 meses |
| **Strapi - Asignar todos los Pickups** | 2 meses |
| My workflow | 3 meses |
| Google Merchats | 3 meses |
| Magda 1.9 hw copy | 3 meses |
| Magda 2 | 6 meses |

---

## Resumen Ejecutivo

| Categoría | Workflows | Activos |
|---|---|---|
| Magda (núcleo IA) | 8 | 5 ON / 3 OFF |
| Sub-agentes y herramientas | 4 | 4 ON / 0 OFF |
| Ventas y CRM | 4 | 3 ON / 1 OFF |
| RRHH y formularios | 1 | 1 ON |
| Operaciones / datos | 3 | 3 ON / 0 OFF |
| Integraciones externas | 4 | 1 ON / 3 OFF |
| Agente interno PB2 | 1 | 1 ON |
| Misceláneos / en desarrollo | 2 | 0 ON / 2 OFF |
| **Total** | **26** | **16 ON / 10 OFF** |

**⚠️ No en JSON local:** `Mercado Pago Brasil`, `Mercado Pago Argentina`, `My workflow 2`, `My workflow 3` — bajar del servidor.

**LLMs en uso:** GPT-5.2 (Magda 2.x), GPT-4o, GPT-4.1
**Host n8n:** `md.getjasper.digital`

---

## 1. MAGDA — Núcleo de Atención al Cliente

### 1.1 Magda 2.1 Beta Release ❌ OFF
**Archivo:** `Magda 2.1 Beta Release.json` | **Nodos:** 187

**La versión más completa y reciente. Está OFF sin razón técnica aparente.**

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `/mg-v-one-nine-test` (ignoreBots: true) |
| Webhook ID | `1b2b9e13-8dd7-4b89-a173-f658a003474f` |
| LLM | GPT-5.2 via AXL server |
| Embeddings | `text-embedding-3-small` |
| RAG | Supabase `vector_storage` |
| Stack | Chatwoot + Supabase + Redis + OpenAI + WooCommerce |

**Sub-agentes incluidos:** s1 (escalada), s2 (etiquetas), s3 (notas CRM), s4 (atributos cliente)

⚠️ **PROBLEMA CRÍTICO:** Comparte el mismo webhook ID y path que Magda 2.0. Si se activa sin desactivar 2.0, ambos recibirán los mismos eventos y el cliente recibirá respuesta doble.

---

### 1.2 Magda 2.0 Alpha Test ✅ ON
**Archivo:** `Magda 2.0 - Alpha Test.json` | **Nodos:** 160

**Versión actual en producción.**

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `/mg-v-one-nine-test` (ignoreBots: true) |
| Webhook ID | `1b2b9e13-8dd7-4b89-a173-f658a003474f` ← mismo que 2.1 |
| LLM | GPT-5.2 via AXL server |
| Embeddings | `text-embedding-3-small` |
| RAG | Supabase `vector_storage` |
| Stack | Chatwoot + Supabase + Redis + OpenAI + WooCommerce |

**Sub-agentes incluidos:** s1, s2, s3, s4 (igual que 2.1, con menos nodos)

---

### 1.3 Magda 1.9.1 HW Beta Build ✅ ON
**Archivo:** `Magda 1.9.1 HW - Beta Build (1).json` | **Nodos:** 174

| Dato | Valor |
|---|---|
| Stack | Chatwoot + Supabase + Redis + OpenAI + Baserow + WooCommerce |

Versión previa aún activa. Introduce integración WooCommerce sobre la base 1.6.4.

---

### 1.4 Magda For Chatwoot 1.9 ✅ ON
**Archivo:** `Magda For Chatwoot 1.9 HW - Alfa Chatwoot.json` | **Nodos:** 109

| Dato | Valor |
|---|---|
| Trigger | Webhook POST interno |
| Stack | Chatwoot + Supabase + Redis + OpenAI + Baserow + WooCommerce |

Variante Chatwoot-first. Menor cantidad de nodos, lógica simplificada.

---

### 1.5 Magda For Chatwoot 1.9 (1) ✅ ON ⚠️
**Archivo:** `Magda For Chatwoot 1.9 HW - Alfa Chatwoot (1).json` | **Nodos:** 109

**DUPLICADO EXACTO del 1.4.** Mismo número de nodos, misma lógica. Ambos activos = doble respuesta al mismo mensaje. Desactivar uno.

---

### 1.6 Magda 1.6.4 Lite Services ✅ ON
**Archivo:** `Magda 1.6.4 Lite Services.json` | **Nodos:** 192

| Dato | Valor |
|---|---|
| Stack | Chatwoot + Supabase + Redis + OpenAI + Baserow (sin WooCommerce) |

Primera versión con servicios lite. La más antigua aún activa. Sin integración de reservas.

---

### 1.7 Magda 1.9 hw copy — Experimental
**Archivo:** `Magda 1.9 hw copy.json`

| Dato | Valor |
|---|---|
| LLM | **GPT-5.2** (modelo experimental, puede no existir en producción) |
| Trigger | Webhook POST `2d37a2c9-2656-49ea-a7e9-c97911bc203d` |

Copia de desarrollo. No es productiva. Útil para probar el modelo experimental.

---

### 1.8 Magda 2 ❌ OFF
**Archivo:** `Magda 2.json` | **Nodos:** 54

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `/magdatwo` |
| Config | Baserow DataTable ID `wlRIoMcSbR90dCsE` (tabla "magda") |
| Stack | Redis + Baserow |

Prototipo simplificado de Magda 2 con configuración en Baserow. Incompleto. Sin sub-agentes.

---

## 2. SUB-AGENTES Y HERRAMIENTAS

### 2.1 MCP Magda 1.x ✅ ON
**Archivo:** `MCP Magda 1.x.json` | **Nodos:** 62

Servidor MCP que expone herramientas para que Magda las consuma.

| Dato | Valor |
|---|---|
| Trigger | MCP Trigger en `/promt-render-mpc` |
| URL pública | `md.getjasper.digital/mcp/promt-render-mpc` |
| LLM interno | GPT-4.1 (AXL server) |
| Embeddings | OpenAI (credential: "Magda Audio") |
| Supabase | "Memoria Magda Supabase Interno" |

**Herramientas que expone:**

| Tool | Fuente | Función |
|---|---|---|
| `allExcursion` | Baserow (db 127, tabla 602) | Lista todas las excursiones disponibles (filtro campo 6180 vacío) |
| `flexDB` | Datos hardcodeados en JS | Info sobre seguros y reservas flexibles (ver detalle abajo) |
| `directionBrand` | GraphQL `back.iadventurecenter.com/graphql` | Nombre y dirección de oficina por entidad de marca |
| MCP Client | `md.getjasper.digital/mcp/promt-render-mpc` | Se llama a sí mismo recursivamente (¿loop de testing?) |

**Datos de flexDB (hardcodeados):**
- Reprogramación Flexible: $15.000 — cambio de fecha hasta 19hs del día anterior
- Cancelación Flexible: $15.000 — recupera 80% hasta 19hs del día anterior
- Pack de Reserva Flexible: $25.000 — incluye ambas
- Todos contratables hasta 30 min después del voucher

También tiene un Chat Trigger con AI Agent (GPT-4.1 + memory buffer) para modo de prueba interactivo.

---

### 2.2 MCP Servers ✅ ON
**Archivo:** `MCP Servers.json` | **Nodos:** 139

Servidor MCP con herramientas de Notion para que Magda pueda leer y escribir en Notion.

| Dato | Valor |
|---|---|
| Credential Notion | `7qjq213WfdUbIFYl` (Notion account) |

**Herramientas Notion que expone:**

| Tool | Endpoint | Función |
|---|---|---|
| `notion_search` | POST `/v1/search` | Buscar páginas/bases de datos por texto |
| `notion_get_page` | GET `/v1/pages/{id}` | Obtener metadatos de una página |
| `notion_create_page` | POST `/v1/pages` | Crear página nueva con propiedades y contenido |
| `notion_update_page` | PATCH `/v1/pages/{id}` | Actualizar propiedades, archivar página |
| `notion_get_page_content` | GET `/v1/blocks/{id}/children` | Obtener bloques de contenido de una página |
| `notion_append_blocks` | PATCH `/v1/blocks/{id}/children` | Agregar bloques a una página |
| `notion_get_block` | GET `/v1/blocks/{id}` | Obtener un bloque específico |

Todos usan Notion API versión `2022-06-28`.

---

### 2.3 Herramientas Magda 1.9 ✅ ON
**Archivo:** `Herramientas Magda 1.9.json`

Sub-agente de herramientas especializado. Recibe llamadas de Magda 1.9 vía webhook interno.

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `/memory-1_9` |
| Supabase | `sup.getjasper.digital` — tabla `tareas` |

**Función:** Cuando Magda 1.9 necesita actualizar el estado de una tarea interna en Supabase, llama a este sub-agente. Hace PATCH en la tabla `tareas` filtrando por `chatwootConversationId`.

---

### 2.4 Redis Optimize & Extra Tools For Magda ✅ ON
**Archivo:** `Redis Optimize & Extra Tools For Magda.json`

Pre-procesa el catálogo de WooCommerce para que Magda lo consulte más rápido.

**Proceso:**
1. Obtiene todos los productos de WooCommerce
2. Convierte HTML de descripción → Markdown limpio (limpia `<ul>`, `<li>`, `<h2>`, `<strong>`, `<a>`, tablas, etc.)
3. Extrae: SKU, precio, categorías, addons con precios, descripción corta
4. Cachea el resultado en Redis con formato estructurado

**Propósito:** Reducir latencia cuando Magda necesita consultar el catálogo. En lugar de hacer HTTP a WooCommerce en cada conversación, lee de Redis.

---

## 3. VENTAS Y CRM

### 3.1 VENTAS ✅ ON
**Archivo:** `VENTAS.json` | **Nodos:** 117

Pipeline de captura de ventas desde Chatwoot hacia Baserow.

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `/venta-capturada` |
| Webhook ID | `e2029b58-5db6-4797-90f4-ddf35820f771` |
| Baserow | DB 167292, Tabla 646620 |
| Chatwoot token | `EaxPXr92jfEGQvbeTSG3snVv` |

**Flujo:**
1. Recibe evento de Chatwoot cuando una conversación tiene `custom_attributes.vaucher_ia = true`
2. Obtiene datos del inbox desde Chatwoot API
3. Filtra etiquetas relevantes: `cliente-desatendido`, `consulta-por-error`, `grupo-whatsapp`, `intervenir`, `presencial`, `venta-cerrada`, `venta-web`, `no-usar-por-capturar`
4. Guarda en Baserow: URL de conversación, nombre del cliente, flag vaucher_ia, asignado, inbox_id, teléfono, etiquetas, valor de venta, URL de ejecución n8n

**Resultado:** Cada venta capturada por Magda queda registrada en Baserow para seguimiento y auditoría.

---

### 3.2 Almacenar Último Mensaje ✅ ON
**Archivo:** `Almacenar ultimo mensaje enviado por el cliente.json` | **Nodos:** 34

| Dato | Valor |
|---|---|
| Trigger | Webhook de Chatwoot (mensaje entrante) |
| Stack | Chatwoot + Supabase |

Escucha cada mensaje entrante de clientes en Chatwoot y guarda el último mensaje en Supabase. Permite a Magda consultar el último contacto del cliente sin revisar el historial completo.

---

## 4. RRHH Y FORMULARIOS

### 4.1 Formularios y Status ✅ ON
**Archivo:** `Formularios y Status.json` | **Nodos:** 16

**Formulario de postulación laboral en 3 pasos.** (No es sobre excursiones — es RRHH.)

| Dato | Valor |
|---|---|
| Trigger | Form Trigger — path `/busqueda-laboral` |
| Diseño | CSS minimalista (gris neutro, botón negro, 460px) |
| Destino | Evolution API (envío de notificación) |

**Paso 1 — Datos personales:**
- Nombre y Apellido, Fecha de nacimiento, Teléfono, Email
- Ciudad (Bariloche / Villa La Angostura / San Martín de los Andes / El Bolsón / Otra Patagonia / Otra provincia)
- Cómo conoció la empresa (Google / Instagram / Facebook / Un amigo / LinkedIn / ChatGPT / Otro)
- Botón: "Siguiente"

**Paso 2 — Perfil laboral:**
- Área: Ventas presencial, Ventas online/e-commerce, Atención al cliente, Guía de excursiones, Chofer/Traslados, Administración, Administración contable, CM, Diseño gráfico, Diseño web, Frontend, Backend, DevOps, Marketing digital, Otros
- Tipo de contrato: Full-time, Part-time, Temporada verano, Temporada invernal, Freelance
- Modalidad: Presencial, Híbrido, Remoto
- Disponibilidad: De inmediato, Próxima semana, Temporada verano, Temporada invernal, Finalizando contrato
- Pretensión salarial (campo numérico)

**Paso 3:** No leído — probablemente CV/portfolio.

---

## 5. OPERACIONES Y DATOS

### 5.1 Posición de Vehículos ✅ ON
**Archivo:** `Pocision de vehiculos.json`

Tracking GPS en tiempo real de la flota de vehículos.

| Dato | Valor |
|---|---|
| Trigger | Schedule cada **4 minutos** |
| API GPS | `https://www.rsv.com.ar/api/dWJaAiZMVPPSbJHVRziZa9Bdjfci2r/current_pos.json` |
| Destino | Supabase `sup.getjasper.digital` — tabla `avehiculos` |

**Campos que guarda por vehículo:**
`fecha_hora`, `interno`, `patente`, `latitud`, `longitud`, `zona`, `ubicacion`, `orientacion`, `velocidad`, `evento`, `conductor`, `idconductor`, `odometro`, `odometro_offset`, `cronometro`, `idevento`

**Uso:** Permite saber en tiempo real dónde está cada vehículo de la flota. Supabase funciona como base de datos de posiciones históricas.

---

### 5.2 My Workflow — Reporte Chatwoot
**Archivo:** `My workflow.json`

| Dato | Valor |
|---|---|
| Trigger | Sin trigger automático (manual o webhook pendiente) |
| API | Chatwoot v2 — `/api/v2/accounts/1/reports` |
| Token | `EaxPXr92jfEGQvbeTSG3snVv` |
| Métrica | `conversations_count` |
| Período | Últimos 7 días (UTC-3) |

Genera reportes de conteo de conversaciones de los últimos 7 días. Probablemente alimenta un dashboard o se envía por WhatsApp.

---

### 5.3 RAG Auto-Update desde Notion v2 ❌ OFF
**Archivo:** `RAG Auto-Update desde Notion v2.json` | **Nodos:** 10

| Dato | Valor |
|---|---|
| Stack | Supabase (vector_storage) + OpenAI (embeddings) |

Mantiene actualizado el índice vectorial de Magda desde Notion. Cuando se agrega contenido en Notion (protocolos, info de excursiones, etc.), este workflow lo vectoriza y lo guarda en Supabase para que Magda lo pueda consultar via RAG.

**Pendiente de activar** — sin este workflow, la base de conocimiento de Magda queda estática.

---

## 6. INTEGRACIONES EXTERNAS

### 6.1 WordPress Sync
**Archivo:** `WordPress Sync.json`

Sincroniza el catálogo completo de WooCommerce (Tur Central) con el sistema interno.

| Dato | Valor |
|---|---|
| Fuente | WooCommerce Bookings API — `turcentral.com.ar` |
| Credenciales | `ck_5f0c4f5bbf19dc82863782614421eea5d7d3f23d` (read) |

**Datos que extrae por producto (SKU Map):**
- `regular_price`, `display_cost`, `cost`, `block_cost`
- `availability`, `first_block_time`, `default_date_availability`
- `qty`, `max_persons`, `min_persons`
- `has_persons`, `person_types`, `has_person_cost_multiplier`
- `duration`, `duration_unit`, `min_duration`, `max_duration`
- `min_date_value`, `max_date_value`, `restricted_days`
- `has_resources`, `requires_confirmation`, `can_be_cancelled`
- `addons_meta` — estructura completa de addons (tipos de pasajero + precios)

**Resultado:** Un mapa `{sku → datos}` con todo lo necesario para que Magda calcule precios y disponibilidad sin consultar WooCommerce en tiempo real.

---

### 6.2 Google Merchants
**Archivo:** `Google Merchats.json`

| Dato | Valor |
|---|---|
| Trigger | Manual ("When clicking 'Execute workflow'") |
| Fuente | WooCommerce — Turismo Bariloche (credential: "Turismo Bariloche Solo Lectura") |
| Destino | Google Merchant Center |
| Formato | Feed ARS en español para Argentina |

**Formato de cada producto subido:**
```json
{
  "offerId": "{id}",
  "title": "{nombre}",
  "description": "{descripción limpia sin HTML}",
  "link": "{permalink}",
  "imageLink": "{imagen principal}",
  "availability": "in stock / out of stock",
  "condition": "new",
  "price": {"value": N, "currency": "ARS"},
  "brand": "Turismo Bariloche",
  "contentLanguage": "es",
  "targetCountry": "AR",
  "channel": "online"
}
```

---

### 6.3 SerpApi Google Maps → Strapi Alojamientos
**Archivo:** `SerpApi Google Maps → Strapi Alojamientos.json`

| Dato | Valor |
|---|---|
| Trigger | Chat trigger (agente interactivo) |
| LLM | GPT-4.1 (AXL server) |
| Fuente | SerpAPI — búsqueda Google Maps de alojamientos en Bariloche |
| Destino | Strapi (colección alojamientos) |

Agente IA que, dado un nombre o tipo de alojamiento, lo busca en Google Maps via SerpAPI y carga los resultados en Strapi. Construye el catálogo de alojamientos de forma semiautomática.

---

### 6.4 Strapi — Asignar Pickups a Excursiones ❌ OFF
**Archivo:** `Strapi - Asignar todos los Pickups a todas las Excursiones.json`

⚠️ **El nombre es engañoso.** El contenido real es un **fragmentador de mensajes de Chatwoot**.

| Dato | Valor |
|---|---|
| Token Chatwoot | `oqzN2R4JjSVVwxJrTQj97Q3S` (token viejo — actualizar) |
| URL | `iadventurecenter.com/api/v1/accounts/1/conversations/{id}/messages` |

**Función real:** Toma la respuesta larga de Magda y la divide en fragmentos menores de 280 caracteres para enviarlos como múltiples mensajes en Chatwoot. Lógica de división:
1. Por separador `---`
2. Por productos numerados `**N)**`
3. Por párrafos y cierre
4. Detecta frases de cierre con regex (para separar cuerpo + despedida)

---

## 7. AGENTE INTERNO PB2

### 7.1 Sasha Alpha Test
**Archivo:** `Sasha Alpha Test.json`

**Asistente IA interno para gestionar el ERP de Patagonia Booking 2.** No interactúa con clientes.

| Dato | Valor |
|---|---|
| Trigger | Chat embed con Basic Auth (`Sasha Basic Auth For ChatEmbed`) |
| LLM | GPT-4o (AXL server) |
| Backend | MCP sobre `auth.iadventurecenter.com/mcp` |
| Streaming | ✅ Habilitado con respuesta en tiempo real |

**Colecciones que gestiona (vía MCP tools):**

| Colección | Descripción | Vol. aprox. |
|---|---|---|
| `v2-voucher` | Vouchers de excursiones (id, fecha, pasajeros, pago, estado) | ~774 activos |
| `v2-calendario` | Días con excursiones (capacidad, ocupados, guías, vehículos) | ~274 días |
| `v2-excursion` | Excursiones disponibles (precio, horarios, pickup, descripción) | 42 |
| `v2-horario` | Franjas horarias disponibles | 123 |
| `v2-reserva` | Reservas (human_id RSV-YYYY-ID, estado: lock/part/sales) | — |
| `v2-guia` | Guías (nombre, CBU, prioridad, rafting) | — |
| `v2-chofer` | Choferes (nombre, CBU, prioridad) | — |
| `v2-vehiculo` | Vehículos (patente, tipo, capacidad) | — |
| `v2-transporte` | Empresas de transporte | — |
| `v2-direccion-pickup` | Puntos de pickup (coordenadas, maplink) | — |
| `v2-alojamiento` | Alojamientos (dirección, lat/long, URL Maps) | — |
| `v2-metodo-de-pago` | Métodos de pago con ajustes | — |
| `v2-descuento` | Descuentos (porcentual o fijo) | — |
| `v2-adicional` | Adicionales contratables | — |
| `v2-variable-comision` | Estructura de comisiones | — |
| `v2-gasto-operativo` | Gastos operativos (tipo, monto, proveedor, estado) | — |
| `v2-liquidacion-vendedor` | Liquidaciones por período | — |
| `v2-sueldo-vendedor` | Sueldos (fijo + comisiones + total neto) | — |
| `v2-impuesto-venta` | IVA, IIBB, retenciones | — |
| `cliente` | Clientes (nombre, teléfono, país, nota operativa) | — |
| `cuenta-bancaria` / `movimiento-cuenta` | Contabilidad | — |
| `marca` | Marcas del grupo (website, entidad) ⚠️ sin exponer credenciales | — |

**Regla crítica:** Siempre usar colecciones `v2-*`. Las sin prefijo son legacy.

---

---

## 8. WORKFLOWS NO DESCARGADOS LOCALMENTE

Estos workflows aparecen en n8n pero no están en `salidas/N8N ORIGINAL/`. Hay que bajarlos del servidor.

### 8.1 Mercado Pago Brasil ✅ ON — En investigación
**Archivo:** `Mercado Pago Brasil.json` | **Nodos:** 1

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `828ece46-6a03-48d8-b134-6e1a647afb7a-mercado-brasil` |
| Webhook ID | `828ece46-6a03-48d8-b134-6e1a647afb7a` |
| Workflow ID n8n | `7UrvRV9SnQ1jeolo` |
| Estado | Solo tiene el webhook trigger — en etapa de investigación/prototipado, sin lógica construida aún |

### 8.2 Mercado Pago Argentina ✅ ON — En investigación
**Archivo:** `Mercado Pago Argentina.json` | **Nodos:** 1

| Dato | Valor |
|---|---|
| Trigger | Webhook POST `38bfc2b2-a8b7-4986-9b23-2770347d4e8d-mercado` |
| Webhook ID | `38bfc2b2-a8b7-4986-9b23-2770347d4e8d` |
| Workflow ID n8n | `cqp8rIo08NRGxszw` |
| Estado | Solo tiene el webhook trigger — en etapa de investigación/prototipado, sin lógica construida aún |

### 8.3 My workflow 2 ❌ OFF
**Creado:** 10 April | **Última actualización:** 2 meses

Workflow sin nombre descriptivo, inactivo. Posiblemente un reporte o prueba derivada de `My workflow`.

### 8.4 My workflow 3 ❌ OFF
**Creado:** 19 June (hoy) | **Última actualización:** 2 horas

Recién creado. Sin contenido conocido aún.

---

## Mapa de Credenciales Detectadas

| Sistema | Dato | Workflows que lo usan |
|---|---|---|
| Chatwoot API token principal | `EaxPXr92jfEGQvbeTSG3snVv` | VENTAS, My workflow |
| Chatwoot API token viejo | `oqzN2R4JjSVVwxJrTQj97Q3S` | Strapi-Pickups ⚠️ |
| Supabase anon JWT | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Herramientas Magda 1.9 |
| OpenAI AXL server | credential ID `uCWj7Tipiok6S9Em` | Magda 2.x, SerpApi, Sasha |
| OpenAI Magda Audio | credential ID `pMNroEWdf0pJVkIT` | MCP Magda 1.x (embeddings) |
| Notion account | credential ID `7qjq213WfdUbIFYl` | MCP Servers |
| WooCommerce Tur Central | `ck_5f0c4f5b...` / `cs_9ab6be31...` | WordPress Sync |
| WooCommerce TB Solo Lectura | credential name | Google Merchants |
| Strapi Account | credential ID `81ajQ8dcasfGklGD` | MCP Magda 1.x (directionBrand) |
| Baserow account | credential ID `bo2jMrH0oChSOcbG` | VENTAS, MCP Magda 1.x |
| Sasha Basic Auth | credential ID `OeyMxlfYzMRQWvA4` | Sasha Alpha Test |
| GPS RSV | API key en URL | Posición de vehículos |

---

## Problemas Identificados

| # | Problema | Impacto | Solución |
|---|---|---|---|
| 1 | Magda 2.1 (más nueva) está OFF | Producción corre versión anterior | Activar 2.1, desactivar 2.0 |
| 2 | Magda 2.0 y 2.1 comparten webhook ID | Si ambas están ON → doble respuesta | Desactivar 2.0 al activar 2.1 |
| 3 | Magda For Chatwoot 1.9 duplicada | Doble respuesta confirmada | Desactivar uno de los dos |
| 4 | 4 versiones de Magda activas (1.6.4, 1.9.1, 2.0, For Chatwoot 1.9) | Conflictos en webhooks, respuestas múltiples | Dejar solo 2.1 activa |
| 5 | URLs `iadventurecenter.com` hardcodeadas en workflows | Romperán tras migración de dominio | Find & replace masivo en JSON |
| 6 | Token viejo en Strapi-Pickups | Puede dejar de funcionar | Reemplazar por token principal |
| 7 | RAG Auto-Update OFF | Base de conocimiento de Magda no se actualiza sola | Activar tras verificar Notion |
| 8 | Magda 1.9 hw copy usa GPT-5.2 experimental | Puede fallar en producción | Solo para desarrollo |
| 9 | WordPress Sync sin trigger automático (¿?) | Catálogo puede quedar desactualizado | Agregar schedule trigger |
| 10 | Google Merchants es manual | Requiere ejecución manual para actualizar feed | Agregar schedule trigger |

---

## Pendientes de Acción

**Inmediatos:**
- [ ] Desactivar `Magda For Chatwoot 1.9 (1)` (duplicado)
- [ ] Cuando migración esté lista: activar Magda 2.1 + desactivar 2.0, 1.9.1, 1.6.4, For Chatwoot 1.9

**Tras migración de dominio:**
- [ ] Find & replace `iadventurecenter.com` → `iadventurecentersx.com` en todos los JSON
- [ ] Actualizar token viejo en `Strapi - Asignar Pickups`
- [ ] Activar `RAG Auto-Update desde Notion v2`
- [ ] Activar `Redis Optimize & Extra Tools` para optimizar performance

**Mejoras:**
- [ ] Agregar schedule trigger a `WordPress Sync` (propuesta: diario a las 6am)
- [ ] Agregar schedule trigger a `Google Merchants` (propuesta: semanal)
- [ ] Resolver nombre engañoso de `Strapi - Asignar todos los Pickups` (renombrar)
