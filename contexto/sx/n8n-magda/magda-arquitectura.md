# Magda — Arquitectura y Estado del Sistema

> Sistema de IA conversacional para atención al cliente de Adventure Center vía WhatsApp/Chatwoot.
> Uno de los sistemas más críticos de la empresa.
> Última actualización: 2026-06-19

---

## Qué es Magda

Agente de IA que atiende clientes en WhatsApp a través de Chatwoot. Gestiona consultas de excursiones, reservas, datos de clientes y escalada a agentes humanos. Corre en n8n con múltiples sub-agentes especializados.

**Archivos fuente:** `salidas/N8N ORIGINAL/` (23 workflows JSON — hay 26 en total en el servidor, 4 no descargados aún: Mercado Pago Brasil, Mercado Pago Argentina, My workflow 2, My workflow 3)

---

## Arquitectura de Conexiones

```
WhatsApp / Cliente
      ↓
Evolution API (s2.iadventurecentersx.com)
      ↓
Chatwoot (iadventurecentersx.com)  ←→  Agentes humanos (escalada)
      ↓ webhook
n8n — Magda (motor principal)
      ├── Redis          → buffer de mensajes + memoria de chat por conversación
      ├── Supabase       → persistencia larga + RAG con pgvector
      │     └── sup.getjasper.digital (tablas: tareas, avehiculos, etc.)
      ├── OpenAI         → LLM (GPT-4o) + embeddings
      ├── Baserow        → catálogo de excursiones (precios, disponibilidad)
      └── WooCommerce    → reservas y pagos (back.iadventurecentersx.com)

Sub-agentes especializados (Magda 2.0+):
      ├── s1: Escalabilidad — asignación de agentes humanos
      ├── s2: Etiquetas    — clasificación automática de conversaciones
      ├── s3: Notas        — gestión de contexto en CRM Chatwoot
      └── s4: Atributos    — captura y actualización de datos del cliente
```

---

## Servicios Externos

| Servicio | URL | Estado |
|---|---|---|
| Chatwoot | `iadventurecentersx.com` | ✅ Migrado (era iadventurecenter.com) |
| Evolution API | `s2.iadventurecentersx.com` | 🔄 Migrando |
| WooCommerce | `back.iadventurecentersx.com` | 🔄 Migrando |
| Supabase | `sup.getjasper.digital` | ✅ Sin cambios |
| Strapi / PB2 | `auth.iadventurecenter.com/mcp` | ✅ (Sasha) |
| Redis | interno n8n | ✅ Sin cambios |
| OpenAI | externo (GPT-4o, GPT-4.1) | ✅ Sin cambios |
| Baserow | externo (datatable `magda`) | ✅ Sin cambios |
| Google Maps (SerpAPI) | externo | ✅ Sin cambios |

---

## Inventario Completo de Workflows (23)

### Workflows de Magda — Núcleo de Atención al Cliente

| Estado | Archivo | Nodos | Descripción |
|---|---|---|---|
| ✅ ON | `Magda 2.0 - Alpha Test.json` | 160 | **Versión en producción actual.** Agente conversacional principal con sub-agentes s1–s4. Stack: Chatwoot + Supabase + Redis + OpenAI + WooCommerce. Trigger: webhook de Chatwoot |
| ✅ ON | `Magda 1.6.4 Lite Services.json` | 192 | Versión anterior aún activa. Sin WooCommerce, usa Baserow para catálogo. Stack: Chatwoot + Supabase + Redis + OpenAI + Baserow |
| ✅ ON | `Magda 1.9.1 HW - Beta Build (1).json` | 174 | Versión intermedia activa. Integra WooCommerce y Baserow. Stack full |
| ✅ ON | `Magda For Chatwoot 1.9 HW - Alfa Chatwoot.json` | 109 | Variante Chatwoot-first. Stack completo |
| ✅ ON | `Magda For Chatwoot 1.9 HW - Alfa Chatwoot (1).json` | 109 | **DUPLICADO EXACTO del anterior** — ambos ON, causa doble respuesta |
| ❌ OFF | `Magda 2.1 Beta Release.json` | 187 | **Versión más nueva y completa.** Pendiente de activar. Reemplaza a 2.0. Stack: Chatwoot + Supabase + Redis + OpenAI + WooCommerce |
| ❌ OFF | `Magda 2.json` | 54 | Prototipo de Magda 2 con Baserow DataTable para config. Webhook path `magdatwo`. Incompleto |
| — | `Magda 1.9 hw copy.json` | — | Copia de desarrollo con **GPT-5.2** (modelo experimental). No productivo. Webhook interno |

### Sub-agentes y Herramientas de Magda

| Estado | Archivo | Nodos | Descripción |
|---|---|---|---|
| ✅ ON | `MCP Magda 1.x.json` | 62 | Sub-agente MCP integrado en Magda. Expone tools via MCP protocol. Stack: Chatwoot + Supabase + Redis + OpenAI + Baserow |
| ✅ ON | `MCP Servers.json` | 139 | Servidor MCP con herramientas de Chatwoot + Redis + OpenAI. Alimenta a Magda como tool provider |
| ✅ ON | `Herramientas Magda 1.9.json` | — | Sub-agente de herramientas. Webhook `memory-1_9`. Recibe llamadas de Magda 1.9 para actualizar tareas en Supabase (tabla `tareas`) vía PATCH |
| ❌ OFF | `Redis Optimize & Extra Tools For Magda.json` | — | Extrae datos de WooCommerce, convierte HTML → Markdown limpio y los cachea en Redis para que Magda los consulte más rápido (catálogo de excursiones con precios y addons) |

### Workflows Auxiliares de Operación

| Estado | Archivo | Nodos | Descripción |
|---|---|---|---|
| ✅ ON | `VENTAS.json` | 117 | Flujo de ventas automatizado. Stack: Chatwoot + Baserow |
| ✅ ON | `Almacenar ultimo mensaje enviado por el cliente.json` | 34 | Escucha mensajes entrantes de Chatwoot y guarda el último mensaje de cada cliente en Supabase |
| ✅ ON | `Formularios y Status.json` | 16 | Gestiona formularios y actualizaciones de estado en Evolution API |
| ✅ ON | `Pocision de vehiculos.json` | — | **Schedule trigger cada 4 minutos.** Consulta API GPS de `rsv.com.ar` (flota de vehículos) y guarda latitud/longitud/velocidad/conductor en Supabase (tabla `avehiculos`) |
| ❌ OFF | `RAG Auto-Update desde Notion v2.json` | 10 | Actualización automática del índice vectorial en Supabase desde Notion (RAG para Magda). 10 nodos. Pendiente de activar |

### Workflows de Integración con Sistemas Externos

| Estado | Archivo | Nodos | Descripción |
|---|---|---|---|
| — | `WordPress Sync.json` | — | Sincroniza productos de WooCommerce (Tur Central — `turcentral.com.ar`) con el sistema interno. Construye SKU Map con precios, disponibilidad, capacidad, addons y datos de reserva |
| — | `Google Merchats.json` | — | **Manual trigger.** Sube productos de Turismo Bariloche (WooCommerce, read-only credentials) a Google Merchant Center en formato feed ARS |
| — | `SerpApi Google Maps → Strapi Alojamientos.json` | — | Agente IA que busca alojamientos en Bariloche vía SerpAPI (Google Maps) y los carga en Strapi/Alojamientos. Usa OpenAI GPT-4.1 |
| — | `Strapi - Asignar todos los Pickups a todas las Excursiones.json` | — | Helper de fragmentación de mensajes. Divide respuestas largas de Magda en múltiples mensajes de Chatwoot y los envía secuencialmente. API token hardcodeado (iadventurecenter.com — actualizar) |
| — | `My workflow.json` | — | Reporte de conversaciones de Chatwoot (últimos 7 días, métrica `conversations_count`, UTC-3). Sin trigger automático |

### Agentes Internos

| Estado | Archivo | Descripción |
|---|---|---|
| — | `Sasha Alpha Test.json` | **Agente interno de PB2 (Patagonia Booking 2).** No es para clientes. Gestiona el ERP: vouchers, calendario de excursiones, guías, choferes, vehículos, pickups, pagos, finanzas. Usa MCP tools sobre `auth.iadventurecenter.com/mcp`. Acceso con autenticación Basic Auth |

---

## Detalle: Sasha (Agente Interno PB2)

Agente separado de Magda. Usada internamente por el equipo para operar el ERP de Adventure Center.

**Trigger:** Chat embed con Basic Auth (`Sasha Basic Auth For ChatEmbed`)
**LLM:** GPT-4o
**Acceso a colecciones (todas vía MCP):**

| Recurso | Colección | Cantidad |
|---|---|---|
| Vouchers | `v2-voucher` | ~774 activos |
| Calendario de salidas | `v2-calendario` | ~274 días |
| Excursiones | `v2-excursion` | 42 disponibles |
| Horarios | `v2-horario` | 123 franjas |
| Reservas | `v2-reserva` | — |
| Guías | `v2-guia` | — |
| Choferes | `v2-chofer` | — |
| Vehículos | `v2-vehiculo` | — |
| Transportes | `v2-transporte` | — |
| Pickups | `v2-direccion-pickup` | — |
| Alojamientos | `v2-alojamiento` | — |
| Clientes | `cliente` | — |
| Pagos, descuentos, gastos, liquidaciones | varias v2 | — |

**Regla crítica de Sasha:** siempre usar colecciones `v2-*` (las sin prefijo son legacy).

---

## Credenciales Detectadas en Workflows

> Solo para referencia interna. Renovar tras migración de dominio.

| Sistema | Referencia | Workflow |
|---|---|---|
| Chatwoot API token | `EaxPXr92jfEGQvbeTSG3snVv` | My workflow, Strapi-Pickups |
| Chatwoot API token viejo | `oqzN2R4JjSVVwxJrTQj97Q3S` | Strapi-Pickups (⚠️ URL vieja) |
| Supabase anon JWT | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Herramientas Magda 1.9 |
| WooCommerce Tur Central | `ck_5f0c4f5b...` / `cs_9ab6be31...` | WordPress Sync |
| WooCommerce TB (read-only) | `Turismo Bariloche Solo Lectura` | Google Merchats |
| OpenAI (AXL server) | credential ID `uCWj7Tipiok6S9Em` | SerpApi workflow |
| GPS RSV | `https://www.rsv.com.ar/api/dWJaAiZMVPPS...` | Posición vehículos |

---

## Problemas Conocidos

1. **Duplicado activo** — `Magda For Chatwoot 1.9` y `Magda For Chatwoot 1.9 (1)` son idénticos y ambos ON → responde dos veces al mismo mensaje

2. **Versión más nueva desactivada** — Magda 2.1 Beta (187 nodos, la más completa) está OFF. La 2.0 Alpha es la que corre en producción

3. **Múltiples versiones activas simultáneamente** — 1.6.4, 1.9.1 y 2.0 activas → riesgo de conflictos en el mismo webhook de Chatwoot

4. **Migración de dominio pendiente** — URLs `iadventurecenter.com` hardcodeadas en workflows (credenciales, endpoints). Hacer find & replace masivo en todos los JSON tras migrar Evolution API y WooCommerce

5. **`Strapi - Asignar Pickups` con token viejo** — tiene hardcodeado un API token diferente al principal y apunta a URL vieja de Chatwoot

6. **`Magda 1.9 hw copy`** usa GPT-5.2 (modelo experimental, puede no existir en producción)

---

## Plan de Migración de Dominio

**Trigger:** cuando Evolution API y WooCommerce estén en `iadventurecentersx.com`

```bash
# Ejecutar sobre todos los JSON en salidas/N8N ORIGINAL/
find-replace: "iadventurecenter.com" → "iadventurecentersx.com"
```

Afecta principalmente:
- URLs de Chatwoot API (`/api/v1/accounts/1/...`)
- URLs de Evolution API (`s2.iadventurecenter.com`)
- URLs de WooCommerce (`back.iadventurecenter.com`)
- Token de Chatwoot hardcodeado en `Strapi - Asignar Pickups`

---

## Recomendación de Limpieza

**Activar:**
- Magda 2.1 Beta Release (187 nodos) — la más completa

**Desactivar:**
- Magda 1.6.4 Lite Services
- Magda 1.9.1 HW Beta Build
- Magda For Chatwoot 1.9 HW - Alfa Chatwoot (1) — duplicado
- Magda For Chatwoot 1.9 HW - Alfa Chatwoot
- Magda 2.0 Alpha Test (reemplazada por 2.1)

**Activar cuando listo:**
- RAG Auto-Update desde Notion v2 (para mantener el índice vectorial al día)

---

## Pendientes

- [ ] Completar migración Evolution API a `s2.iadventurecentersx.com`
- [ ] Completar migración WooCommerce a `back.iadventurecentersx.com`
- [ ] Find & replace masivo en todos los JSON de `salidas/N8N ORIGINAL/`
- [ ] Decidir qué versión de Magda queda definitiva (recomendado: 2.1)
- [ ] Resolver duplicado de `Magda For Chatwoot 1.9`
- [ ] Actualizar token viejo en `Strapi - Asignar todos los Pickups`
- [ ] Activar `RAG Auto-Update desde Notion v2`
