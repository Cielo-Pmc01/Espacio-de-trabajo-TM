# Plan: Motor de Copys — Meta Ads (motor de generación dedicado, separado de redes)

**Fecha:** 2026-07-30
**Estado:** Completado (7/7 tareas)
**Proyecto:** Meta Ads — pieza previa de `planes/2026-07-30-automatizar-anuncios-meta-ads-video-copy.md` (ese plan pasa a consumir el copy de acá en vez de `content_pipeline`)

## Contexto y Justificación

Hoy el nodo **"Generar copy por marca"** del workflow n8n "CM - Generar Contenido" (`EOsiYhWiMAimGXs6`, ver [[motor-contenido-cm]]) genera copy con el **mismo prompt** tanto para redes sociales orgánicas (Luciana) como para campañas de Meta Ads, usando las 4 estructuras obligatorias ya validadas (Valor/Precio, Simplicidad/Directo, Urgencia Real, Bullet-list — `contexto/tm/negocio/copy_protocol.md`).

Cielo señaló (2026-07-30) que redes y Meta Ads van a divergir cada vez más: **redes** busca awareness/vínculo con la audiencia, **Meta Ads** busca conversión directa (precio real, urgencia, CTA a WhatsApp). Pidió explícitamente que esto sea **escalable** a futuro — por eso se separa en un motor propio en vez de solo ajustar el prompt del existente, para no quedar atado al schema y ciclo de vida de `content_pipeline` (pensado para calendario editorial de redes: `slides`, `fecha_publicacion`, `hora` — campos que un anuncio no necesita).

## Alcance

**Incluye:**
- Tabla nueva **`meta_ads.ad_copy_pipeline`** (mismo proyecto Supabase "Plataforma ecosistema meta", `jvudavpopxsguiemtrkk` — encaja semánticamente en el schema `meta_ads`, que ya tiene `metrics_daily`/`account_metadata_cache`, en vez de en `crm_cm`).
- Workflow n8n nuevo **"Meta Ads - Generar Copy"** — mismo patrón probado del Motor CM (Agent + GPT-5-mini + Supabase), pero con prompt propio de conversión/venta.
- Generación de **múltiples variantes por pieza** (una por estructura obligatoria) para permitir elegir/A-B testear antes de crear el anuncio real.
- **Fuente principal (corregida 2026-07-30, feedback directo de Cielo): los precios se leen EN VIVO de los Docs 3 y 4** (los mismos que usan las webs — `1XsOAYYxMOvnKSTfTUKBB23vFnccIf5cmfAIUNTXECHY` Invierno / `1oR2zsKXRS0Zzs6nXLEf86II2_2nTZWdsPjgr9ypTFs0` Todo el Año), NO de `crm_cm.excursion_catalog`. Esa tabla se cargó una sola vez (14/07) desde un archivo estático y ya se sabe que se desactualiza (caso documentado: fila de Bautismo Ski/Snow con precios placeholder) — no es una fuente confiable para copy de venta con precio real.
- Campos de trazabilidad hacia el anuncio real que se termine creando en Meta (`campaign_id`/`adset_id`/`ad_id`, llenados por el plan de automatización de anuncios una vez que los cree).
- Aprobación simple (booleano `aprobado` + `estado`), sin UI nueva en v1 — Cielo revisa por SQL/vista directa o por un webhook simple de "aprobar pieza X".

**NO incluye (fuera de alcance):**
- Interfaz visual tipo Kanban (como `crm-cm`) para revisar/aprobar — queda como fast-follow opcional si Cielo lo pide después de usar el motor un tiempo.
- Fuentes de "tendencia" o "Chatwoot" (sí tiene sentido para redes, no está claro que aporten a un anuncio de venta directa) — v1 se limita a catálogo; agregar otra fuente es una extensión menor sobre esta misma base si hace falta.
- La creación del anuncio real en Meta — eso lo hace el plan aparte `2026-07-30-automatizar-anuncios-meta-ads-video-copy.md`, que pasa a leer de esta tabla.
- Migrar contenido histórico de `content_pipeline` — este motor arranca vacío, no importa copy viejo de redes.

## Arquitectura / Decisiones Técnicas

**Tabla `meta_ads.ad_copy_pipeline` (columnas reales tras la corrección del 30/07):**
- `id` (bigint, PK)
- `marca` (text) — una de las 9 marcas
- `excursion_nombre` (text) — título real tal cual aparece en el Doc 3/4 (ya NO hay FK a `crm_cm.excursion_catalog`, se eliminó esa columna)
- `origen_doc` (text) — `invierno` o `anio`, de qué doc salió
- `estructura` (text) — `valor_precio` / `simplicidad_directo` / `urgencia_real` / `bullet_list`
- `hook`, `copy`, `cta` (text) — mismo shape que `content_pipeline` para reusar convenciones ya conocidas por el equipo
- `estado` (text: `Generado` / `Aprobado` / `Rechazado`) — vocabulario más simple que el de redes (no hace falta Guion/Grabado/Editado, un copy de texto no pasa por producción audiovisual)
- `aprobado` (boolean)
- `motivo_rechazo` (text, nullable)
- `video_drive_id` (text, nullable) — referencia al video elegido para esta pieza, una vez asociado (puede completarse desde el otro plan)
- `meta_campaign_id` / `meta_adset_id` / `meta_ad_id` (text, nullable) — se completan cuando el plan de automatización de anuncios efectivamente crea el anuncio en Meta, para trazabilidad y evitar duplicados
- `origen` (text, default `'catalogo'` — deja lugar a futuras fuentes sin migrar schema)
- `created_at`/`updated_at`

**Grants:** aplicar el fix ya conocido de este proyecto — cualquier tabla nueva en "Plataforma ecosistema meta" necesita grants explícitos a `anon/authenticated/service_role` (no los hereda solo, ver [[motor-contenido-cm]] y [[reference-supabase-plataforma-meta-ads]]).

**Workflow n8n "Meta Ads - Generar Copy":**
- Trigger: webhook/form (selecciona marca + excursión, o "cualquiera al azar" entre las activas del catálogo — mismo patrón ya usado en "CM - Generar desde Catálogo").
- Agent con GPT-5-mini, `systemMessage` específico de copy de venta directa: precio real, urgencia genuina (no inventada), CTA fuerte hacia WhatsApp — coherente con que las campañas reales usan objetivo `OUTCOME_ENGAGEMENT` enfocado en mensajes (ver [[project-crm-meta-ads]] función `extractMessages`).
- Genera las 4 variantes (una por estructura) en una sola corrida, inserta las 4 filas en `ad_copy_pipeline` con `estado='Generado'`.
- Responde con las 4 variantes para revisión.

**Conexión con el plan de automatización de anuncios:** una vez que este motor esté en producción, actualizar `planes/2026-07-30-automatizar-anuncios-meta-ads-video-copy.md` — su Tarea de "fuente de copy" pasa a leer `meta_ads.ad_copy_pipeline` (filtrando `aprobado=true`) en vez de `crm_cm.content_pipeline`. (Se aplica al cerrar este plan, ver Tarea final abajo.)

## Tareas

- [x] 1. Confirmar el schema exacto actual de `crm_cm.excursion_catalog` (columnas reales, no asumir) antes de referenciarlo desde la tabla nueva. **Confirmado:** `id, nombre, categoria, temporada, recorrido, lugar_encuentro, incluye, no_incluye, precio_info (text libre, con precios reales), activa, created_at, updated_at`. No tiene columna `marca` (es agnóstico de marca) — el copy nuevo necesita su propia columna `marca`.
- [x] 2. Crear `meta_ads.ad_copy_pipeline` en Supabase con las columnas de arriba + grants explícitos a `anon/authenticated/service_role`. **Hecho** (migración `create_ad_copy_pipeline`, proyecto `jvudavpopxsguiemtrkk`).
- [x] 3. Construir el workflow n8n **"Meta Ads - Generar Copy"** (`YMfLVbmwUvKNreqh`, https://n8n.iadventurecentersx.online/workflow/YMfLVbmwUvKNreqh — reemplaza a la versión inicial `jd4f1oLy96jHH1gx`, archivada) — form trigger (marca + nombre de excursión opcional) → trae y parsea el Doc 3 (Invierno) EN VIVO → trae y parsea el Doc 4 (Todo el Año) EN VIVO → junta las activas de ambos y elige la pedida por nombre (o al azar) → Agent GPT-5-mini con prompt de las 4 estructuras (idioma portugués automático si marca=TBBR/PBRS) → arma e inserta 4 filas en `meta_ads.ad_copy_pipeline` → mensaje final con las 4 variantes.
- [x] 4. Probado con 3 excursiones reales distintas (2 con la versión corregida leyendo de los Docs). **Prueba 1 (versión inicial, con tabla vieja):** marca TC, "VILLA LA ANGOSTURA Y CERRO BAYO" — ya no vigente, ver corrección abajo. **Prueba 2 (versión corregida):** marca PB, mismo nombre buscado explícitamente por texto — encontrada en el Doc 3 real con precio **$77.500/$93.000** (¡distinto del $59.400/$71.300 que tenía la tabla vieja — confirma exactamente el problema que señaló Cielo!). **Prueba 3 (versión corregida, al azar):** marca PBRS, salió "TRASLADO A PIEDRAS BLANCAS" al azar, en portugués real, precio $59.500/$71.400 correcto. Las 4 estructuras siempre claramente diferenciadas, sin precios/datos inventados.
- [x] 5. Publicado el workflow (v2, corregida), sticky note por nodo agregada (formato ya establecido, color verde). Activo en producción.
- [x] 6. **Resuelto — Cielo eligió opción 1 (webhook).** Creado y publicado **"Meta Ads - Aprobar Copy"** (`CCQZyUCk0njsmk1Q`, https://n8n.iadventurecentersx.online/workflow/CCQZyUCk0njsmk1Q) — `POST /webhook/aprobar-copy-meta-ads` con body `{id, accion: 'aprobar'|'rechazar', motivo_rechazo?}`, actualiza `estado`/`aprobado`/`motivo_rechazo` de esa fila. Probado con datos reales: aprobación (id 9 → `estado='Aprobado'`) y rechazo con motivo (id 13 → `estado='Rechazado'`, motivo guardado) confirmados por SQL.
- [x] 7. **`planes/2026-07-30-automatizar-anuncios-meta-ads-video-copy.md` actualizado** para leer de `meta_ads.ad_copy_pipeline` en vez de `crm_cm.content_pipeline` (hecho en la sesión anterior a este mismo plan).

### ⚠️ Corrección aplicada (2026-07-30, mismo día, feedback directo de Cielo): fuente de precios cambiada de `crm_cm.excursion_catalog` a los Docs 3/4 en vivo

Cielo señaló que los precios deben leerse de los Docs 3 y 4 (los mismos que usan las webs), no de la tabla `crm_cm.excursion_catalog` — esa tabla se cargó una sola vez (14/07) desde un archivo estático y ya tenía un caso documentado de precios desactualizados (placeholder). Se reconstruyó el workflow (mismo nombre, ID nuevo `YMfLVbmwUvKNreqh`) para leer los Docs en vivo vía el proxy `docs-proxy-tm-x91qk3`, reusando **el mismo parser ya probado** del workflow "Sync Precios Docs → Capacitación TM" (`vYJ856nLJ43o0IJW`) — mismo criterio de detección de título (`namedStyleType==='TITLE'` + todo en negrita), activo/inactivo por color de fuente, horario (🕘) y precios (💰/💳). **Extensión agregada:** el parser original de esa sesión solo capturaba título/horario/precio; se le sumó captura de las secciones RECORRIDO e INCLUYE (tracking de "sección actual" entre labels) para que el copy tenga contexto real más allá del precio — verificado con datos reales que ambas secciones se extraen correctamente en la gran mayoría de los casos.

**Cambio de schema correspondiente:** `ad_copy_pipeline.excursion_id` (FK a `crm_cm.excursion_catalog`) reemplazado por `excursion_nombre` (text, el título real tal cual aparece en el doc) + `origen_doc` (text: `invierno`/`anio`). Las 8 filas de prueba viejas (con `excursion_id`) se borraron antes del cambio de schema — eran solo datos de prueba, no contenido real de Cielo.

**Limitación conocida, no bloqueante:** en 3 de 47 excursiones detectadas en el Doc 3 (Roca Negra, Noche Encantada, Nieve Encantada — coincide con las mismas 2-3 excursiones ya identificadas como "formato irregular" en [[project-auditoria-catalogo-webs]]/[[feedback-texto-gris-deshabilitado-docs]]), el campo `recorrido` queda vacío y `horario` captura texto de un heading en vez de un horario real — el precio SÍ se extrae bien en estos casos. No se investigó a fondo (mismo criterio que el resto de este ecosistema: no sobre-invertir en casos límite ya conocidos como irregulares en el documento fuente).

## Criterio de Éxito

- Dada una excursión real del catálogo, el motor genera 4 variantes de copy (una por estructura), con precio real y CTA a WhatsApp, guardadas en `meta_ads.ad_copy_pipeline`.
- El plan de automatización de anuncios puede tomar una fila aprobada de esta tabla como fuente de copy sin cambios adicionales de su lado más que apuntar a la tabla correcta.
- Cielo puede aprobar/rechazar una pieza sin intervención técnica (aunque sea con un mecanismo simple, no un Kanban).

## Notas / Riesgos

- Al ser un motor nuevo, no hereda ningún dato — arranca vacío, sin migración de `content_pipeline`.
- Si con el uso real Cielo pide más fuentes (tendencia, Chatwoot) o variantes adicionales, el campo `origen` y el diseño por filas (una por estructura) ya lo permiten sin rediseñar el schema — es la parte "escalable" que pidió.
- Mismo gotcha ya conocido de este proyecto Supabase: sin el fix de grants explícitos, el frontend/n8n puede recibir `[]` sin error visible en vez de fallar ruidosamente.
- Este plan deja pendiente, a propósito, la UI de aprobación — evaluar después de un tiempo de uso real si hace falta algo más que un webhook/SQL directo.
