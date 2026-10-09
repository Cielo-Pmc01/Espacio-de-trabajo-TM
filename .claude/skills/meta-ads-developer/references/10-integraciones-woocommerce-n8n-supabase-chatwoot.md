# 10 — Integraciones y arquitectura de tracking (Adventure Center)

Este archivo mezcla **hechos verificados** (✅, ver `05`, `09`) con **diseños recomendados** (🧭, no son hechos de Meta). Antes de proponer cambios, verificar cómo está implementado hoy.

## Estado real (2026-10-08) 🏢
- **TB:** el checkout se mudó a **Pb2** (~14/9). WordPress/WooCommerce ya no registra órdenes; el Pixel de WordPress no ve la compra. Dataset TB `1101029451234929` casi sin eventos. Anuncios "TB - Ventas Web" siguen gastando (hasta ~20k clics/día) → **Meta no recibe la señal de las ventas reales**. Detalle y evidencia en `99-contexto-adventure-center.md`.
- **WordPress (turismobariloche.ar):** capas activas: Pixel Manager (`wgact` 1.69.1, con CAPI token y `test_event_code` cargado), Facebook for WooCommerce (píxel apagado, `pixel_id=0`), GTM4WP, Site Kit, LiteSpeed, 3 mu-plugins propios que dependen de `fbq`. Regla: **un solo emisor por evento**.
- **Pb2:** sin API de reportes de ventas; se trabaja en instancia separada (no tocar desde este workspace) → entregar especificaciones.

## 🧭 Diseño: Pixel + CAPI en el checkout de Pb2 (a entregar al dev de Pb2)
Objetivo: que cada reserva pagada llegue a Meta **una sola vez** con calidad de match.
1. **Browser (Pixel base)** en todas las páginas de Pb2 que reciben tráfico de anuncios: `PageView`; `ViewContent` (ficha de excursión); `InitiateCheckout` (inicio de reserva); `Purchase` en la confirmación. Mismo Pixel/dataset por marca (TB = `1101029451234929`, a confirmar).
2. **Identificador de deduplicación:** `event_id = <ID de reserva/orden de Pb2>` idéntico en el `fbq('track','Purchase',…,{eventID})` y en CAPI; mismo `event_name` (`Purchase`).
3. **Servidor (CAPI) desde el backend de Pb2** al confirmarse el pago (webhook de Mercado Pago ya consumido por Pb2): `POST /{API_VERSION}/{DATASET_ID}/events` con `action_source:"website"`, `event_source_url`, `event_time` (segundos), `user_data{em, ph hasheados, client_ip_address, client_user_agent, fbp, fbc, external_id}`, `custom_data{value, currency:"ARS"/"BRL"/"USD", content_ids, content_type}`.
4. **Persistir en la reserva** al inicio del checkout: `fbp` (cookie `_fbp`), `fbc` (cookie `_fbc` o armar `fb.1.<ts_ms>.<fbclid>`), `fbclid`, `utm_*`, user-agent, IP. Sin esto el CAPI de servidor llega sin `fbp/fbc` (peor match).
5. **Token:** generar en Events Manager (dataset → Configuración) o usar el *Conversions API System User* ya existente; guardarlo como secreto del backend, nunca en el repo.
6. **Pruebas:** `test_event_code` solo en entorno de prueba; verificar en Events Manager → *Probar eventos* (~20 min máx.) ✅; **quitar el código en producción** ✅.
7. **Monedas:** respetar la moneda de cada marca (BRL en Brasil) y no mezclar datasets entre portafolios.
8. **Criterio de éxito:** `Purchase` en Events Manager con `value` + `currency`, método "Browser y servidor" y **deduplicado**, EMQ razonable, y coincidencia diaria con la cantidad de reservas pagadas en Pb2.

**9. ⚠️ Riesgo de salto entre dominios (a verificar):** si el anuncio aterriza en `turismobariloche.ar` y el checkout está en **otro dominio** (Pb2), las cookies de primera parte `_fbp`/`_fbc` **no viajan** de un dominio a otro (conocimiento general, no confirmado en la doc de Meta). Opciones: (a) que el anuncio apunte directo a Pb2; (b) propagar `fbclid`/`fbp` en la URL del botón WordPress→Pb2 y reconstruir `fbc` (`fb.1.<ts_ms>.<fbclid>`) en Pb2; (c) un mismo dominio base. Primero confirmar **la URL de destino real de los anuncios** (Windsor devuelve `link_url` nulo → mirarla en el Administrador de anuncios) y el dominio del checkout de Pb2.
**10. Quién emite el CAPI:** backend de Pb2 **o** n8n recibiendo un webhook de "pago aprobado" de Pb2 (alternativa que el agente puede construir si se pide; el Pixel del navegador igual lo debe poner el dev de Pb2).
**Preguntas a cerrar con Cielo antes de implementar:** destino de los anuncios · qué scripts de Meta/GTM tiene Pb2 hoy · dominio y ruta de confirmación · moneda real del cobro · existencia de staging para usar `test_event_code` · ad set (ubicación de conversión, dataset, evento).

## 🧭 Diseño: anuncio → WhatsApp → Chatwoot → venta → Meta
```
Anuncio CTWA → webhook WABA (referral{ctwa_clid, source_id,…}) 
   → n8n (guarda en Supabase: wa_id, ctwa_clid, ad_id, ts) → Chatwoot (atributos personalizados)
   → venta/reserva (Pb2) → n8n cruza por teléfono/wa_id
   → CAPI business_messaging (Purchase, value, currency, ctwa_clid, WABA id) → Meta
```
Tabla Supabase sugerida `meta_attribution`: `id`, `wa_id`/`phone_e164`, `ctwa_clid`, `ad_id`, `adset_id`, `campaign_id`, `source_url`, `fbclid`, `fbc`, `fbp`, `utm_source/medium/campaign/content`, `lead_id`, `chatwoot_conversation_id`, `pb2_reserva_id`, `value`, `currency`, `capi_sent_at`, `capi_event_id`, `created_at`. Un `event_id` estable por venta para reintentos idempotentes.
⚠️ Verificar con un webhook real la forma exacta de `referral` antes de fijar el esquema.

## WooCommerce/WordPress (otras marcas aún en WooCommerce)
Preferir **una** vía: Pixel Manager *o* Facebook for WooCommerce *o* GTM, no varias. Revisar: píxel/dataset correcto por sitio, dominio verificado en el portafolio dueño, `test_event_code` vacío, `Purchase` con `value/currency`, moneda base de WooCommerce vs precios reales (🏢 TB: moneda base interna USD, precios ARS → el mu-plugin fija ARS). Acceso solo lectura por SSH+WP-CLI (ver `reference_hostinger_ssh_acceso`); **no modificar producción sin autorización**.

## n8n
Un nodo HTTP Request por llamada a Graph API con versión fija; credencial central (🏢 `Meta_token_Ale sopran_Y_Sergio_Adc` comparte Sergio ADC + Ale Sopran); reintentos con espera real, sin loops; hashing SHA-256 en un nodo Code/Crypto; `event_time` en segundos; idempotencia por `event_id`. Alertas de saldo ya existentes → no duplicar.

## Supabase / Chatwoot
Supabase como fuente de verdad de atribución (🧭). Chatwoot: guardar atributos personalizados de la conversación (`ctwa_clid`, `ad_id`) vía API (cuidado con `inbox_id`, 🏢) y no depender de que el referral sea visible en la UI.

## Windsor.ai
Lectura de Meta Ads/GA4 sin tocar el token de n8n (🏢 conectado). Limitación: `link_url`/`url_tags` salen nulos para los anuncios revisados. `execute_action` = escritura: solo con confirmación explícita.
