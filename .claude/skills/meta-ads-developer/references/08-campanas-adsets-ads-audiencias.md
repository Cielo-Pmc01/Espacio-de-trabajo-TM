# 08 — Campañas, conjuntos, anuncios y audiencias (lado técnico)

✅ doc oficial 2026-10-08 · ⚠️ re-verificar. Regla: crear **siempre en `PAUSED`**; Cielo publica. Presupuestos en la **unidad mínima de la moneda** (ej. centavos) ✅.

> 🔴 **Advantage+ (v25.0/v26.0):** las campañas Advantage+ Sales/Leads/App ya **no se crean con `smart_promotion_type=AUTOMATED_SHOPPING_ADS`**; se crean como campaña estándar con 3 criterios de automatización (audiencia, ubicaciones, presupuesto) → `smart_promotion_type=GUIDED_CREATION`. En **v26.0** las campañas legacy ASC/AAC se pausan y quedan no editables. Detalle en `16`. Audiencias web, Insights, Ad Rules y presupuestos: `16`.

## Campaign — `POST /act_<ID>/campaigns` ✅
- `objective` (ODAX): `OUTCOME_APP_PROMOTION`, `OUTCOME_AWARENESS`, `OUTCOME_ENGAGEMENT`, `OUTCOME_LEADS`, `OUTCOME_SALES`, `OUTCOME_TRAFFIC`. (Los objetivos legados están deprecados.) Fijar el objetivo **valida** los ad sets hijos.
- `special_ad_categories` **obligatorio** (array). Valores en doc: `NONE`, `EMPLOYMENT`, `HOUSING`, `CREDIT`, `ISSUES_ELECTIONS_POLITICS`, `ONLINE_GAMBLING_AND_GAMING`, `FINANCIAL_PRODUCTS_SERVICES` (las páginas difieren en el listado exacto → ⚠️ verificar). Turismo: `[]`/`NONE`. Si no se declara cuando corresponde, los anuncios pueden rechazarse. Con categorías especiales hay restricciones: edad 18–65+ fija, todos los géneros, radio mínimo 25 km, sin lookalikes/guardadas ✅.
- `status` al crear: solo `ACTIVE` o `PAUSED` ✅.
- Presupuesto a nivel campaña (Advantage campaign budget/CBO): `daily_budget` o `lifetime_budget`; `spend_cap` mínimo ≈ 100 USD equivalente ✅. `bid_strategy`: `LOWEST_COST_WITHOUT_CAP`, `LOWEST_COST_WITH_BID_CAP` (pide `bid_amount` por ad set), `COST_CAP`, `LOWEST_COST_WITH_MIN_ROAS` ✅. `buying_type`: `AUCTION` (default) / `RESERVED` ✅. `is_adset_budget_sharing_enabled`: hasta 20% entre ad sets ✅.

## Ad Set — `POST /act_<ID>/adsets` ✅
Obligatorios: `name` (≤400), `campaign_id`, `optimization_goal`, `billing_event`, `status`, presupuesto (`daily_budget` o `lifetime_budget`+`end_time`), `targeting` (con **países**), y `bid_amount` si la estrategia es bid cap/cost cap. Condicionales: `promoted_object` según el goal (ej. `pixel_id` + `custom_event_type` para `OFFSITE_CONVERSIONS`); `dsa_payor`/`dsa_beneficiary` si se apunta a la UE. Opcionales: `start_time`, `attribution_spec`, `bid_strategy`, `destination_type`.
Mapeo útil: ventas web → `OUTCOME_SALES` + `OFFSITE_CONVERSIONS` + `promoted_object{pixel_id,custom_event_type:PURCHASE}`; mensajes WhatsApp → `OUTCOME_ENGAGEMENT` + `destination_type:WHATSAPP` + `optimization_goal:CONVERSATIONS` (o `LINK_CLICKS`) + `promoted_object{page_id[, whatsapp_phone_number]}` ✅ (Click-to-WhatsApp).
🏢 Sin evento de conversión llegando al dataset (caso TB 2026-10) la optimización a `OFFSITE_CONVERSIONS` pierde señal y deriva a clics baratos.

## Ad Creative — `POST /act_<ID>/adcreatives` ✅
`object_story_spec{page_id, instagram_user_id (o instagram_actor_id en versiones previas), link_data | video_data | photo_data}`, `call_to_action{type,value}` (ej. `WHATSAPP_MESSAGE` con `value.app_destination:"WHATSAPP"`, `SHOP_NOW`, `LEARN_MORE`, `BOOK_TRAVEL`), `url_tags` (UTM), `degrees_of_freedom_spec`, `asset_feed_spec` (dinámico), `effective_object_story_id` (post resultante). Largos recomendados: título ≤25, texto ≤90; URL ≤1000 caracteres ✅. Ejemplo CTWA: ver `09`.
UTMs recomendadas (para atribuir fuera de Meta): `utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` + IDs dinámicos `{{campaign.id}} {{adset.id}} {{ad.id}}` ⚠️ verificar macros vigentes en la UI. 🏢 Windsor devuelve `link_url`/`url_tags` nulos para estos anuncios: no sirve para auditar destinos.

## Ad — `POST /act_<ID>/ads` (campos `adset_id`, `creative{creative_id}`, `status`) ⚠️ verificar contra la referencia del objeto Ad antes de generar código.

## Audiencias ✅
- **Custom Audience** (`POST /act_<ID>/customaudiences`): `subtype=CUSTOM`, `customer_file_source` (`USER_PROVIDED_ONLY` | `PARTNER_PROVIDED_ONLY` | `BOTH_USER_AND_PARTNER_PROVIDED`); luego `POST /<audience>/users` con `schema` (EMAIL, PHONE…) y datos **SHA-256** normalizados: email minúsculas sin espacios; teléfono solo dígitos + código de país; nombres a-z minúsculas; país ISO-3166 alpha-2. **Máx. 10.000 registros por request.** Requiere aceptar los Términos de audiencias personalizadas.
- Límites por cuenta: 500 custom estándar · 10.000 de sitio web · 200 de app · 500 lookalike.
- **Lookalike:** `subtype=LOOKALIKE`, `origin_audience_id`, `lookalike_spec{type:"similarity"|"reach", ratio 0.01–0.20, starting_ratio, country | location_spec}`; fuente ≥100 personas; poblado 1–6 h; **desde 2-sep-2025 no se permiten semillas que sugieran salud o situación financiera**; error `1713232` "Seed audience restricted".
- Retargeting web depende del Pixel/CAPI: sin eventos no hay audiencia (ver `04`, `05`).

## Checklist de configuración correcta por objetivo (resumen)
Ventas web → píxel+CAPI deduplicado, dominio en el mismo Business, `Purchase` con `value`+`currency` · Mensajes → Página con WhatsApp vinculado, WABA en el mismo portafolio, `ctwa_clid` persistido · Leads → formulario + permisos `leads_retrieval` + webhook · Tráfico → UTMs.
