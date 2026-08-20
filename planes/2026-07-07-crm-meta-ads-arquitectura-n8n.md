# Plan: CRM Meta Ads — Backend seguro con n8n + estructura de métricas propia

**Fecha:** 2026-07-07
**Estado:** Pendiente
**Proyecto:** crm-meta-ads (`salidas/crm-meta-ads/`)

## Contexto y Justificación

El CRM Meta Ads hoy es una app React + TypeScript + Zustand que corre 100% en el
navegador: hace fetch directo a Meta Graph API v21.0 usando 4 tokens de System User
guardados en `config.js` (gitignored). Esta arquitectura fue una decisión deliberada
("nunca n8n ni Supabase acá") tomada cuando el uso era solo de Cielo, en su propia
máquina, en local.

Eso cambió: Cielo confirmó que el plan de largo plazo es que **el equipo TM y SP también
usen el dashboard**, no solo ella. Con acceso multi-usuario, dejar los tokens de System
User en el bundle JS del navegador es un riesgo real — cualquiera con el link puede
abrir devtools y extraer un token con acceso completo a las 4 cuentas publicitarias.
Además, cada carga de página dispara ~12 llamadas por cuenta (una por mes, ver
`fetchMonthly` en `metaApi.ts`) solo para construir el histórico del año — con varios
usuarios mirando el dashboard eso multiplica el riesgo de pisar el rate limit de Meta.

Aparte de la arquitectura, Cielo también necesita definir con tiempo **qué métricas le
importan a ella y a la empresa (SP)** — hoy el dashboard trackea mensajes, inversión,
CPL, impresiones y clics porque así arrancó el proyecto en abril, no porque se haya
decidido explícitamente que esas son las métricas correctas a largo plazo. Ese trabajo
de definición es iterativo y va a llevar tiempo, así que este plan separa dos cosas:
la infraestructura (que se construye ahora, de una) y el catálogo de métricas (que
queda con un lugar claro para seguir creciendo sin tener que re-arquitecturar nada cada
vez que se agregue una).

## Alcance

**Incluye:**
- Mover el fetch a Meta Graph API del navegador a un backend en n8n (misma instancia
  `n8ntm.iadventurecentersx.com` que ya corre IArturo).
- Diseñar un esquema de datos en Supabase para guardar snapshots históricos de métricas
  por cuenta/marca/campaña, más allá de la ventana que permite consultar la API de Meta.
- Reemplazar `metaApi.ts` para que el frontend consuma un endpoint propio (webhook n8n)
  en vez de `graph.facebook.com` directo.
- Sacar los 4 tokens de System User del repo/navegador — pasan a vivir como credenciales
  de n8n.
- Agregar un gate de acceso simple al frontend para limitar quién entra (equipo TM + SP).
- Deploy del frontend a un servidor (hoy solo corre local).
- Un archivo vivo (`contexto/meta-ads/metricas-clave.md`) donde Cielo va documentando,
  a su ritmo, qué métricas importan y por qué — sin bloquear el resto del plan.

**NO incluye:**
- El catálogo final y cerrado de métricas — eso es trabajo iterativo de Cielo, este plan
  da la infraestructura extensible, no la lista definitiva.
- Reportes automáticos por WhatsApp/Slack/email — sigue en el backlog aparte, pero el
  pipeline que se arma acá lo deja fácil de sumar después (mismo dato ya centralizado).
- Rediseño visual del frontend — se mantiene como está salvo lo estrictamente necesario
  para consumir el nuevo endpoint.
- Sistema de permisos granular por rol — alcance mínimo es un login compartido para el
  equipo, no un sistema de roles complejo.

## Arquitectura / Decisiones Técnicas

- **n8n:** reutilizar la instancia `n8ntm.iadventurecentersx.com` (separada de Magda),
  con workflows nuevos prefijados `MetaAds - ...` para no mezclarse con los de IArturo.
- **Credenciales:** son **3 tokens** para las 4 cuentas (Sergio ADC y Ale Sopran
  comparten el token `turcentralpatagonia`, ver `contexto/meta-ads/modelo-mental-crm.md`):
  `turcentralpatagonia`, `brasil`, `rafting`. Se cargan como credenciales de n8n (tipo
  Query Auth, ya que Meta usa `access_token` como query param, no header). Nunca en
  git, nunca en el bundle del frontend.
- **Storage:** Supabase Postgres — modelo de tabla de hechos (`ads_metrics_daily` o
  similar: cuenta, marca, campaña, fecha, spend, mensajes, impresiones, clics) más
  tablas de dimensión (cuentas, marcas). Permite agregar columnas/métricas nuevas sin
  romper lo existente, y habilita queries de series de tiempo reales (no solo lo que la
  API de Meta deja consultar).
  - **Decidido (2026-07-07, sesión de arquitectura con `senior-architect-tm-protocol`):**
    proyecto Supabase **nuevo**, pero pensado desde el inicio como **"TM Platform"**
    compartida — no un silo dedicado solo a Meta Ads. Datos de Meta Ads viven en un
    schema propio (`meta_ads`), dejando lugar para que CRM CM sume su propio schema
    (`crm_cm`) el día que ese proyecto llegue a datos reales. La tabla de
    usuarios/roles (`admin`=Cielo, `viewer`=SP, a futuro `cm`=Luciana) vive a nivel de
    plataforma, no del schema de Meta Ads — así un solo login sirve para ambas
    herramientas sin duplicar auth.
- **Sync workflow:** workflow programado (cadencia sugerida: cada 30-60 min, no cada 10
  como IArturo — los datos de ads no necesitan esa frescura) que hace fetch a Graph API
  para las 4 cuentas y escribe/actualiza Supabase.
- **API workflow:** webhook que sirve al frontend los datos ya agregados, replicando en
  un primer momento la forma de `LoadedData` (mismo shape que usa hoy el store) para no
  forzar una reescritura grande del frontend en el mismo paso.
- **Frontend:** `metaApi.ts` pasa a pegarle al webhook de n8n en vez de a
  `graph.facebook.com`. Se elimina `config.js` del build.
- **Acceso — resuelto en la sesión de arquitectura (2026-07-07):** no se fusiona el
  código de CRM Meta Ads y CRM CM (están en etapas de madurez muy distintas — CM sigue
  en modo mock). Lo que sí se comparte es la base: Supabase de plataforma (ver Storage
  arriba) + tabla de roles. Sobre ese login único:
  - Cielo (`admin`) ve el detalle completo.
  - SP (`viewer`) ve una versión curada — qué métricas exactamente se define con una
    tabla de configuración (`sp_visible_metrics` o similar) que Cielo controla. Ningún
    dato queda expuesto a SP por default; Cielo decide qué prender.
  - Un "hub" liviano (tarjetas con enlace a cada herramienta) se construye más adelante,
    cuando CRM CM tenga datos reales — no es parte del alcance de este plan.

## Tareas

### Fase 0 — Datos y diseño (en paralelo, sin bloquear el resto)
- [x] 1. Documentado en `contexto/meta-ads/metricas-clave.md` las métricas actuales
      (mensajes, inversión, CPL, impresiones, clics), con secciones abiertas para que
      Cielo sume qué le importa a ella y a SP.
- [x] 2. ~~Decidir: ¿Supabase nuevo o reutilizar uno existente?~~ → **Nuevo proyecto
      Supabase "TM Platform"**, con schema `meta_ads` propio y tabla de roles a nivel
      de plataforma (decidido 2026-07-07, ver Arquitectura).
- [x] 3. Proyecto Supabase creado: **"Plataforma ecosistema meta"**
      (`https://supabase.com/dashboard/project/jvudavpopxsguiemtrkk`). Migración
      corrida por Cielo (2026-07-08), schemas `platform` y `meta_ads` expuestos en
      Settings → API.

### Fase 1 — Backend en n8n
- [x] 4. Credenciales creadas en n8n (2026-07-08): `Supabase Plataforma Meta`
      (supabaseApi), `Meta_token_Ale sopran_Y_Sergio_Adc`, `Meta_token_Brasil`,
      `Meta_token_rafting` (las 3 tipo Query Auth, param `access_token`).
- [x] 5. Workflow **"MetaAds - Sync"** creado y activo (`2N6c2OEnZgS5QJnj`,
      `n8ntm.iadventurecentersx.com/workflow/2N6c2OEnZgS5QJnj`). Programado cada 30 min:
      Config cuentas → enruta por credencial (Switch) → 3 ramas HTTP Insights (una por
      credencial) → adjuntar metadata de cuenta → Merge → clasificar marca (regex
      idénticas a `brands.ts`) + extractMessages (idéntico a `metaApi.ts`) → upsert en
      `meta_ads.metrics_daily`. **No incluye todavía** cuentas/campañas (status,
      objetivo) — solo insights de hoy; fast-follow si hace falta paridad total con el
      CRM actual.
- [x] 6. Workflow **"MetaAds - API"** creado y activo (`NwtNSRsDORpSAyBA`,
      `n8ntm.iadventurecentersx.com/workflow/NwtNSRsDORpSAyBA`). Webhook POST
      `/webhook/meta-ads-api` con `{period: 'today'|'week'|'month'|'ytd'}` → calcula
      rango de fechas → lee `meta_ads.metrics_daily` filtrado por fecha → agrega en
      `{accounts, byBrandPeriod, byCampaigns, byExcursion}` → responde JSON.
- [x] 7. **✅ Resuelto (2026-07-08, sesión 3).**
      - ✅ Token `turcentralpatagonia` vencido → regenerado por Cielo (sin expiración).
      - ✅ Meta Graph API funciona perfecto: las 3 ramas (Ale+Sergio, Brasil, Rafting)
        traen datos reales de hoy, clasificación por marca correcta.
      - ✅ **Causa real del bloqueo de escritura encontrada:** no era un incidente de
        plataforma de Supabase — el rol `authenticator` nunca tuvo seteado
        `pgrst.db_schemas` pese a que el Dashboard mostraba "4 of 4 schemas exposed".
        Fix: `ALTER ROLE authenticator SET pgrst.db_schemas = 'public, meta_ads, platform';`
        + `NOTIFY pgrst, 'reload schema';` (el `reload config` solo no alcanzó).
      - ✅ Escritura confirmada: ejecución real del workflow "MetaAds - Sync" (n8n `757`,
        `status: success`) → 32 filas en `meta_ads.metrics_daily`, 3 marcas.
      - Pendiente (fast-follow, no bloqueante): comparar paridad de números contra el CRM
        actual antes de apagar el fetch directo del navegador.

### Fase 2 — Frontend
- [x] 8. **✅ Hecho (2026-07-08, sesión 3).** `metaApi.ts` reescrito para consumir el
      webhook `MetaAds - API` (POST con `{period}`) en vez de fetch directo a Meta.
      Para lograr paridad de features se amplió también el pipeline de n8n:
      - "MetaAds - Sync" ahora trae además estado de cuenta (activa/pausada/sin fondos)
        y estado+objetivo de campaña (antes solo insights de hoy).
      - "MetaAds - API" arma `accounts[]` con metadata completa (nombre/color/moneda
        estático + estado en vivo) y desglose por cuenta en `byCampaigns`/`byExcursion`.
      - Migración `002_add_status_columns.sql` agrega las columnas nuevas.
      - Probado en el navegador con Playwright: dashboard y vista Campañas muestran
        datos reales, incluyendo el filtro Activas/Todas por estado de campaña.
      - **Gap conocido, no bloqueante:** `byBrandYear` (gráfico "Mensajes por mes")
        queda vacío — requiere backfill histórico de meses anteriores, el sync diario
        actual no lo genera solo. Fast-follow para cuando haya tiempo.
      - Rama `feat/frontend-consume-n8n-webhook` pusheada, PR sin abrir (esperando que
        Cielo diga "hacé el PR").
- [x] 9. **✅ Hecho.** `config.js` sacado de `index.html`; `window.META_CONFIG` y sus
      tipos (`MetaConfig`, `BrandAccountConfig`, `BRAND_ACCOUNTS`, `ACC_BUDGETS`,
      `API_BASE`) eliminados — el navegador ya no ve ningún token de Meta.
- [x] 10. **✅ Hecho (2026-07-08, sesión 3).** Login con Supabase Auth (email+password,
      `LoginScreen.tsx`) + store de auth (Zustand, `store/auth.ts`) + `App.tsx` gatea
      todo el dashboard detrás de sesión activa.
      - El webhook "MetaAds - API" ahora verifica el JWT contra Supabase Auth
        (`GET /auth/v1/user`) antes de responder — token inválido → 401. Después
        consulta `platform.users` para el rol, y si no es `admin`, cura la respuesta
        según `meta_ads.sp_visible_metrics` (todo en 0 por default, tal como se diseñó:
        "ningún dato queda expuesto a SP por default").
      - Probado end-to-end con un usuario desechable (creado/borrado por SQL directo,
        saltando el rate limit de emails de confirmación del proyecto): rol `viewer`
        → todo en cero; mismo usuario promovido a `admin` → datos reales completos.
      - **Pendiente real:** no hay ningún usuario real en `platform.users` todavía.
        Cuando Cielo (o SP) se registre por primera vez desde la app, promoverla a
        `admin` a mano: `update platform.users set role='admin' where email='...'`.
      - El hub compartido con CRM CM sigue fuera de este plan, para más adelante.

### Fase 3 — Deploy y cierre
- [ ] 11. Deploy del frontend a servidor (definir dónde — Vercel u otro).
      **Decidido (2026-07-08):** se hace al final, cuando la plataforma esté en un
      70/80% — no antes.
- [ ] 12. Verificar el flujo completo en producción con al menos 2 usuarios distintos.
- [ ] 13. Documentar la arquitectura nueva en `contexto/meta-ads/` y actualizar memoria
      del proyecto.

### Fase 2.5 — Fixes de calidad de datos (2026-07-08, sesión 3, sobre la marcha)
- [x] Estado de cuenta basado en entrega real (spend/impresiones de hoy), no en el
      `effective_status` de la campaña que puede mentir por la jerarquía Meta
      Campaña→Conjunto→Anuncio. Ver memoria del proyecto para el detalle.
- [x] Nombre y moneda de cuenta en vivo desde Meta (antes hardcodeados en 2 lugares).
- [x] ~~Backfill mensual (`meta_ads.metrics_monthly`...)~~ — **superado por la
      consolidación de abajo el mismo día.** `metrics_monthly` existió unas horas y
      se retiró antes de mergear nada; no es un error si aparece en commits viejos.

### Fase 2.6 — Consolidación a una sola fuente de verdad (2026-07-08, sesión 3)
- [x] Cielo detectó que "7 días"/"Este mes" no coincidían con Meta Ads Manager
      (faltaban los días 1-7 de julio en `metrics_daily`, que solo tenía datos desde
      que arrancó el sync). Decisión: **una sola tabla (`metrics_daily`) con
      granularidad diaria real desde el 1° de enero**, no dos tablas (diaria +
      mensual) con lógica duplicada.
- [x] `meta_ads.metrics_monthly` eliminada (`006_retire_metrics_monthly.sql`).
- [x] Workflow "MetaAds - Backfill Mensual" reconstruido como **"MetaAds - Backfill
      Diario"** (mismo `workflowId M1Ixn9LVjC1fujLU`) — usa `time_increment=1` de
      Meta en chunks semanales (~108 llamadas), guarda en `metrics_daily`.
      Corrido con éxito: ~13.719 filas reales Ene-Jul. Brasil: 501 mensajes en julio
      vs. 496 de Meta Ads Manager (~1% de diferencia, normal).
- [x] Bug de agregación arreglado: `accounts[]` tomaba nombre/estado de la PRIMERA
      fila (podía ser histórica, con esos campos null) en vez de la más reciente.
      Fix: dos pasadas sobre las filas — primera resuelve valores, segunda agrega.
- [x] Webhook "MetaAds - API": segundo fetch a `metrics_daily` (año completo) arma
      `byBrandYear` — ya no depende de `metrics_monthly`.
- [x] Retry On Fail (3 intentos, 2s de espera) en los 18 nodos que llaman a una API
      externa, repartidos en los 3 workflows.
- [ ] **Sin cerrar al terminar la sesión:** quedó pendiente la confirmación 100%
      visual en el navegador de que "7 días/Este mes/Este año" muestran los números
      reales — se detectó saturación de la cola de ejecuciones de n8n (demasiadas
      pruebas seguidas) y una ejecución quedó colgada más de 11 min sin resolver.
      Los datos en Supabase y la lógica están verificados correctos por SQL directo;
      falta la última vuelta de humo en la UI. Primer paso de la próxima sesión.
- [x] Sticky notes explicativas (una por nodo) en los 3 workflows de este proyecto
      — y de paso, a pedido de Cielo, en los 3 workflows de IArturo también.

## Criterio de Éxito

- El navegador nunca ve ningún token de Meta (verificable en Network/bundle).
- Al menos 2 personas del equipo entran al CRM desde dispositivos distintos y ven los
  mismos datos.
- Los datos empiezan a guardarse en Supabase más allá de la ventana que permite Meta.
- El dashboard sigue mostrando lo mismo que hoy, sin perder funcionalidad, con paridad
  de números confirmada contra el fetch directo antes de apagarlo.
- Existe un lugar claro (`contexto/meta-ads/metricas-clave.md`) para que Cielo siga
  sumando métricas sin tener que rearmar el sistema cada vez.

## Notas / Riesgos

- La definición de qué métricas importan es un proceso que Cielo dijo explícitamente
  que va a llevar tiempo — este plan no lo resuelve de una, deja la base para que se
  sume de a poco.
- Mientras se migra, el CRM actual (fetch directo) puede seguir funcionando en paralelo
  — no cortar el acceso actual hasta confirmar paridad de datos con el nuevo pipeline.
- Riesgo de rate limit de Meta si el sync corre muy seguido en las 4 cuentas — cadencia
  sugerida 30-60 min, ajustable.
- **Resuelto (2026-07-07):** se hizo la sesión de arquitectura dedicada (protocolo
  `senior-architect-tm-protocol`) antes de tocar código de acceso. Decisión: no
  fusionar CRM Meta Ads y CRM CM en un solo codebase todavía (etapas de madurez muy
  distintas — CM sigue en modo mock), pero sí compartir la base de Supabase (proyecto
  "TM Platform", schema `meta_ads` + tabla de roles a nivel de plataforma) para que un
  mismo login sirva a futuro para ambas herramientas. El hub visual que una ambas apps
  queda fuera de este plan — se construye cuando CRM CM tenga datos reales.
- Cuando CRM CM avance a su fase de datos reales, replicar ahí el mismo patrón de
  `sp_visible_metrics` en vez de inventar uno nuevo.
