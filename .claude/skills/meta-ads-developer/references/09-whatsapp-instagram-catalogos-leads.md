# 09 — WhatsApp, Instagram, catálogos y leads

✅ doc oficial/UI 2026-10-08 · ⚠️ re-verificar · 🏢 cuenta real

## Click-to-WhatsApp (CTWA) por API ✅
Requisitos: **Página con número de WhatsApp vinculado** (manual o por API); token de Página con `ads_management`, `pages_manage_ads`, `pages_read_engagement`, `pages_show_list`.
Ad set: `"destination_type":"WHATSAPP"`, `optimization_goal:"CONVERSATIONS"` (o `LINK_CLICKS`) bajo `OUTCOME_ENGAGEMENT`, `promoted_object:{"page_id":"<PAGE_ID>"[,"whatsapp_phone_number":"<E164>"]}`.
Creative: `call_to_action:{"type":"WHATSAPP_MESSAGE","value":{"app_destination":"WHATSAPP"}}`.

## ctwa_clid y atribución de ventas por WhatsApp
- ✅ Para reportar a Meta una venta de un chat de anuncio: CAPI con `action_source:"business_messaging"`, `messaging_channel:"whatsapp"`, `user_data{whatsapp_business_account_id, ctwa_clid}`; el `ctwa_clid` sale del objeto **`referral`** del webhook del mensaje entrante (ver `05` para el payload y requisitos: dataset con WABA, permisos `whatsapp_business_management` + `whatsapp_business_manage_events`, tier de API con ≥1500 llamadas exitosas).
- ✅ **Objeto `referral` verificado (doc oficial `webhooks/reference/messages/text`, 2026-10-08):** dentro del mensaje entrante que viene de un anuncio Click-to-WhatsApp llegan `source_url` (URL del anuncio), `source_id` (**ID del anuncio**), `source_type` (`"ad"`), `headline`, `body`, `media_type` (`image`|`video`), `image_url` (si es imagen), `video_url` y `thumbnail_url` (si es video), **`ctwa_clid`** y `welcome_message.text`. **`ctwa_clid` se omite** en mensajes originados en anuncios de **WhatsApp Status**. La doc **no restringe** el `referral` al primer mensaje: aparece en los mensajes provenientes del anuncio (⚠️ confirmar con un webhook real si se reenvía en cada mensaje o solo al abrir el chat). Para atribuir ventas guardar `ctwa_clid` + `source_id` en cuanto llegue el primer mensaje.
- 🏢 Problema conocido: el referral no siempre llega/queda visible en Chatwoot → ventas de anuncios subestimadas (~14%). Solución de diseño: capturar el webhook de la WABA **antes** de Chatwoot (n8n) y guardar `ctwa_clid` + `source_id` (ad id) en Supabase ligado al `wa_id`/teléfono.

## Webhooks (genérico) ✅
Callback HTTPS con **certificado TLS válido** (no autofirmado). Verificación = GET con `hub.mode=subscribe`, `hub.challenge`, `hub.verify_token` → validar el token y **devolver el challenge**. Eventos = POST JSON, firmados con **`X-Hub-Signature-256`** (HMAC-SHA256 del payload con el App Secret) → validar siempre. Lotes de hasta 1000; reintentos inmediatos y luego durante **36 h** → el receptor debe **deduplicar**. WhatsApp usa además **mTLS** (certificado cliente Meta, CN `client.webhooks.fbclientcerts.com`). Suscripción por objeto/campos en App Dashboard. En modo *Development* los webhooks de usuarios externos no corren (⚠️ verificar).
Estructura de mensajes WhatsApp ✅: `object:"whatsapp_business_account"` → `entry[].changes[].value{metadata.phone_number_id, contacts[].wa_id, messages[]}`.

## Lead Ads ✅
Lectura: `GET /{LEAD_ID}` · `GET /{FORM_ID}/leads` · `GET /{AD_ID}/leads` (v25.0). Permisos: `leads_retrieval` + `pages_manage_ads` (para acceso completo); además `pages_read_engagement`, `pages_show_list`, `pages_manage_metadata` (webhooks), `ads_management`. Token de **Página** recomendado (los de usuario tienen rate limit). `field_data`: `[{"name":"email","values":["..."]}]`. Webhook `leadgen`: `leadgen_id`, `page_id`, `form_id`, `adgroup_id`, `ad_id`, `created_time`. En Business Settings → Integraciones → *Acceso a clientes potenciales* se asigna acceso a CRM ✅ (existe en la UI).
**Conversion Leads / CRM** ✅: enviar **todas las etapas** del lead por CAPI con `action_source:"system_generated"`, `user_data.lead_id` (15–17 dígitos), `custom_data{event_source:"crm", lead_event_source:"<CRM>"}`, ≥1 dato de cliente hasheado, carga diaria, ≤1000 eventos por lote. Requisitos del programa: ≥200 leads/mes y conversión del evento 1–40% en ≤28 días.

## Instagram ⚠️
Cuenta profesional conectada a la Página y al portafolio (Business Settings → Cuentas → Cuentas de Instagram) 🏢. Para anuncios: `instagram_user_id` en `object_story_spec`. Si "no aparece Instagram": verificar (1) cuenta es profesional, (2) está conectada a la Página, (3) el portafolio tiene el activo, (4) el usuario/System User tiene el activo asignado. Pasos de UI ⚠️ sin verificar.

## WhatsApp Business Account (WABA) 🏢
- **No se migra entre portafolios**; hay que crear una nueva. Decidir si se reusa el número.
- Facturación de WhatsApp: pestaña *Cuentas de WhatsApp Business* en Facturación y pagos ✅.
- Cuentas de WhatsApp en Turismo Patagonia: 5 (una de prueba "Test WhatsApp Business Account", y "Turcentral") ✅ 🏢.
- Cloud API Rafting: Valle del Manso OK; Patagonia, Villegas, Turcentral con error de registro (ticket abierto) 🏢.

## Catálogos ✅ (parcial)
Permisos `catalog_management` (CRUD) y `business_management` (actualizar). Creación por Commerce Manager; feed (hojas de Google o carga programada) y Batch API de ítems (`/catalog/guides/manage-catalog-items/catalog-batch-api`). ⚠️ No verificado: product sets y asignación catálogo↔Página/píxel.
🏢 En Turismo Patagonia hay 5 elementos entre cuentas de comercio y catálogos, incluidos **"Shadow Catalog / Offers for …"** de barilocheexcursiones.com.ar, centroreservasbariloche.com y adventurecenter.com.ar (sin problemas de activos). Son catálogos que Meta crea automáticamente; no borrarlos sin entender el motivo.

## Conversiones offline ✅ (doc oficial `conversions-api/offline-events`, 2026-10-08)
- **Endpoint:** `POST /{API_VERSION}/{DATASET_ID}/events` (el mismo de CAPI web).
- **`action_source:"physical_store"` es obligatorio** para eventos offline; al usarlo se declara que el valor es exacto.
- **Ventana de `event_time`:** hasta **62 días** atrás para offline con `physical_store`; para cualquier otro evento **7 días**. ⚠️ Si **un solo** evento de la tanda supera el límite, **se rechaza toda la solicitud** y no se procesa ninguno (dato de un resumen de la doc: separar tandas por antigüedad).
- **`user_data`:** hashear (SHA-256) email, teléfono, género, fecha de nacimiento, apellido, nombre, ciudad, estado, código postal y país; **no** hashear ID de publicidad móvil ni `lead_id`.
- **Deduplicación offline:** por defecto **por `order_id`**; alternativa **por usuario** si falta `order_id`; usa `dataset_id` + `event_time` + `event_name` + `item_number`; ventana máx. 7 días. Un evento offline **solo se deduplica contra otros offline**.
- ⚠️ No hay fecha de deprecación de la Offline Conversions API antigua en la página (solo que `upload_tag` sigue soportado para usuarios heredados) ni definición clara de "event set" vs "dataset".
- **Qué usar según el caso 🧭:** venta cerrada **por WhatsApp de un anuncio** → `business_messaging` + `ctwa_clid` (arriba); venta cerrada **por teléfono o en mostrador** sin chat → offline con `physical_store` y `order_id` (si el negocio acepta esa declaración); venta de **Lead Ads** → Conversion Leads con `lead_id`.
