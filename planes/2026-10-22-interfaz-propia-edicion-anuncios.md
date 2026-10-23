# Plan: Interfaz propia para hacer lo que Windsor hace y el MCP oficial de Meta no

**Fecha:** 2026-10-22  
**Estado:** Pendiente de aprobación  
**Proyecto:** TM — Plataforma TM (`salidas/tm-platform`) + agente de Meta Ads

## Contexto y justificación
Cielo gestiona Meta Ads con el **MCP oficial de Meta** (`meta-ads`) y, para lo que ese MCP no permite, usa **Windsor.ai**. Quiere esas mismas funciones en **su propio entorno e interfaz**, sin depender de Windsor.

### Qué no puede hacer el MCP oficial (verificado en sus descripciones, 2026-10-22)
| Función | MCP oficial | Windsor (`execute_action`) | Cómo se logra por la Graph API |
|---|---|---|---|
| Editar el contenido de un anuncio (texto principal, titular, descripción, link, botón, imagen, `url_tags`, Advantage+) | **No**: las creatividades son inmutables y `creative` no se acepta al actualizar un anuncio. Solo se puede crear un anuncio nuevo y pausar el viejo (cambia el ID y se pierde el historial) | `update_ad_creative` | Crear una **creatividad nueva** copiando la actual con los cambios y **re-apuntar el mismo anuncio** (conserva ID, reacciones y aprendizaje) |
| Mensaje de bienvenida de anuncios de mensajes | **No** (usa el predeterminado de la Página) | `set_page_welcome_message` | Igual: clonar creatividad con `page_welcome_message` nuevo y re-apuntar |
| Cambiar la creatividad que usa un anuncio existente | **No** | `update_ad` (`creative`) | `POST /{ad_id}` con `creative={creative_id}` |
| Duplicar un conjunto de anuncios (con o sin anuncios) | No vi una acción equivalente | `duplicate_adset` | `POST /{adset_id}/copies` |

El MCP oficial sí cubre: crear campañas/conjuntos/anuncios, subir medios, presupuestos, audiencias, Pixel, catálogos, pruebas A/B y reportes. Eso no se replica.

## Alcance
**Fase 1 (este plan): "Editor de anuncios"** dentro de la Plataforma TM:
1. Elegir cuenta → listar anuncios (lectura).
2. Abrir un anuncio y ver su creatividad actual.
3. Editar: mensaje de bienvenida, texto principal, titular, descripción, link, botón y etiquetas UTM.
4. Ver **antes / después** y confirmar (el «sí» de Cielo, como en la regla del agente).
5. Aplicar: crear creatividad nueva + re-apuntar el anuncio + releer y verificar.
6. Registro de cambios y **botón de deshacer** (volver a la creatividad anterior).

**Fases siguientes (no incluidas):** duplicar conjuntos, acciones masivas por marca, vincular el agente de WhatsApp al mismo backend, reportes.
**No incluye:** reemplazar el MCP oficial ni las funciones que ya cubre.

## Arquitectura / decisiones técnicas
- **Dónde vive:** nueva sección `/anuncios` en `salidas/tm-platform` (Next.js 16, Supabase Auth, ya con roles). Antes de escribir código, leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (lo exige el `AGENTS.md` del repo).
- **Backend:** *Route Handlers* de Next.js (servidor), que llaman a la Graph API. El token de Meta va **solo en variable de entorno del servidor** (nunca `NEXT_PUBLIC_`). Alternativa: un webhook de n8n como hoy hace Meta Ads (n8n está caído en esta sesión).
- **Autenticación:** sesión de Supabase; solo rol admin (Cielo). Cada llamada valida el usuario.
- **Token:** usuario del sistema con `ads_management` y permiso de **Anunciar** sobre la Página de cada marca (el error `OAuthException 10 / required_permission: Ads` ya apareció antes). Se usa el token por portafolio (Turismo Patagonia, Rafting Adventure, Brasil) según la cuenta elegida.
- **Algoritmo de edición:** `GET` del anuncio y su creatividad (`object_story_spec`, `asset_feed_spec`, `degrees_of_freedom_spec`, `url_tags`, `name`) → `POST /act_{id}/adcreatives` con los cambios → `POST /{ad_id}` con la creatividad nueva → `GET` de verificación. Nunca se borra la creatividad vieja (permite deshacer).
- **Estructura exacta del mensaje de bienvenida:** se confirma **leyendo un anuncio real** de click-a-WhatsApp antes de implementar (es el punto de mayor incertidumbre).
- **Auditoría:** tabla nueva en Supabase `meta_ads.ad_changes` (fecha, usuario, anuncio, cuenta, creatividad anterior y nueva, campos cambiados, resultado). Alimenta el botón de deshacer.
- **Confirmación obligatoria:** ningún cambio se aplica sin pantalla de «antes / después» y botón de confirmar.

## Tareas
- [x] 1. Leer la guía de Next.js 16 del repo y la estructura actual de `app/(dashboard)` y `lib/meta-ads` (hecho 23/10: `params` es una Promise, `RouteContext`, el `proxy.ts` redirige a /login sin sesión).
- [x] 2. **Lectura de prueba (hecha 2026-10-22):** en la cuenta `585100972496931` (Sergio ADC), conjunto pausado `120252415963630734` (campaña "RV", Rafting Villegas, Página `110106108818622`), anuncio "gral" `120252415963610734`, creatividad `1078504928221284`. **El mensaje de bienvenida vive en `object_story_spec.video_data.page_welcome_message`** (para anuncios de imagen, en `link_data`), como **texto JSON**: `{type:"VISUAL_EDITOR", version:2, landing_screen_type:"welcome_message", media_type:"text", text_format:{customer_action_type:"ice_breakers", message:{text, ice_breakers:[{title}…]}}, image_format/video_format:{customer_action_type:"quick_replies", message:{text, quick_replies:[{title,content_type}]…}}, welcome_message_edited, ice_breakers_edited, template_id…}`. Al editar hay que cambiar `text_format.message.text` y los `ice_breakers`, mantener sincronizados los `text` de `image_format` y `video_format`, y marcar `welcome_message_edited: true`. Al clonar la creatividad se deben conservar `degrees_of_freedom_spec` (~15 funciones Advantage+/mejoras con `enroll_status`) y `url_tags`. Cuenta Sergio ADC: 61 conjuntos de mensajes en el historial; el MCP oficial lista los anuncios pero NO expone `page_welcome_message` (se lee por Graph API).
- [x] 3. **Prueba de escritura (hecha 2026-10-22, con aprobación de Cielo):** token `crmmetaads` (`META_TOKEN_TURCENTRALPATAGONIA`), anuncio "TC | La cueva diurna" `120248868459430734` (cuenta `585100972496931`, campaña pausada, Página Tur Central). Ciclo completo OK: leer → clonar creatividad con el saludo cambiado → `POST /{ad_id}` `creative={creative_id}` → releer (saludo nuevo confirmado) → revertir a la original → releer (igual al original). **Aprendizajes para la implementación:** (a) hay que **quitar `standard_enhancements`** del `degrees_of_freedom_spec` al crear (Meta lo rechaza: obsoleto); (b) los anuncios de **varios destinos** (adset `MESSAGING_INSTAGRAM_DIRECT_MESSENGER_WHATSAPP`) tienen un `asset_feed_spec` (`optimization_type: DOF_MESSAGING_DESTINATION`, 3 `call_to_actions`) que **hay que copiar** a la creatividad nueva o Meta rechaza el re-apuntado ("debe tener degrees_of_freedom… varios destinos"); (c) sin Página con rol de anunciante, Meta rechaza con `code 10 / subcode 3858749` (pasó con Rafting Villegas); (d) tras re-apuntar el anuncio pasa a `IN_PROCESS` (revisión); (e) quedan creatividades de prueba sin borrar: `1410229337947498` (sin uso) y `3458231061026118`. **Tokens disponibles hoy:** `crmmetaads` solo puede anunciar en Tur Central (`109290265276027`) y Turismo Bariloche BR (`104172466066023`); Rafting/Brasil/Turismo Patagonia del `.env` no sirven para escribir creatividades. Script de referencia: `contexto/tm/meta-ads/agente-campanas/ref-clonar-creatividad-bienvenida.py`.
- [ ] 3b. Dar rol de **anunciante** a `crmmetaads` (o al usuario `admcrmmetaads-turismopatagonia`, con su token en el `.env`) en las Páginas de las demás marcas.
- [~] 4. Tabla de registro: **cambió a `platform.ad_changes`** (el esquema `platform` ya está expuesto y tiene `platform.is_admin()`), con RLS solo admin. Migración escrita en `supabase/migrations/20261023_platform_ad_changes.sql` (rama `feat/editor-anuncios`). **FALTA APLICARLA** en el Supabase `jvudavpopxsguiemtrkk` (requiere el OK de Cielo). Hallazgo aparte: 4 tablas de `meta_ads` (`ad_copy_pipeline`, `brand_meta_mapping`, `balance_alert_state`, `excursion_urls`) tienen RLS desactivado: cualquiera con la clave pública puede leerlas o modificarlas.
- [x] 5. (hecho 23/10, `lib/ads-editor/*` y `app/api/anuncios/*`; 26 comprobaciones de la lógica con creatividades reales OK, `tsc` y lint limpios, `next build` OK) Backend: Route Handlers `GET /api/anuncios` (listar), `GET /api/anuncios/[id]` (detalle), `POST /api/anuncios/[id]/preview` (calcula el «después» sin tocar Meta), `POST /api/anuncios/[id]/aplicar` y `POST /api/anuncios/[id]/deshacer`.
- [x] 6. (hecho 23/10, `components/anuncios/*`; ítem "Anuncios" en el menú, solo admin) Frontend `/anuncios`: selector de cuenta, lista de anuncios, panel de edición, vista antes/después y confirmación.
- [ ] 7. Prueba real con **un anuncio de prueba pausado** en una cuenta con pago, aplicando y luego deshaciendo.
- [x] 8. Rama `feat/editor-anuncios` subida (commit `7d456ea`, 23/10), sin PR ni merge: https://github.com/Cielo-Pmc01/Plataforma-TM/pull/new/feat/editor-anuncios. **Pendiente de Cielo:** crear el PR/merge, aplicar la migración y cargar los tokens `META_TOKEN_*` como variables de entorno de servidor en Dokploy (hoy el despliegue no las tiene).
- [ ] 9. Documentar en `contexto/tm/meta-ads/agente-campanas/playbook.md` y en la memoria.

## Criterio de éxito
Cielo edita el mensaje de bienvenida y el texto de un anuncio real desde la interfaz, ve el antes/después, confirma, y el anuncio conserva su ID con el contenido nuevo (verificado releyendo desde Meta). El botón de deshacer lo devuelve a la versión anterior. Todo queda registrado.

## Notas / riesgos
- **Mensaje de bienvenida:** la estructura puede variar entre WhatsApp, Messenger e Instagram. Se confirma en la tarea 2.
- **Permisos de Página:** si la Página no tiene el permiso de Anunciar, Meta rechaza la creatividad nueva (marcas CDR, ADVC, BE, TBBR, PBRS figuraban sin permiso en notas viejas; re-verificar).
- **Edición de un anuncio activo:** el anuncio puede volver a **revisión** de Meta al cambiar la creatividad. Avisarlo en pantalla.
- **Sin borrado de creatividades:** se acumulan en la biblioteca de la cuenta; limpieza manual si hiciera falta.
- **Costo/tiempo de aprobación:** el cambio de creatividad no cuesta, pero puede pausar la entrega unas horas.
- **Windsor:** sigue como respaldo mientras no esté probado.
- **Seguridad:** token solo en servidor; ninguna ruta sin sesión de admin; sin logs con tokens.
- **Decisión pendiente:** backend en Next.js (recomendado) o webhook de n8n.
