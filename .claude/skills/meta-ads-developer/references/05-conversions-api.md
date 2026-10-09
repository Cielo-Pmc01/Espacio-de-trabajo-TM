# 05 — Conversions API (CAPI)

Verificado contra docs oficiales el 2026-10-08 salvo donde diga ⚠️.

## Endpoint ✅
`POST https://graph.facebook.com/{API_VERSION}/{PIXEL_ID o DATASET_ID}/events?access_token={TOKEN}` — versión: usar la fijada en la integración; la más reciente al 2026-10-08 es **v26.0** (v25.0 sigue disponible; ver `00` y `07`).
Mismo Pixel ID para eventos de browser y de servidor (así se deduplican).

## Payload mínimo web ✅
```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1633552688,
    "event_id": "order-12345",
    "action_source": "website",
    "event_source_url": "https://tienda.com/checkout/order-received/12345/",
    "user_data": {
      "em": ["<sha256 del email>"],
      "ph": ["<sha256 del teléfono>"],
      "client_ip_address": "192.0.2.1",
      "client_user_agent": "Mozilla/5.0 ...",
      "fbc": "fb.1.1633552000000.<fbclid>",
      "fbp": "fb.1.1633552000000.<random>"
    },
    "custom_data": { "value": 100.2, "currency": "ARS", "content_ids": ["sku-1"], "content_type": "product" },
    "opt_out": false
  }],
  "test_event_code": "TEST12345"
}
```
- `test_event_code`: solo para pruebas (aparece en Events Manager → Test Events). **Sacarlo en producción** ✅.
- `access_token` como query param o form field ✅.

## Límites ✅
- Máx. **1.000 eventos** por request (`data[]`).
- `event_time`: hasta **7 días** atrás; `physical_store` hasta **62 días**.
- Verificable en Events Manager en ~**20 min** tras enviar.
- Respuestas: 2xx válido; 4xx inválido con poco detalle. Timeout sugerido ~**1500 ms** (la mayoría responde < 600 ms); reintentar en errores no-cliente (timeouts) ✅.
- CAPI cuenta contra la cuota de Marketing API, no tiene límite propio específico ✅.

## Parámetros de user_data ✅
- **Hashear (SHA-256, minúsculas, sin espacios):** `em`, `ph`, `fn`, `ln`, `ge`, `db`, `ct`, `st`, `zp`, `country`. `external_id`: hash recomendado.
- **NO hashear:** `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `subscription_id`, `fb_login_id`, `lead_id`, `page_id`, `page_scoped_user_id`, `ctwa_clid`, `ig_account_id`, `ig_sid`.
- Para eventos web son obligatorios `client_user_agent`, `action_source` y `event_source_url` ✅.
- ✅ **Normalización verificada (2026-10-08):** `em` sin espacios al inicio/fin y en minúsculas; `ph` sin símbolos, letras ni ceros iniciales y **con código de país**; `fn`/`ln`/`ct` minúsculas sin puntuación (UTF-8); `st` 2 caracteres minúsculas; `zp` minúsculas sin espacios ni guiones; `country` ISO 3166-1 alpha-2 en minúsculas; `ge` `f`/`m`/`o`; `db` `YYYYMMDD`; todos SHA-256 y admiten arrays. **No se hashean:** IP, user-agent, `fbc`, `fbp`, `ctwa_clid`, `lead_id`, `page_id`, `ig_account_id`. En `custom_data` de `Purchase`: `value` numérico **obligatorio**, `currency` ISO 4217 **obligatorio**; también `content_ids`, `content_type` (`product`/`product_group`), `contents[]` (`id`, `quantity`, `item_price`), `num_items`, `order_id`. Especificación completa para Pb2: `planes/2026-10-08-especificacion-pixel-capi-pb2.md`.
- ⚠️ (histórico, ya verificado arriba) Normalización: teléfono solo dígitos con código de país (ej. `5492944123456`, sin `+` ni ceros); email en minúsculas y trim. `fbc` = `fb.1.<timestamp_ms>.<fbclid>` y `fbp` = cookie `_fbp` (formato `fb.<subdomainIndex>.<ms>.<valor>` **verificado ✅ en `16`**; el `fbclid` es sensible a mayúsculas, no modificarlo). `value` numérico (no string con símbolo), `currency` ISO-4217 (`ARS`, `BRL`, `USD`).

## Deduplicación Pixel + CAPI ✅
Método 1 (recomendado): **`eventID` del Pixel == `event_id` de CAPI** y **`event` == `event_name`**. Ej. browser: `fbq('track','Purchase',{value:12,currency:'ARS'},{eventID:'order-12345'})`.
Método 2 (limitado): `event_name` + `fbp` y/o `external_id` iguales en browser y servidor.
- Ventana: **48 horas** desde el primer evento con ese `event_id`; se conserva el primero recibido y se descartan los siguientes idénticos.
- Errores típicos: sin `event_id` en ninguno de los dos lados; nombres de evento distintos (`purchase` vs `Purchase`); CAPI "solo servidor" sin evento browser (no hay nada que deduplicar, pero tampoco hay fbp/fbc salvo que se capturen); `event_id` distinto en cada lado.
- Buena práctica: usar un ID estable del negocio (`order_id`) como `event_id` en ambos canales.

## CAPI para Click-to-WhatsApp (business_messaging) ✅ (ejemplo oficial con v16.0 ⚠️ usar versión vigente)
```json
POST /{DATASET_ID}/events
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1675999999,
    "action_source": "business_messaging",
    "messaging_channel": "whatsapp",
    "user_data": { "whatsapp_business_account_id": "<WABA_ID>", "ctwa_clid": "<CLICK_ID>" },
    "custom_data": { "currency": "ARS", "value": 123 }
  }],
  "partner_agent": "<NOMBRE>"
}
```
- `ctwa_clid` viene en el objeto **`referral`** del webhook de mensajes de WhatsApp del primer mensaje del anuncio → **hay que guardarlo** (Supabase/Chatwoot custom attribute) en cuanto llega el chat.
- Requisitos oficiales: Dataset creado con `whatsapp_business_account_id`; permisos avanzados `whatsapp_business_management` y `whatsapp_business_manage_events`; tier de Marketing API con ≥ **1500 llamadas exitosas** ✅.
- 🏢 Implicancia Adventure Center: la atribución anuncio→WSP→venta hoy está subestimada porque el `ctwa_clid`/referral no siempre se refleja en Chatwoot. Ver `99-contexto-adventure-center.md`.

## Access token de CAPI ✅
Se genera en Events Manager → Dataset → Configuración → "Generate access token"; solo visible con **privilegios de desarrollador** en el negocio; no requiere App Review. Alternativa: token de System User con acceso al dataset. ⚠️ [RE-VERIFICAR] qué permiso/asset exacto necesita el System User sobre el dataset.

## Implementación en WooCommerce/WordPress ⚠️ [RE-VERIFICAR antes de recomendar]
Opciones: (a) plugin oficial "Facebook for WooCommerce" (Pixel + CAPI nativo); (b) Site Kit/GTM + server-side; (c) implementación propia: hook de WooCommerce en `woocommerce_thankyou`/`woocommerce_payment_complete` → n8n/endpoint → CAPI con `event_id = order_id`. **Regla:** una sola vía por evento; si hay GTM + plugin + Site Kit a la vez, sospechar duplicación. Verificar primero qué hay instalado (SSH/wp-cli, ver `reference_hostinger_ssh_acceso`).

## Implementación en n8n ⚠️
Nodo HTTP Request POST a Graph API; hashing SHA-256 con nodo Crypto o Code; `event_time` en segundos Unix; credencial de token en n8n (no en el flujo). Estructura de `user_data` arriba. Probar primero con `test_event_code`.

## Diagnóstico rápido
Ver `12-arboles-diagnostico.md` → "Purchase en WooCommerce pero no en Meta" y "Eventos duplicados".

## Dataset Quality API — medir la calidad de los eventos ✅ (doc oficial leída 2026-10-09)
**Para qué:** después de enviar eventos por CAPI, comprobar con datos (no a ojo) si Meta los está asociando bien. Es **solo lectura (GET)**. Útil para el caso TB: verificar que la señal se recuperó.
- **Endpoint:** `GET https://graph.facebook.com/{API_VERSION}/dataset_quality` (la doc muestra v25.0 en el texto y `<LATEST_VERSION>` en el ejemplo; usar la versión fijada en `00`).
- **Parámetros:** `dataset_id` (obligatorio; es el ID del Pixel/Dataset), `access_token` (obligatorio; la doc recomienda token de **System User de larga duración**), `agent_name` (opcional, minúsculas; filtra eventos enviados con `partner_agent`), `fields` (ej. `web{event_match_quality,event_name}`).
- **Permisos:** usuario con *Acceso parcial → Usar el dataset de eventos*; app con `ads_read` **y** (`ads_management` **o** `business_management`). Con acceso avanzado: `ads_management` avanzado + función *Marketing API Access Tier* (puede requerir App Review).
- **Ejemplo:** `curl -G -d 'fields=web{event_match_quality,event_name}' -d 'dataset_id=<DATASET_ID>' -d 'access_token=<TOKEN>' https://graph.facebook.com/{API_VERSION}/dataset_quality`
- **Qué devuelve (por evento, bajo `web`):**
  - `event_match_quality`: `composite_score` (0–10; "cuán bien la información del cliente enviada desde el servidor puede asociar el evento a una cuenta de Meta"), `match_key_feedback[]` (por parámetro: `identifier`, `coverage.percentage`, `potential_aly_acr_increase`) y `diagnostics[]` (`name`, `description`, `solution`, `percentage`, `affected_event_count`, `total_event_count`). **Se calcula en tiempo real** y **solo existe para eventos web** (offline, app y leads: consultar con Meta).
  - **ACR (Additional Conversions Reported):** estimación de cuántas conversiones se miden gracias a la integración CAPI; variantes por evento, por parámetro y por cobertura (promedios de 7 días).
  - **Event Coverage:** promedio de 7 días del % de eventos del Pixel que también llegan por CAPI **y comparten clave de deduplicación**; objetivo de la doc: **75 %**.
  - **Deduplicación (`dedupe_key_feedback[]`):** por clave (`dedupe_key`), % de eventos de navegador y de servidor que la traen y cobertura global. Compartir la clave en **todos** los eventos.
  - **Data Freshness:** `upload_frequency` (`real_time`, `hourly`…) = demora entre el hecho y la recepción en Meta; enviar en tiempo real o lo más cerca posible.
- **Notas:** métricas ACR/Coverage/Dedupe/Freshness/Diagnostics agregadas el 28/5/2025. Hay una versión **beta** para *offline events*. Con acceso Full Tier la cuota bajó de 1.500 a **500 llamadas a Marketing API en 15 días** → no consultarla en bucle (ver regla de no insistir contra la API).
- **Cómo aplicarlo a TB (cuando se active el envío real):** (1) consultar `Purchase` y ver `composite_score` y `diagnostics`; (2) revisar `match_key_feedback` para ver qué parámetros faltan (típicamente `fbp`, `fbc`, `email`, `client_ip_address`, `client_user_agent`); (3) en `dedupe_key_feedback` confirmar que Pixel (GTM) y CAPI (n8n) traen el mismo `event_id` = N° de pedido; (4) si `Event Coverage` < 75 %, falta el evento de navegador o la clave compartida. Alternativa sin API: *Events Manager → Dataset → Resumen/Calidad de coincidencia de eventos*.
- ⚠️ **No verificado:** los valores exactos de `diagnostics.name`, el comportamiento con datasets recién creados (sin tráfico suficiente) y si el token de n8n actual alcanza (permisos del token de CAPI vs. los que pide esta API).
