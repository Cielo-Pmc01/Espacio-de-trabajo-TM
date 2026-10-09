# 07 — Graph API / Marketing API

## Versionado ✅
- Más reciente al 2026-10-08: **v26.0** (lanzada 2026-07-29, confirmado en `/docs/graph-api/changelog/`). **v25.0** sigue disponible (Graph hasta 2028-07-29; Marketing API muestra vencimiento "TBD"). La página `/overview/versioning` seguía diciendo v25.0 al leerla: **las páginas de doc pueden ir atrasadas respecto del changelog** → ante la duda, cruzar ambas. Versión nueva ~cada 4 meses; gracia **≥ 90 días** según esa página.
- El Graph API Explorer usa por defecto la versión más reciente (v26.0 en la captura de Cielo del 2026-10-08).
- **Llamadas sin versión son inválidas** en Marketing API. Versión vencida: puede fallar o subirse automáticamente si el endpoint no cambió.
- Fijar la versión en una variable (n8n/env) para actualizarla en un solo lugar.

## Rate limiting ✅
Sistema por puntaje: **lectura = 1 punto, escritura = 3 puntos**.
| Tier | Máx. puntos | Decaimiento | Bloqueo |
|---|---|---|---|
| Limited/Dev | 60 | 300 s | 300 s |
| Full/Standard | 9000 | 300 s | 60 s |

Business Use Case (por hora): `ads_management` 100.000 (dev 300, +40 × anuncios activos); `ads_insights` 190.000 (dev 600, +400 × anuncios activos); `custom_audience` 190.000 (dev 5.000); Catalog 20.000+.
Otros límites: cambios de gasto de cuenta **10/día**; presupuesto de ad set **4 cambios/hora**; mutaciones **100 req/s** por cuenta.
Headers para monitorear: `X-Ad-Account-Usage`, `X-Business-Use-Case-Usage` (`call_count`, `total_cputime`, `estimated_time_to_regain_access`), `X-FB-Ads-Insights-Throttle`.
Errores: `4` (app), `17`/`613` (cuenta; subcódigos 2446079, 1487742; 613/5044001 = QPS), `4/1504022` (Insights), serie `80000` (BUC).
**Regla Cielo:** nunca reintentar en loop; esperar y avisar. 🏢 Ver `feedback_cuidado_llamadas_meta_api`.

## Estructura de consulta
`GET https://graph.facebook.com/{API_VERSION}/{object-id}?fields=a,b,c&access_token=...` (`{API_VERSION}` = versión fijada de la integración, ej. `v26.0`)
- IDs de ad account: `act_<ID>` en rutas de edge (`/act_123/campaigns`).
- Paginación por cursor: `paging.cursors.after` / `paging.next`.
- Siempre pedir `fields` mínimos (reduce costo y riesgo).
- Batch: hasta ~50 requests por batch ⚠️ [RE-VERIFICAR].

## Insights ✅ (forma básica)
`GET /act_{AD_ACCOUNT_ID}/insights?fields=impressions,clicks,spend&time_range={"since":"2026-10-01","until":"2026-10-07"}`
Soporta `level`, `breakdowns`, `action_breakdowns`, `time_increments`, ventanas de atribución y modo asíncrono para reportes grandes. Referencia: `docs/marketing-api/reference/ad-account/insights`. ⚠️ Nombres exactos de `attribution_setting`/`action_attribution_windows` y del flujo `async → report_run_id`: verificar en la referencia antes de armar código.

## Creación de campañas por API
Flujo: **Campaign → Ad Set → Ad Creative → Ad** ✅ (estructura). Paso 1 verificado:
`POST /act_{AD_ACCOUNT_ID}/campaigns` con `name`, `objective`, `status` (**crear en `PAUSED`**).
⚠️ [RE-VERIFICAR contra referencia de cada objeto antes de escribir código] Campos que suelen ser obligatorios: `special_ad_categories` (array, `[]` si no aplica) en campaña; en ad set `daily_budget`/`lifetime_budget` (en **unidad mínima de la moneda**, ej. centavos), `billing_event`, `optimization_goal`, `targeting`, `promoted_object` (según objetivo, ej. `pixel_id` + `custom_event_type` para ventas web), `bid_strategy`; objetivos ODAX (`OUTCOME_SALES`, `OUTCOME_LEADS`, `OUTCOME_TRAFFIC`, `OUTCOME_ENGAGEMENT`, `OUTCOME_AWARENESS`, `OUTCOME_APP_PROMOTION`). Para Click-to-WhatsApp el destino/optimización tiene reglas propias — verificar.
Referencias: `/ad-account/campaigns`, `/ad-campaign`, `/ad-account/adsets`, `/ad-account/adcreatives`, `/ad-account/ads`.

## Plantilla de respuesta developer
Siempre dar: endpoint + método + versión + permisos requeridos + tipo de token + body JSON + cURL + respuesta esperada + error más probable. Si algún campo es ⚠️, decirlo en la respuesta.

## Debug rápido de una llamada
1. Código/subcódigo del error → `11-errores-api-catalogo.md`.
2. `/debug_token` del token usado → `06-developers-apps-tokens.md`.
3. ¿Versión explícita y vigente?
4. ¿ID correcto (`act_` vs número)? ¿El asset está asignado al System User?
5. `fbtrace_id` para soporte (caduca rápido).
