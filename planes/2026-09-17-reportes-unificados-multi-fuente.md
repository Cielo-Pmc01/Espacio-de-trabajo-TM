# Plan: Reportes Unificados Multi-Fuente (Meta Ads + Google Ads + Pb2 + WooCommerce)

**Fecha:** 2026-09-17
**Estado:** Pendiente de aprobación
**Proyecto:** TM — Reportes / Analítica (extensión de `crm-meta-ads` / `tm-platform`)

## Contexto y Justificación

Meta Ads subreporta ventas reales por un problema de tracking ya diagnosticado (ver `project-ga4-valor-compra-tb`, `project-atribucion-ventas-anuncios-chatwoot`): una campaña puede mostrar 2 compras en Meta cuando en realidad hubo 5 esa semana. Cielo necesita un sistema que arme reportes de resultados **reales** por marca (o marcas elegidas), cruzando automáticamente:

- **Meta Ads** — gasto, alcance, mensajes, compras reportadas (ya integrado).
- **Google Ads** — gasto, conversiones (Cielo tiene acceso/credenciales).
- **WooCommerce** — órdenes reales pagadas, por sitio (solo marcas con checkout web propio).
- **Pb2** — ventas/reservas reales (hoy sin API de ventas — ver Riesgos).

Ya existe un precedente manual y validado por Cielo: el informe unificado de TB (`project-tb-informe-unificado-meta-woocommerce-ga4`) que reemplaza Compras/Costo por compra/Facturación de Meta por una estimación real basada en WooCommerce+GA4, repartida proporcionalmente por visitas a la página de destino. Este plan generaliza y automatiza esa metodología para cualquier marca, sumando Google Ads y (cuando esté disponible) Pb2 como fuentes reales adicionales.

## Alcance

**Incluye:**
- Conectar Google Ads y WooCommerce como fuentes de datos (Windsor.ai).
- Extender el Supabase "Plataforma ecosistema meta" (`jvudavpopxsguiemtrkk`) y el pipeline de n8n existente (`MetaAds - Consolidado`) con las fuentes nuevas.
- Motor de reconciliación: para cada marca+período, calcular ventas/facturación reales combinando las fuentes disponibles, aplicando la metodología de estimación proporcional (TB) cuando no hay atribución directa por anuncio.
- Vista de "Reportes" en `tm-platform` (o `crm-meta-ads` si no está aún fusionado) para elegir marca(s) + período y ver el número real vs. el crudo de Meta.
- Las 14 marcas desde el arranque, aceptando que algunas queden con menos fuentes cruzadas hasta resolver Pb2/WooCommerce (ver Riesgos).

**No incluye (por ahora):**
- Dashboard de Ventas del equipo comercial (`project-dashboards-rrhh-ventas`) — proyecto aparte, usa Chatwoot, no se fusiona acá salvo que Cielo lo pida.
- Cambios en Pb2 mismo (solo se solicita un scope nuevo de API, no se modifica el sistema).
- Corrección del problema de atribución anuncio→WhatsApp en Chatwoot (`project-atribucion-ventas-anuncios-chatwoot`) — queda como limitación conocida, no se soluciona en este plan.

## Arquitectura / Decisiones Técnicas

**Se extiende el backend existente (datos), pero el frontend es una vista NUEVA y separada** (decisión de Cielo 2026-09-17, ajustada 2026-09-17): reusar el Supabase + n8n de `crm-meta-ads`/`tm-platform` como fuente de datos (no duplicar el pipeline de Meta Ads que ya funciona), pero la pantalla de "Reportes Unificados" es una vista/ruta propia, independiente del dashboard actual — no se mezcla con las vistas existentes de campañas/marcas.

1. **Fuentes nuevas:**
   - **Google Ads — conexión DIRECTA en n8n, sin Windsor** (decisión de Cielo 2026-09-17, para no depender de un intermediario). Mismo patrón que los tokens de Meta Ads ya usados en `crm-meta-ads`. Requiere, en este orden:
     1. Cuenta administradora de Google Ads (MCC) vinculada a las cuentas reales de las marcas.
     2. ~~Developer Token vía el formulario del "Centro de la API" en Google Ads~~ — **corregido 2026-09-17 con captura real de Cielo:** ese formulario hoy solo sirve para la API de seguimiento de conversiones de apps/remarketing, NO para la Google Ads API general. Google movió la gestión de acceso/token de la Google Ads API a la **Google Cloud Console directamente** (mensaje real visto en pantalla: "Para acceder a la API de Google Ads, habilítala y gestiona tus niveles de acceso directamente en la consola de Google Cloud"). Confirmado que la cuenta "Turismo Bariloche" (791-839-3480) es la cuenta administradora (MCC) correcta.
     3. Proyecto en Google Cloud Console con "Google Ads API" habilitada — acá se gestiona ahora el nivel de acceso (reemplaza el paso viejo del Developer Token vía formulario).
     4. Credencial OAuth 2.0 (Client ID + Secret, tipo Web application) con el redirect URI real de la instancia de n8n usada (confirmar dominio exacto antes de crearla — hubo un cambio de dominio de n8n documentado en `project-crm-meta-ads`, no asumir el viejo `n8ntm.iadventurecentersx.com`).
     5. Credencial "Google OAuth2 API" en n8n con ese Client ID/Secret, scope `https://www.googleapis.com/auth/adwords`, conectada con la cuenta de Google que tiene acceso a Google Ads (acá puede reaparecer el error de passkey si es de la cuenta, no del proveedor — a resolver aparte).
     6. Workflow n8n nuevo (`GoogleAds - Sync`) que llama a la Google Ads API (HTTP Request + GAQL) con esa credencial, mismo patrón que `MetaAds - Consolidado`.
   - `woocommerce` — sigue vía Windsor.ai (manual, API key/secret por sitio): `https://onboard.windsor.ai/connect?connector=woocommerce&next=/app/woocommerce` — usar las credenciales ya guardadas de ADVC (`reference-adventurecenter-woocommerce-api`) y las de TB vía WP-CLI si no hay API REST propia habilitada en el multisitio. Windsor sigue siendo la vía para esta fuente porque no hay pedido de Cielo de hacerla directa.
2. **Pb2 — ⛔ scope de ventas NO disponible (confirmado 2026-09-17):** Cielo confirmó que Pb2 no tiene ese scope para ofrecer — la vía "pedir credencial nueva" queda descartada por ahora, no solo pendiente. **Pb2 queda 100% fuera del cruce real hasta nuevo aviso** — todas las marcas dependen de la metodología de estimación proporcional (WooCommerce+GA4, igual que TB) para aproximar ventas, no de una medición directa. Si en el futuro Pb2 habilita esto, se suma como fuente real y se puede migrar de estimado a medido.
3. **Backend — Supabase "Plataforma ecosistema meta":**
   - Tablas nuevas: `google_ads.metrics_daily` (mismo patrón que `meta_ads.metrics_daily`), `woocommerce.orders` (orden real, marca, fecha, monto, estado), `reports.reconciled_sales` (tabla de salida: marca, período, ventas reales, fuente de cada número, ventas estimadas vs. medidas).
   - `pb2.sales` se agrega recién cuando el scope esté aprobado.
4. **Backend — n8n:**
   - Workflows nuevos siguiendo el patrón ya probado de "MetaAds - Consolidado" (trigger schedule + webhook), uno por fuente nueva: `GoogleAds - Sync`, `WooCommerce - Sync`.
   - Workflow nuevo `Reportes - Reconciliar` que, por marca+período, aplica la metodología de reparto proporcional (visitas a landing page como peso) cuando no hay atribución directa, igual que el informe TB — deja marcadas como "estimado" las celdas que no son medición directa.
5. **Frontend:** vista/ruta **nueva y separada** ("Reportes Unificados"), no integrada al dashboard actual de `tm-platform`/`crm-meta-ads` — selector de marca(s) + rango de fechas, tabla con columnas reales vs. estimadas (mismo criterio visual que el informe TB: asterisco en lo estimado), botón exportar. Consume el mismo Supabase que ya existe (no duplica backend), pero vive en su propia pantalla. **Implementación (pedido de Cielo 2026-09-17):** partir copiando los componentes/vistas existentes de `crm-meta-ads`/`tm-platform` como base y adaptarlos, en vez de reescribir desde cero — mantiene consistencia visual y ahorra tiempo.
6. **Auditoría previa necesaria:** confirmar qué marcas de las 14 tienen checkout WooCommerce real activo (hoy solo confirmado TB y ADVC) — condiciona qué tan "real" puede ser el número de cada marca al arrancar.

## Tareas

- [x] 1a. Confirmado — MCC correcta: "Turismo Bariloche" (791-839-3480). **Corrección real (2026-09-17):** Google ya no gestiona niveles de acceso desde este formulario del API Center salvo para la API de conversiones de apps/remarketing — el token de programador de la Google Ads API general se ve/gestiona igual desde esta misma página ("Token de programador" + "Ver token"), pero el flujo de aprobación de acceso ahora vive en Google Cloud Console. Token ya generado (nivel "Acceso de explorador" = Test), oculto por seguridad.
- [x] 1b. Proyecto Google Cloud reusado: **"n8n-conexion"** (`n8n-conexion-466115`, ya existía). Google Ads API habilitada. Credencial OAuth reusada: **"Adventure Center TM - Automatizaciones"** (Client ID `131673978941-m37kkq2t7vbfim8bktsbgajf78ne6opd.apps.googleusercontent.com`) — el redirect URI de n8n (`https://n8n.iadventurecentersx.online/rest/oauth2-credential/callback`) ya estaba cargado, no hizo falta agregar nada.
- [x] 1c. Credencial "Google Ads OAuth2 API" cargada en n8n con Client ID/Secret + scope. Campo "Developer Token" pendiente de copiar (ver bloqueo abajo).
- [ ] 1d. ⏳ **Bloqueado por Google, no por nosotros (desde 2026-09-17 ~11:40hs):** para revelar el valor del Developer Token ("Ver token"), Google exige una llave de acceso (passkey) verificada — Cielo ya creó una ("Windows Hello", 17 sept 2026 11:40hs) pero Google avisa explícitamente que **tarda 1-2 días en "emparejarse"** antes de aceptarla para esta acción. Reintentar "Ver token" en `https://ads.google.com/aw/apicenter` recién después de ese plazo (aprox. 19 de septiembre). El resto del plan no depende de esto y puede avanzar mientras tanto.
- [ ] 2. ~~Cielo solicita el scope de ventas/reservas de Pb2~~ — descartado, Pb2 confirmó que no tiene ese scope disponible (ver Arquitectura punto 2).
- [ ] 3. Auditar las 14 marcas para confirmar cuáles tienen WooCommerce/checkout web propio activo (más allá de TB/ADVC ya confirmados) y cargar esas credenciales en Windsor.ai.
- [ ] 4. Diseñar y aplicar migraciones Supabase: `google_ads.metrics_daily`, `woocommerce.orders`, `reports.reconciled_sales`.
- [ ] 5. Construir workflow n8n `GoogleAds - Sync` (mismo patrón que `MetaAds - Consolidado`, usa la credencial OAuth2 directa de las tareas 1a-1c).
- [ ] 6. Construir workflow n8n `WooCommerce - Sync`.
- [ ] 7. Construir workflow n8n `Reportes - Reconciliar` con la lógica de reparto proporcional (generalizando la metodología TB).
- [ ] 8. Construir vista "Reportes" en el frontend (selector marca+período, tabla real/estimado, export).
- [ ] 9. Validar con un caso ya conocido: correr el reporte automático de TB para el mismo período del informe manual (25 ago–10 sep) y comparar que dé los mismos números ($4.754.319, 61 órdenes) antes de confiar en el sistema para otras marcas.
- [ ] 10. Rollout gradual al resto de las marcas, documentando cuáles quedan con menos fuentes cruzadas (sin WooCommerce ni Pb2 real).

## Criterio de Éxito

- Cielo puede elegir una o varias marcas + un período y obtener un reporte con ventas/facturación reales (no solo lo que dice Meta), marcando claramente qué números son medición directa y cuáles son estimación.
- El reporte automático de TB coincide con el informe manual ya validado (mismo período, mismos totales).
- El sistema no rompe ni duplica lo que ya funciona en `crm-meta-ads`/`tm-platform` (Meta Ads sigue andando igual).

## Notas / Riesgos

- **Pb2 queda descartado como fuente de ventas real** (confirmado por Cielo 2026-09-17, no solo pendiente) — todas las marcas dependen de la estimación proporcional (WooCommerce+GA4). Si esto cambia en el futuro, es una fuente nueva a sumar, no algo a esperar para arrancar.
- **Google Ads directo depende del Developer Token de Google**, que puede tardar días en aprobarse — es el tramo con mayor riesgo de demora de todo el plan. Mientras tanto, WooCommerce/Meta/frontend pueden avanzar en paralelo sin quedar bloqueados por esto.
- **Error de passkey de Google — resuelto en curso (2026-09-17):** no era un problema de cuenta rota, sino que Google exige una llave de acceso (passkey) para acciones sensibles como ver el Developer Token de Google Ads. Cielo ya creó una ("Windows Hello", 17 sept 2026) — el único paso que falta es esperar el plazo que el propio Google avisa (1-2 días para "emparejar" la llave nueva). Ver tarea 1d.
- **Atribución anuncio→WhatsApp rota en Chatwoot** (`project-atribucion-ventas-anuncios-chatwoot`) — cualquier número que use Chatwoot como fuente de "ventas por anuncio" es un piso, no el real.
- **No todas las 14 marcas tienen web propia** — para esas, el reporte queda limitado a Meta+Google Ads (sin forma de confirmar venta real), sin fecha de resolución ya que Pb2 no está disponible.
- Este plan depende de pasos que solo Cielo puede hacer en cuentas propias (MCC de Google Ads, Developer Token, Google Cloud Console) — no arrancar la construcción del tramo de Google Ads sin al menos el Client ID/Secret disponible; el resto del plan (WooCommerce, reconciliación, frontend) no depende de esto y puede avanzar antes.
