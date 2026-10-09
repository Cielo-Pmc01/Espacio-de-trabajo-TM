# 16 — Medición, calidad de datos, reportes (Insights), audiencias y automatización

✅ doc oficial leída el 2026-10-08 · ⚠️ re-verificar/no extraído · 🏢 cuenta real. Versión: usar `{API_VERSION}` fijada (más reciente v26.0; ver `00`/`07`).

## 1. `fbp` y `fbc` — formato exacto ✅ (`conversions-api/parameters/fbp-and-fbc`)
Estructura única: **`fb.<subdomainIndex>.<creationTime>.<value>`**
- `version` = siempre `fb`.
- `subdomainIndex`: `0` = `com`, `1` = `example.com`, `2` = `www.example.com`. **En servidor, sin cookie, usar `1`.**
- `creationTime` = timestamp UNIX en **milisegundos**.
- `value` = el `fbclid` (para `fbc`) o un número aleatorio (para `fbp`).
- **`_fbp`**: cookie que genera el Pixel automáticamente. **`_fbc`**: cookie que existe si el Pixel está instalado o se guardó antes.
- **Construir `fbc` desde la URL** cuando no existe la cookie pero hay `fbclid`: tomar el `fbclid` **tal cual (es sensible a mayúsculas, no modificarlo)** + timestamp actual en ms + `subdomainIndex=1` → `fb.1.<timestamp_ms>.<fbclid>`. Ejemplo oficial: `fb.1.1554763741205.IwAR2F4-dbP0l7Mn1IawQQGCINEz7PYXQvwjNwB_qa2ofrHyiLjcbCRxTDMgk`.
- ⚠️ La página no explica las consecuencias exactas de no enviarlos ni valida el formato.
**Aplicación 🏢:** en el checkout de Pb2, guardar en la reserva el `fbclid` crudo (sin pasar a minúsculas) y la cookie `_fbp`; no reconstruir `fbc` con un `fbclid` normalizado.

## 2. Dataset Quality API (calidad de datos a escala) ✅ (`conversions-api/dataset-quality-api`)
- `GET https://graph.facebook.com/{API_VERSION}/dataset_quality?dataset_id={DATASET_ID}` (+ `fields`).
- Permisos: usuario/System User con acceso parcial **"Usar conjunto de datos de eventos"**; app con `ads_read` + (`ads_management` **o** `business_management`); token de System User de larga duración (o generado en Events Manager).
- **Campos:** `event_name`; **`event_match_quality`** (`composite_score` 0–10 y `match_key_feedback[]` con `identifier` y `coverage.percentage`); **`acr`** (Additional Conversions Reported: conversiones extra por usar CAPI + Pixel); **`event_coverage`** (% de eventos del Pixel cubiertos por CAPI con keys compartidas, 7 días); **`dedupe_key_feedback`** (% de eventos con cada key de deduplicación: `event_id`, `external_id`, `fbp`); **`data_freshness`** (`real_time`, `hourly`…); `event_potential_aly_acr_increase`.
- ⚠️ Sin filtros por fecha ni por dispositivo en lo leído.
- **Uso 🧭:** una sola llamada por dataset da el EMQ de `Purchase`, qué identificadores faltan (ej. `email`, `phone`) y si la deduplicación está bien → ideal para alertas en n8n sin abrir Events Manager. Dataset TB = `1101029451234929`.
- Existen páginas hermanas para eventos offline y CRM (`dataset-quality-api/offline-events`, `/crm-events`) ⚠️ no leídas.

## 3. Insights API (reportes) ✅ parcial (`marketing-api/insights` y `/best-practices`)
- **Nodos:** `/{ad-account-id}/insights`, `/{campaign-id}/insights`, `/{ad-set-id}/insights`, `/{ad-id}/insights`. Parámetro **`level`** define la granularidad (`campaign`, `adset`, `ad`…). Campos de ejemplo: `impressions`, `spend`, `clicks`; `date_preset` (ej. `last_7d`); `time_range={"since":"YYYY-MM-DD","until":"YYYY-MM-DD"}`. Paginación por cursores `before`/`after`.
- **Throttling:** leer en **cada respuesta** el header **`x-fb-ads-insights-throttle`**; espaciar consultas, retroceder al acercarse al 100% y consultar fuera de horas pico según la zona horaria de la cuenta; se puede pedir un nivel de acceso superior al "standard".
- **Reportes asíncronos ✅:** (1) `POST /{object}/insights` → devuelve `report_run_id`; (2) hacer *polling* de `async_status` hasta **"Job Completed"** (100%); (3) `GET /{report_run_id}/insights` para los resultados. Estados: Job Not Started, Job Started, Job Running, Job Completed, **Job Failed**, Job Skipped.
- **Error por exceso de datos ✅:** `error_code=100` con **`error_subcode=1487534`** ("data per call"). Soluciones: acortar el rango de fechas o la cantidad de IDs; **evitar nivel cuenta con breakdowns de alta cardinalidad** (`action_target_id`, `product_id`); consultar `/insights` en objetos de nivel inferior.
- **Buenas prácticas ✅:** `filtering` solo sobre objetos con datos (notación con puntos; el operador `IN` rinde mejor que `STARTS_WITH`/`CONTAIN`); probar síncrono y pasar a asíncrono si hay timeouts; **preferir `date_preset` a rangos personalizados**; pedir métricas pesadas por separado; usar *batch requests*.
- **Breakdowns ✅ (`docs/marketing-api/insights/breakdowns`):** demográficos `age`, `gender`, `country`, `region`, `dma`; dispositivo `device_platform`, `impression_device`, `action_device`; plataforma `publisher_platform`, `platform_position`; acciones `action_type`, `action_device`, `action_destination`, `action_target_id`, `action_reaction`; activos `ad_format_asset`, `body_asset`, `image_asset`, `video_asset`, `title_asset`, `link_url_asset`; otros `product_id`, `action_carousel_card_id/name`, `skan_campaign_id`, `user_segment_key`, `hourly_stats_aggregated_by_advertiser_time_zone`. **Combinaciones válidas:** `age`+`gender`; `action_device`+`publisher_platform`; `publisher_platform`+`platform_position`+`impression_device`. **No permitidos con breakdowns:** `app_store_clicks`, `newsfeed_avg_position`, `newsfeed_clicks`, `relevance_score`, `newsfeed_impressions`. Con breakdowns **horarios** no hay `unique_*`, `reach` ni `frequency`. Con `region`, `dma` y `hourly_stats` **no se devuelven métricas de acciones** (métricas "off-Meta"); `action_device`, `action_destination` y `product_id` no traen valores de desglose en esas métricas. Cambios de breakdowns no afectan datos anteriores al 27-abr-2021. ⚠️ Límites de retención (13/37 meses) **no figuran** en esa página.
- **Parámetros completos del edge Insights ✅ (referencia `docs/marketing-api/reference/ad-account/insights`, 2026-10-08):**
  - `level`: `ad`, `adset`, `campaign`, `account`.
  - `date_preset`: `today`, `yesterday`, `this_month`, `last_month`, `this_quarter`, `last_quarter`, `this_year`, `last_year`, `maximum`, `data_maximum`, `last_3d`, `last_7d`, `last_14d`, `last_28d`, `last_30d`, `last_90d`, `last_week_mon_sun`, `last_week_sun_sat`, `this_week_mon_today`, `this_week_sun_today`.
  - `time_range={"since":"YYYY-MM-DD","until":"YYYY-MM-DD"}` o `time_ranges` (array de rangos).
  - `time_increment`: `all_days`, `monthly` o un entero **1–90** (días por fila; `1` = diario).
  - **Ventanas de atribución** (`action_attribution_windows`): `1d_view`, `7d_view`, `28d_view`, `1d_click`, `7d_click`, `28d_click`, `1d_ev`, `dda`, `default`, `7d_view_first_conversion`, `28d_view_first_conversion`, `7d_view_all_conversions`, `28d_view_all_conversions` (+ `skan_*`). Banderas: `use_unified_attribution_setting` (usar la atribución del ad set) y `use_account_attribution_setting` (booleanos).
  - `action_report_time`: `impression`, `conversion`, `mixed`, `lifetime`. `default_summary` (bool, default `false`), `filtering`, `sort`, `limit`.
  - **Receta para reportes de ventas 🧭:** `level=ad` o `campaign`, `time_increment=1`, `date_preset=last_7d`, `fields=spend,impressions,clicks,actions,action_values,purchase_roas`, y fijar `use_unified_attribution_setting=true` para que coincida con lo que ve Ads Manager; documentar siempre la ventana usada al comparar contra WooCommerce/Pb2.
  - ⚠️ Sigue sin extraer: límites de antigüedad de datos (13/37 meses) y los valores completos de `breakdowns` (lista de 50+; ver arriba los principales).
- 🏢 Reportes de n8n/CRM: respetar la regla de Cielo de no insistir en loop ante timeouts; con 3 cuentas grandes preferir asíncrono + `date_preset`.

## 4. Audiencias de sitio web (Custom Audience tipo web) ✅ (`audiences/guides/website-custom-audiences`)
`POST /{API_VERSION}/act_{AD_ACCOUNT_ID}/customaudiences` con `name` y **`rule`**:
```json
{ "inclusions": { "operator": "or", "rules": [ {
  "event_sources": [ { "id": "<PIXEL_ID>", "type": "pixel" } ],
  "retention_seconds": 2592000,
  "filter": { "operator": "and", "filters": [
    { "field": "url",   "operator": "i_contains", "value": "excursion" },
    { "field": "event", "operator": "i_contains", "value": "Purchase" } ] } } ] } }
```
Opcionales: `retention_days` (**1–180**), `prefill` (`true` incluye actividad previa), `audience_labels`. Un solo píxel por regla reutilizable; el código se obtiene con `GET /{PIXEL_ID}?fields=code`. Se actualiza en minutos; máx. **10.000** audiencias de sitio web por cuenta. ⚠️ `subtype=WEBSITE` y ejemplos de "visitantes 30 días" no aparecen en la página. **Depende del Pixel/CAPI: sin eventos llegando no hay audiencia** (🏢 TB desde el 14/9).

## 5. Advantage+ campaigns ✅ (`marketing-api/advantage-campaigns`) — cambio importante
- Variantes: **Advantage+ Sales** (reemplaza Advantage+ Shopping), **Advantage+ App**, **Advantage+ Leads**.
- **Desde la versión 25.0 ya no se crean con `smart_promotion_type=AUTOMATED_SHOPPING_ADS`.** Ahora: campaña estándar con `objective` `OUTCOME_SALES` / `OUTCOME_LEADS` (o instalaciones de app) y **tres criterios de automatización** activados → `advantage_state` y `smart_promotion_type=GUIDED_CREATION`.
- Se automatiza: **audiencia** (Advantage+ Audience, "relaxation" del targeting), **ubicaciones** (todas, sin exclusiones manuales) y **presupuesto** (a nivel campaña con estrategias soportadas). **No** se automatiza la creatividad.
- Limitaciones: `existing_customer_budget_percentage` no está en campañas nuevas (workaround: dos ad sets); campañas con **>50 anuncios** no migran; migrar reinicia el aprendizaje.
- 🔴 **v26.0:** las campañas legacy **ASC/AAC se pausan y quedan no editables** → revisar si alguna campaña existente usa esos tipos antes de subir de versión.

## 6. Reglas automatizadas (Ad Rules) ✅ parcial (`marketing-api/ad-rules`)
`POST /act_{AD_ACCOUNT_ID}/adrules_library`. Componentes: **Evaluation Spec** (qué objetos cumplen), **Execution Spec** (acción) y programación. Tipos: **basadas en disparador** (tiempo real al cambiar datos) y **programadas** (a intervalos). Acciones documentadas: `PAUSE`, `UNPAUSE`, `CHANGE_BUDGET`, `NOTIFICATION`. Estados: `ENABLED` / `DISABLED`. ⚠️ Sin ejemplos, filtros ni límite de cantidad en lo leído (ver subpáginas `ad-rules-specs`, `evaluation-spec`, `execution-spec`, `trigger-based-rules`, `scheduled-based-rules`). **Uso 🧭:** regla de notificación/pausa por gasto sin resultados, como red de seguridad adicional a las alertas de n8n (probar siempre con `NOTIFICATION` antes de `PAUSE`).

## 7. Presupuestos ✅ parcial (`bidding/overview/budgets`)
`daily_budget` = promedio diario (**Meta puede gastar hasta un 25% más** en días con mejores oportunidades); `lifetime_budget` = total de la vigencia (el gasto diario varía pero no supera el total). **Unidad = denominación mínima de la moneda** (centavos). ⚠️ Mínimos por moneda/evento, tope de gasto de cuenta y *budget scheduling* no están detallados: confirmar en la UI de la cuenta antes de fijarlos por API.

## 8. Asignar activos a System Users por API — estado ⚠️
La guía oficial de System Users muestra **solo la UI** (permisos: **Finance editor**, **Manage app**, **Manage catalog**); **no documenta los endpoints** de asignación para ad accounts/Páginas/datasets. Lo verificado por API es `act_{ID}/assigned_users` (ver `03`). Hasta verificar otros, asignar por UI (Business Settings → Usuarios del sistema → Asignar activos).

## 9. Mapa de documentación oficial (para seguir aprendiendo) ✅
Índice completo: `developers.facebook.com/documentation/ads-commerce/llms.txt`. Rutas por tema (todas `.../documentation/ads-commerce/...`; agregar `.md` si hace falta):
- **CAPI:** `conversions-api/{parameters/{main-body,server-event,customer-information-parameters,external-id,fbp-and-fbc,custom-data,app-data},dataset-quality-api,conversion-leads-integration,conversions-api-for-offline-events,conversions-api-for-business-messaging,guides/append-attribution}`.
- **Marketing API:** `marketing-api/{insights,advantage-campaigns,advantage-shopping-campaigns,advantage-catalog-ads,ad-rules,bidding/overview/{budgets,billing-events},audiences/guides/{custom-audiences,website-custom-audiences,engagement-custom-audiences,lookalike-audiences},audiences/special-ad-category,creative/advantage-creative,guides/lead-ads,ad-creative/messaging-ads/click-to-whatsapp}`.
- **System Users/tokens:** `marketing-api/collaborative-ads/managed-partner-ads/api-guide/prerequisites/{create-system-user,assign-permissions-to-system-user,generate-access-token-system-user}`.
- **Catálogos:** `catalog`, `catalog/guides/{manage-catalog-items,product-variants}`, `marketing-api/product-set-optimization/...`.
- **WhatsApp:** `developers.facebook.com/documentation/business-messaging/whatsapp/...` (ver `15`). **Instagram Messaging:** `.../business-messaging/instagram-messaging/...`.
- ⚠️ **Todavía sin lectura:** `reference/ad-account/insights` (referencia completa), Business Verification, App Review detallado, permisos (reference), Pages API / Instagram Graph (publicación, insights, comentarios), Ad Library API, `conversions-api-for-offline-events`, AEM/dominio, Commerce Platform.
