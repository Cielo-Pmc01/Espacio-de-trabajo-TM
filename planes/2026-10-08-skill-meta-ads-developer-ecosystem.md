# Plan — Skill "Meta Ads Developer & Business Ecosystem" + Agente

**Fecha:** 2026-10-08 · **Área:** TM/SX (transversal) · **Estado:** Tanda 1 escrita (2026-10-08) — pendiente: prueba con 3 casos reales, verificación en navegador/Graph API (solo lectura), Tandas 2 y 3

## Prueba del agente `meta-technical-architect` (2026-10-08, modo solo-respuesta)
3 consultas reales en paralelo: (1) cuenta Activa que no gasta, (2) error (#200) con System User desde n8n, (3) diseño Pixel+CAPI para el checkout de Pb2.
- ✅ Cumplieron las reglas: leyeron las references correctas, **0 llamadas a Meta, 0 escrituras**, marcaron lo no verificado, pidieron datos puntuales y separaron hecho/recomendación.
- 🔧 Fallas detectadas y **corregidas**: (a) versión de API inconsistente entre archivos → regla única en `00`; (b) edges `assigned_users` sin verificar → verificado en `03` (`business` obligatorio, tasks MANAGE/ADVERTISE/ANALYZE/DRAFT/AA_ANALYZE); (c) faltaba el riesgo de cookies entre dominios WordPress→Pb2 → `10`; (d) un Glob dio timeout → el agente ahora lee las references por ruta directa; (e) faltaban plantillas/precios/webhooks de WhatsApp e Instagram → `15`; (f) verificación de dominio → `04` (parcial).
- ⚠️ Aún sin verificar: `system-user/assigned_ad_accounts`, `me/assigned_applications`, referral CTWA, CAPI offline, App Review detallado, AEM, Health Status API, tarifas de WhatsApp por país, Instagram (permisos/límites).

## Pasada de aprendizaje continuo (2026-10-08, noche)
- ✅ Nuevo `16-medicion-reportes-audiencias-automatizacion.md`: `fbp/fbc` exactos, Dataset Quality API, Insights (async/throttle/error 1487534), audiencias web, **cambio Advantage+ v25/v26**, Ad Rules, presupuestos, mapa de docs.
- ✅ `09`: `referral` de Click-to-WhatsApp **verificado** (incluye `ctwa_clid`, `source_id`=ID del anuncio; se omite en Status). `14`: Health Status API ✅, receta de registro copiar-y-pegar, hipótesis del cupo de **2 partners por WABA** y requisito Página↔número.
- ✅ Nuevo `17-permisos-verificacion-paginas-instagram.md`: catálogo de permisos con/sin App Review, Business Verification (obligatoria desde 2023-02-01 para acceso avanzado), Pages API, Instagram Platform (Instagram Login vs Facebook Login), Business Management APIs. Breakdowns de Insights agregados a `16`.
- ✅ (continuación) Verificado y escrito: parámetros completos de Insights (`date_preset`, `time_increment` 1–90, ventanas de atribución), CAPI offline (`physical_store`, 62 días, dedupe por `order_id`), Access Verification, App Review (guía de envío), edges `owned_ad_accounts`/`owned_whatsapp_business_accounts`, Ad Standards (parcial), AEM (fuentes secundarias: ya no exige dominio ni priorizar eventos). **Hipótesis WhatsApp confirmada por Cielo** (vincular Página/IG al número hace que aparezca en campañas).
- ⏳ Antes de esto quedaba pendiente: referencia de `ad-account/insights` (date_preset, time_increment, atribución), referencia de `business` (owned/client assets, partners por API), App Review operativo, Access Verification, CAPI offline, AEM/dominio, políticas de publicidad, Commerce Platform, Ad Library (404 en `/docs/ad-library-api/`).

## Entregable TB (2026-10-08, noche)
- ✅ `18-catalogos-creatividades-instagram-publicacion.md` y normalización de datos del cliente verificada (`05`).
- ✅ **Especificación Pixel + CAPI para Pb2:** `planes/2026-10-08-especificacion-pixel-capi-pb2.md` (borrador para el equipo de Pb2). Incluye preguntas a cerrar, arquitectura, contratos de datos, payload, código de ejemplo, plan de pruebas y criterios de aceptación.
- ⏳ Pendiente (destraba TB): Cielo responde las decisiones #1 (URL de destino de los anuncios), #4 (moneda), #5 (dataset), #7 (quién emite el CAPI) y #8 (consentimiento); el equipo de Pb2 responde #2, #3, #6; luego implementación en staging → pruebas → producción; Cielo/administrador de WordPress decide retirar `test_event_code TEST21943` del Pixel Manager de TB.

## Avance Tandas 2 y 3 (2026-10-08)
- ✅ Escritos: 02 (ad accounts/billing), 08 (campañas/ad sets/creatividades/audiencias), 09 (WhatsApp/IG/catálogos/leads), 10 (integraciones + diseño Pixel/CAPI en Pb2), 13 (restricciones/calidad). SKILL.md v1.1 con índice completo.
- ✅ Primer caso real probado (TB): hallazgos en `99-contexto-adventure-center.md`.
- ⚠️ Pendiente de verificar: App Review detallado, referral de CTWA, CAPI offline, verificación de dominio/AEM, App Dashboard de `Claude-AI`, pasos UI de agregar método de pago, Instagram, product sets.
- Pendiente de decisión de Cielo: entregar especificación Pixel+CAPI al dev de Pb2.

## Avance Tanda 1
- ✅ SKILL.md, refs 00, 01, 03, 04, 05, 06, 07, 11, 12, 99 y agente `meta-technical-architect`.
- ⚠️ Limitación: el Business Help Center de Meta no se puede leer con WebFetch (carga con JS) → UI, billing y restricciones quedan marcados [RE-VERIFICAR] hasta verlos con navegador solo-lectura o capturas.
- ⚠️ Faltan sin verificar: App Review/modos de app, Webhooks/OAuth, AEM/dominio, campos obligatorios de ad set/creative, normalización exacta de hashing.

## Objetivo
Una skill especialista técnica en todo el ecosistema Meta (Business, Ads, Pixel/CAPI, Developers, Marketing API, integraciones) y un agente que la usa con dos modos: **Developer** y **Ads/Business**. Debe diagnosticar con árboles de decisión, no responder "revisá el Pixel".

## Decisiones (Cielo, 2026-10-08)
- Fuentes de aprendizaje: lo más completo posible **con precauciones** → docs oficiales + navegador logueado en Meta (solo lectura) + Graph API GET (solo lectura, con presupuesto de llamadas).
- Entregable: **skill modular + agente con herramientas Meta** (MCP n8n, Windsor, Supabase, Playwright, WebFetch).
- Alcance: **por tandas**, empezando por el dolor real.

## Estructura de la skill (carga progresiva, 1 nivel en .claude/skills/)
```
.claude/skills/meta-ads-developer/
├── SKILL.md                      # corto: rol, 2 modos, reglas, índice de references, protocolo de diagnóstico
└── references/
    ├── 00-reglas-y-verificacion.md   # cuándo verificar docs vivas, fuentes oficiales, formato de respuesta, pedir capturas
    ├── 01-business-portfolio-activos.md
    ├── 02-ad-accounts-billing.md
    ├── 03-permisos-roles-system-users.md
    ├── 04-pixel-dataset-events-manager.md
    ├── 05-conversions-api.md
    ├── 06-developers-apps-tokens-appreview.md
    ├── 07-graph-marketing-api.md
    ├── 08-campanas-adsets-ads-audiencias.md
    ├── 09-whatsapp-instagram-catalogos.md
    ├── 10-integraciones-woocommerce-n8n-supabase-chatwoot.md
    ├── 11-errores-api-catalogo.md
    ├── 12-arboles-diagnostico.md
    ├── 13-cuentas-restringidas-calidad.md
    └── 99-contexto-adventure-center.md   # arquitectura real (sin secretos)
```
Agente: `.claude/agents/meta-technical-architect.md`.

## Tandas
1. **Tanda 1 (dolor real):** núcleo (00, 01, 03), Pixel/CAPI (04, 05), Developers/tokens (06, 07), errores (11), árboles de diagnóstico (12), contexto AC (99) + SKILL.md + agente.
2. **Tanda 2:** Ad accounts/billing (02), campañas/audiencias (08), restricciones (13).
3. **Tanda 3:** WhatsApp/IG/catálogos (09), integraciones completas (10), conversiones offline Chatwoot→Meta.

## Precauciones (obligatorias)
- **Docs vivas:** las referencias llevan fecha de verificación y URL fuente; ante interfaz/permisos/versión/políticas, re-verificar antes de afirmar. Las docs se movieron a `/documentation/ads-commerce/...`.
- **Navegador Meta:** inicia sesión Cielo; Claude solo lee. Cero clics en guardar/crear/eliminar/transferir/pagar. Sin ejecutar acciones en Business Settings.
- **Graph API:** solo GET; presupuesto máximo ~30 llamadas por tanda; nunca en loop; ante timeout/rate-limit esperar y avisar (ver feedback_cuidado_llamadas_meta_api). Preferir `debug_token`, `/me/businesses`, `/{act}?fields=` mínimos.
- **Escrituras a Meta (POST/DELETE) o Windsor `execute_action`:** solo con confirmación explícita de Cielo por cambio específico.
- **Secretos:** nunca en la skill, ni en references, ni en el repo. Solo IDs no sensibles; tokens referenciados por nombre de credencial n8n.
- **Honestidad:** no inventar endpoints, permisos ni IDs; marcar "no verificado" lo que no se confirmó.

## Criterio de éxito
- Consulta tipo "compras en WooCommerce pero no en Meta" → árbol de 12 pasos con qué mirar y dónde.
- Distingue "sin acceso al Business" / "sin acceso al Ad Account" / "System User sin asset asignado".
- Todas las afirmaciones técnicas con fuente oficial y fecha.
- Probada con 3 casos reales de Adventure Center.
